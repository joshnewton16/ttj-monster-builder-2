// components/FeaturePointActions/ActionEconomySpellForm.js
import React, { useState } from 'react';
import { 
  CASTINGTIME, 
  ACTIONTYPE, 
  SAVINGTHROWS, 
  DURATION, 
  DAMAGETYPES, 
  CONDITIONS, 
  AREAOFEFFECT 
} from '../../constants/spell-parameters';

export function ActionEconomySpellForm({ onSubmit, availablePoints, monster, magicPoints }) {
  const [spellName, setSpellName] = useState('');
  const [castingTime, setCastingTime] = useState('action');
  const [actionType, setActionType] = useState('spell attack');
  const [savingThrow, setSavingThrow] = useState('DEX');
  const [duration, setDuration] = useState('instantaneous');
  const [damageType, setDamageType] = useState('fire');
  const [condition, setCondition] = useState('');
  const [areaOfEffect, setAreaOfEffect] = useState('');
  const [areaSize, setAreaSize] = useState(10);
  const [spellLevel, setSpellLevel] = useState(1);
  const [description, setDescription] = useState('');

  // Calculate magic point cost based on selected options
  const calculateMagicPointCost = () => {
    let cost = 1; // Base cost

    // Higher spell levels cost more
    cost += (spellLevel - 1);

    // Area effects cost more
    if (areaOfEffect) {
      cost += 1;
    }

    // Conditions cost more
    if (condition) {
      cost += 1;
    }

    // Bonus actions and reactions cost more
    if (castingTime === 'bonus action' || castingTime === 'reaction') {
      cost += 1;
    }

    return cost;
  };

  const magicPointCost = calculateMagicPointCost();
  
  // Check if we have enough magic points
  const availableMagicPoints = magicPoints ? (magicPoints.total - magicPoints.used) : 0;
  const hasEnoughMagicPoints = availableMagicPoints >= magicPointCost;

  const handleSubmit = () => {
    if (!spellName || !hasEnoughMagicPoints) return;

    // Build spell description
    let spellDescription = `${spellName} (${spellLevel}${getOrdinalSuffix(spellLevel)} level). `;
    spellDescription += `${castingTime === 'action' ? 'Action' : castingTime === 'bonus action' ? 'Bonus Action' : 'Reaction'}: `;
    
    if (actionType === 'spell attack') {
      spellDescription += `The creature makes a spell attack against a target. On a hit, `;
    } else {
      spellDescription += `The target must make a ${savingThrow} saving throw. On a failed save, `;
    }

    if (areaOfEffect) {
      spellDescription += `Each creature in a ${areaSize}-foot ${areaOfEffect} `;
    }

    spellDescription += `takes ${Math.floor(spellLevel * 1.5) + 1}d6 ${damageType} damage`;
    
    if (actionType === 'saving throw') {
      spellDescription += ` or half as much on a successful save`;
    }
    
    if (condition) {
      spellDescription += ` and is ${condition}`;
      
      if (duration !== 'instantaneous') {
        spellDescription += ` for the duration`;
      }
    }
    
    spellDescription += `. ${duration !== 'instantaneous' ? `Duration: ${duration}` : ''}`;

    if (description) {
      spellDescription += ` ${description}`;
    }

    const newSpell = {
      name: spellName,
      category: 'Actions',
      description: spellDescription,
      costFeaturePoint: false,
      costMagicPoint: true,
      magicPointCost: magicPointCost,
      spellDetails: {
        level: spellLevel,
        castingTime,
        actionType,
        savingThrow: actionType === 'saving throw' ? savingThrow : null,
        duration,
        damageType,
        condition: condition || null,
        areaOfEffect: areaOfEffect || null,
        areaSize: areaOfEffect ? areaSize : null
      }
    };

    onSubmit(newSpell);
  };

  // Helper function to get ordinal suffix for spell level
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold">Add Action Economy Spell</h3>

      {/* Magic Points Info */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h4 className="font-medium text-blue-800">Magic Points Required</h4>
        <p className="text-sm text-blue-600">
          Cost: {magicPointCost} | Available: {availableMagicPoints}
        </p>
        {!hasEnoughMagicPoints && (
          <p className="text-xs text-red-600 mt-1">
            Not enough magic points available
          </p>
        )}
      </div>

      {/* Spell Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spell Name
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={spellName}
          onChange={(e) => setSpellName(e.target.value)}
          placeholder="Enter spell name"
        />
      </div>

      {/* Spell Level */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spell Level
        </label>
        <select
          className="w-full p-2 border rounded"
          value={spellLevel}
          onChange={(e) => setSpellLevel(parseInt(e.target.value, 10))}
        >
          {[...Array(5)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Level {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Casting Time */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Casting Time
        </label>
        <select
          className="w-full p-2 border rounded"
          value={castingTime}
          onChange={(e) => setCastingTime(e.target.value)}
        >
          {CASTINGTIME.map((time) => (
            <option key={time} value={time}>
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </option>
          ))}
        </select>
        {(castingTime === 'bonus action' || castingTime === 'reaction') && (
          <p className="text-xs text-gray-500 mt-1">
            Bonus actions and reactions cost +1 magic point
          </p>
        )}
      </div>

      {/* Action Type */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Action Type
        </label>
        <select
          className="w-full p-2 border rounded"
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        >
          {ACTIONTYPE.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Saving Throw (only if actionType is saving throw) */}
      {actionType === 'saving throw' && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Saving Throw
          </label>
          <select
            className="w-full p-2 border rounded"
            value={savingThrow}
            onChange={(e) => setSavingThrow(e.target.value)}
          >
            {SAVINGTHROWS.map((save) => (
              <option key={save} value={save}>
                {save}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Damage Type */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Damage Type
        </label>
        <select
          className="w-full p-2 border rounded"
          value={damageType}
          onChange={(e) => setDamageType(e.target.value)}
        >
          {DAMAGETYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Duration
        </label>
        <select
          className="w-full p-2 border rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          {DURATION.map((dur) => (
            <option key={dur} value={dur}>
              {dur.charAt(0).toUpperCase() + dur.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Condition (Optional)
        </label>
        <select
          className="w-full p-2 border rounded"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">None</option>
          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond.charAt(0).toUpperCase() + cond.slice(1)}
            </option>
          ))}
        </select>
        {condition && (
          <p className="text-xs text-gray-500 mt-1">
            Adding a condition costs +1 magic point
          </p>
        )}
      </div>

      {/* Area of Effect */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Area of Effect (Optional)
        </label>
        <select
          className="w-full p-2 border rounded"
          value={areaOfEffect}
          onChange={(e) => setAreaOfEffect(e.target.value)}
        >
          <option value="">None</option>
          {AREAOFEFFECT.map((area) => (
            <option key={area} value={area}>
              {area.charAt(0).toUpperCase() + area.slice(1)}
            </option>
          ))}
        </select>
        {areaOfEffect && (
          <p className="text-xs text-gray-500 mt-1">
            Adding an area effect costs +1 magic point
          </p>
        )}
      </div>

      {/* Area Size (only if areaOfEffect is selected) */}
      {areaOfEffect && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Area Size (feet)
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={areaSize}
            onChange={(e) => setAreaSize(parseInt(e.target.value, 10))}
            min="5"
            max="60"
            step="5"
          />
        </div>
      )}

      {/* Additional Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Additional Description (Optional)
        </label>
        <textarea
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          placeholder="Add any additional spell effects or details"
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 p-3 rounded border">
        <h4 className="font-medium">Spell Preview</h4>
        <div className="text-sm mt-1">
          <strong>{spellName || "[Spell Name]"}</strong> ({spellLevel}{getOrdinalSuffix(spellLevel)} level)
          <p className="mt-1">
            {castingTime === 'action' ? 'Action' : castingTime === 'bonus action' ? 'Bonus Action' : 'Reaction'}: {' '}
            {actionType === 'spell attack' 
              ? "The creature makes a spell attack against a target. On a hit, " 
              : `The target must make a ${savingThrow} saving throw. On a failed save, `}
            {areaOfEffect && `each creature in a ${areaSize}-foot ${areaOfEffect} `}
            takes {Math.floor(spellLevel * 1.5) + 1}d6 {damageType} damage
            {actionType === 'saving throw' && " or half as much on a successful save"}
            {condition && ` and is ${condition}`}
            {condition && duration !== 'instantaneous' && " for the duration"}
            .
            {duration !== 'instantaneous' ? ` Duration: ${duration}` : ''}
            {description && ` ${description}`}
          </p>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!spellName || !hasEnoughMagicPoints}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Spell (-{magicPointCost} Magic {magicPointCost === 1 ? 'Point' : 'Points'})
      </button>
    </div>
  );
}