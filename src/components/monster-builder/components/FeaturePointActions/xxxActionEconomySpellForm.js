// components/FeaturePointActions/ActionEconomySpellForm.js
import React, { useState, useEffect } from 'react';
import { 
  CASTINGTIME, 
  ACTIONTYPE, 
  SAVINGTHROWS, 
  DURATION, 
  DAMAGETYPES, 
  CONDITIONS, 
  AREAOFEFFECT,
  RANGE_MULTIPLIERS,
  PRIMARYEFFECTTYPE,
  getPrimaryDamageForCR,
  getSecondaryDamageForCR
} from '../../constants/spell-parameters';

import {  MOVEMENT_TYPES } from '../../constants/srd-data';

// Recharge options and their magic point value
const RECHARGE_OPTIONS = [
  { value: "none", label: "None (At Will)", mpValue: 0 },
  { value: "recharge4-6", label: "Recharge 4-6", mpValue: 1 },
  { value: "recharge5-6", label: "Recharge 5-6", mpValue: 2 },
  { value: "recharge6", label: "Recharge 6", mpValue: 3 }
];

export function ActionEconomySpellForm({ onSubmit, availablePoints, monster, magicPoints, setMagicPoints }) {
  // Common fields for all spell types
  const [spellName, setSpellName] = useState('');
  const [castingTime, setCastingTime] = useState('action');
  const [duration, setDuration] = useState('instantaneous');
  const [description, setDescription] = useState('');
  const [rechargeOption, setRechargeOption] = useState('none');
  const [primaryEffectType, setPrimaryEffectType] = useState('Spell Attack');
  
  // Fields for spell attack
  const [actionType, setActionType] = useState('spell attack');
  const [savingThrow, setSavingThrow] = useState('DEX');
  const [primaryDamageType, setPrimaryDamageType] = useState('fire');
  const [secondaryEffect, setSecondaryEffect] = useState('none');
  const [areaOfEffect, setAreaOfEffect] = useState('');
  const [areaSize, setAreaSize] = useState(10);
  
  // Range (applies to multiple types)
  const [rangeMultiplier, setRangeMultiplier] = useState(1);
  
  // Fields for Defense spells
  const [defenseType, setDefenseType] = useState('ac');
  const [acBonus, setAcBonus] = useState(2);
  const [immunityCondition, setImmunityCondition] = useState('blinded');
  
  // Fields for Healing spells
  const [healingDice, setHealingDice] = useState(1);
  
  // Fields for Adjust Movement spells
  const [movementAction, setMovementAction] = useState('add');
  const [movementType, setMovementType] = useState('fly');
  
  // Fields for Control spells
  const [controlCondition, setControlCondition] = useState('charmed');
  const [controlSavingThrow, setControlSavingThrow] = useState('WIS');
  
  // Find highest movement speed for base range
  const baseRange = Math.max(
    ...monster.speed.map(s => s.value || 0),
    30 // Default to 30 if no movement values
  );
  
  // Calculate actual range based on multiplier
  const actualRange = baseRange * rangeMultiplier;

  // Count existing action economy spells and recharge abilities
  const actionEconomySpellCount = monster.features.filter(f => 
    f.costMagicPoint && (f.category === 'Actions' || f.category === 'Bonus Actions' || f.category === 'Reactions')
  ).length;
  
  const rechargeCount = monster.features.filter(f => 
    f.spellDetails && f.spellDetails.recharge && f.spellDetails.recharge !== 'none'
  ).length;

  // Calculate max spell limit based on proficiency bonus
  const maxActionEconomySpells = monster.proficiencyBonus * 2;
  
  // Check if we're at the recharge limit
  const atRechargeLimit = rechargeCount >= 2;
  
  // Check if we're at the action economy spell limit
  const atActionEconomySpellLimit = actionEconomySpellCount >= maxActionEconomySpells;

  // Get damage values based on CR and proficiency
  const primaryDamage = getPrimaryDamageForCR(monster.cr, monster.proficiencyBonus);
  const secondaryDamage = getSecondaryDamageForCR(monster.cr);
  
  // Check which movement types the monster already has
  const hasMovementType = (type) => {
    return monster.speed.some(s => s.type === type && s.value > 0);
  };

  // Handle area of effect changes and update action type accordingly
  useEffect(() => {
    // If area effect is selected, force saving throw
    if (areaOfEffect && primaryEffectType === 'Spell Attack') {
      setActionType('saving throw');
    }
  }, [areaOfEffect, primaryEffectType]);

  // Auto-adjust recharge if we're at the limit
  useEffect(() => {
    if (atRechargeLimit && rechargeOption !== 'none') {
      setRechargeOption('none');
    }
  }, [atRechargeLimit, rechargeOption]);

  // Calculate base magic point cost based on selected options and spell type
  const calculateBaseMagicPointCost = () => {
    let cost = 0;

    // Base cost by casting time (updated costs)
    if (castingTime === 'action') {
      cost += 2; // Action spells cost 2 MP
    } else if (castingTime === 'bonus action' || castingTime === 'reaction') {
      cost += 3; // Bonus action and reaction spells cost 3 MP
    }

    // Additional costs based on primary effect type
    switch (primaryEffectType) {
      case 'Spell Attack':
        // Area effects cost more
        if (areaOfEffect) {
          cost += 1;
        }
        
        // Secondary effects cost more
        if (secondaryEffect !== 'none') {
          cost += 1;
        }
        
        // Range costs
        const rangeOption = RANGE_MULTIPLIERS.find(r => r.value === rangeMultiplier);
        if (rangeOption) {
          cost += rangeOption.mpCost;
        }
        break;
        
      case 'Defense':
        if (defenseType === 'ac') {
          // First 2 AC is free, +1 MP per 2 additional AC
          cost += Math.max(0, Math.ceil((acBonus - 2) / 2));
        } else {
          // Condition immunity costs 2 MP
          cost += 2;
        }
        break;
        
      case 'Healing':
        // First d8 is included in base cost, +1 MP per additional d8
        cost += Math.max(0, healingDice - 1);
        break;
        
      case 'Adjust Movement':
        // Flat cost for movement adjustment
        cost += 1;
        break;
        
      case 'Control':
        // Base control cost already included in casting time cost
        // Range costs might apply
        const controlRangeOption = RANGE_MULTIPLIERS.find(r => r.value === rangeMultiplier);
        if (controlRangeOption) {
          cost += controlRangeOption.mpCost;
        }
        break;
        
      default:
        break;
    }

    return cost;
  };

  const baseMagicPointCost = calculateBaseMagicPointCost();
  
  // Find the selected recharge option
  const selectedRecharge = RECHARGE_OPTIONS.find(option => option.value === rechargeOption);
  
  // Calculate final cost after recharge discount
  const finalMagicPointCost = Math.max(1, baseMagicPointCost - selectedRecharge.mpValue);
  
  // Check if we have enough magic points
  const availableMagicPoints = magicPoints ? (magicPoints.total - magicPoints.used) : 0;
  const hasEnoughMagicPoints = availableMagicPoints >= finalMagicPointCost;

  // Helper function to get the correct category based on casting time
  const getCategoryFromCastingTime = (castingTime) => {
    switch(castingTime) {
      case 'bonus action':
        return 'Bonus Actions';
      case 'reaction':
        return 'Reactions';
      case 'action':
      default:
        return 'Actions';
    }
  };

  // Is the secondary effect a condition or damage type?
  const isSecondaryCondition = CONDITIONS.includes(secondaryEffect);
  const isSecondaryDamage = DAMAGETYPES.includes(secondaryEffect);

  // Function to generate spell description based on type
  const generateSpellDescription = () => {
    // Start with name and optional recharge
    let desc = `${spellName}. `;
    
    // Add recharge text if applicable
    if (rechargeOption !== 'none') {
      desc += rechargeOption === 'recharge4-6' 
        ? '(Recharge 4-6) ' 
        : rechargeOption === 'recharge5-6' 
          ? '(Recharge 5-6) ' 
          : '(Recharge 6) ';
    }
    
    // Add casting time
    desc += `${castingTime === 'action' ? 'Action' : castingTime === 'bonus action' ? 'Bonus Action' : 'Reaction'}: `;
    
    // Effect based on primary effect type
    switch (primaryEffectType) {
      case 'Spell Attack':
        if (actionType === 'spell attack') {
          desc += `The creature makes a spell attack against a target within ${actualRange} feet. On a hit, `;
        } else {
          desc += `The target must make a ${savingThrow} saving throw. `;
          
          if (areaOfEffect) {
            desc += `Each creature in a ${areaSize}-foot ${areaOfEffect} within ${actualRange} feet must make the save. `;
          }
          
          desc += `On a failed save, `;
        }

        if (!areaOfEffect) {
          desc += `the target takes ${primaryDamage.dice} ${primaryDamageType} damage`;
        } else {
          desc += `a creature takes ${primaryDamage.dice} ${primaryDamageType} damage`;
        }
        
        if (actionType === 'saving throw') {
          desc += ` or half as much on a successful save`;
        }
        
        if (isSecondaryCondition) {
          desc += ` and is ${secondaryEffect}`;
          
          if (duration !== 'instantaneous') {
            desc += ` for the duration`;
          }
        } else if (isSecondaryDamage) {
          desc += ` plus ${secondaryDamage.dice} ${secondaryEffect} damage`;
        }
        break;
        
      case 'Defense':
        if (defenseType === 'ac') {
          desc += `The creature gains a +${acBonus} bonus to its AC`;
        } else {
          desc += `The creature becomes immune to the ${immunityCondition} condition`;
        }
        
        if (duration !== 'instantaneous') {
          desc += ` for the duration`;
        }
        break;
        
      case 'Healing':
        desc += `The creature regains ${healingDice}d8 hit points`;
        break;
        
      case 'Adjust Movement':
        if (movementAction === 'double') {
          desc += `The creature's ${movementType} speed is doubled`;
        } else {
          desc += `The creature gains a ${movementType} speed of 30 feet`;
        }
        
        if (duration !== 'instantaneous') {
          desc += ` for the duration`;
        }
        break;
        
      case 'Control':
        desc += `One creature within ${actualRange} feet must succeed on a ${controlSavingThrow} saving throw or be ${controlCondition}`;
        
        if (duration !== 'instantaneous') {
          desc += ` for the duration`;
        }
        break;
        
      default:
        break;
    }
    
    desc += `.`;
    
    // Add duration if not instantaneous and not already added
    if (duration !== 'instantaneous' && !desc.includes('for the duration')) {
      desc += ` Duration: ${duration}.`;
    }
    
    // Add any additional description
    if (description) {
      desc += ` ${description}`;
    }
    
    return desc;
  };

  const handleSubmit = () => {
    if (!spellName || !hasEnoughMagicPoints || atActionEconomySpellLimit) return;

    // Build spell description
    const spellDescription = generateSpellDescription();

    // Get the proper category based on casting time
    const category = getCategoryFromCastingTime(castingTime);

    // Create the base spell object
    const newSpell = {
      name: spellName,
      category: category,
      description: spellDescription,
      costFeaturePoint: false,
      costMagicPoint: true,
      magicPointCost: finalMagicPointCost,
      spellDetails: {
        primaryEffectType,
        castingTime,
        duration,
        recharge: rechargeOption !== 'none' ? rechargeOption : null
      }
    };
    
    // Add type-specific details
    switch (primaryEffectType) {
      case 'Spell Attack':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          actionType,
          savingThrow: actionType === 'saving throw' ? savingThrow : null,
          primaryDamageType,
          primaryDamageDice: primaryDamage.dice,
          secondaryEffect: secondaryEffect !== 'none' ? secondaryEffect : null,
          secondaryDamageDice: isSecondaryDamage ? secondaryDamage.dice : null,
          areaOfEffect: areaOfEffect || null,
          areaSize: areaOfEffect ? areaSize : null,
          range: actualRange,
          rangeMultiplier: rangeMultiplier
        };
        break;
        
      case 'Defense':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          defenseType,
          acBonus: defenseType === 'ac' ? acBonus : null,
          immunityCondition: defenseType === 'immunity' ? immunityCondition : null
        };
        break;
        
      case 'Healing':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          healingDice
        };
        break;
        
      case 'Adjust Movement':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          movementAction,
          movementType
        };
        break;
        
      case 'Control':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          controlCondition,
          controlSavingThrow,
          range: actualRange,
          rangeMultiplier: rangeMultiplier
        };
        break;
        
      default:
        break;
    }

    // Update magic points in parent component
    if (setMagicPoints && magicPoints) {
      setMagicPoints({
        ...magicPoints,
        used: magicPoints.used + finalMagicPointCost
      });
    }

    onSubmit(newSpell);
  };

  // Helper function to check if a value exists in an array
  const isInArray = (array, value) => array.includes(value);

  // Render spell-specific form fields based on primary effect type
  const renderEffectSpecificFields = () => {
    switch (primaryEffectType) {
      case 'Spell Attack':
        return (
          <>
            {/* Area of Effect */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Area of Effect (Optional)
              </label>
              <select
                className="w-full p-2 border rounded"
                value={areaOfEffect}
                onChange={(e) => setAreaOfEffect(e.target.value)}
                disabled={atActionEconomySpellLimit}
              >
                <option value="">None (Single Target)</option>
                {AREAOFEFFECT.map((area) => (
                  <option key={area} value={area}>
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </option>
                ))}
              </select>
              {areaOfEffect && (
                <p className="text-xs text-gray-500 mt-1">
                  Adding an area effect costs +1 magic point and requires a saving throw
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
                  disabled={atActionEconomySpellLimit}
                />
              </div>
            )}

            {/* Action Type - disabled if area effect is selected */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Action Type
              </label>
              <select
                className="w-full p-2 border rounded"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                disabled={!!areaOfEffect || atActionEconomySpellLimit} // Disable if area effect is selected
              >
                {ACTIONTYPE.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {areaOfEffect && (
                <p className="text-xs text-gray-500 mt-1">
                  Area effects always use saving throws
                </p>
              )}
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
                  disabled={atActionEconomySpellLimit}
                >
                  {SAVINGTHROWS.map((save) => (
                    <option key={save} value={save}>
                      {save}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Primary Damage Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Primary Damage Type
              </label>
              <select
                className="w-full p-2 border rounded"
                value={primaryDamageType}
                onChange={(e) => setPrimaryDamageType(e.target.value)}
                disabled={atActionEconomySpellLimit}
              >
                {DAMAGETYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Damage: {primaryDamage.dice} ({primaryDamage.average} avg)
              </p>
            </div>

            {/* Secondary Effect (combined damage types and conditions) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Secondary Effect (Optional)
              </label>
              <select
                className="w-full p-2 border rounded"
                value={secondaryEffect}
                onChange={(e) => setSecondaryEffect(e.target.value)}
                disabled={atActionEconomySpellLimit}
              >
                <option value="none">None</option>
                <optgroup label="Additional Damage">
                  {DAMAGETYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Damage
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Conditions">
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                    {cond.charAt(0).toUpperCase() + cond.slice(1)} Condition
                  </option>
                ))}
              </optgroup>
            </select>
            {secondaryEffect !== 'none' && (
              <p className="text-xs text-gray-500 mt-1">
                Adding a secondary effect costs +1 magic point
                {isInArray(DAMAGETYPES, secondaryEffect) && 
                ` | Damage: ${secondaryDamage.dice} (${secondaryDamage.average} avg)`}
              </p>
            )}
          </div>
        </>
      );
      
    case 'Defense':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              Defense Type
            </label>
            <select
              className="w-full p-2 border rounded"
              value={defenseType}
              onChange={(e) => setDefenseType(e.target.value)}
              disabled={atActionEconomySpellLimit}
            >
              <option value="ac">AC Bonus</option>
              <option value="immunity">Condition Immunity</option>
            </select>
          </div>
          
          {defenseType === 'ac' ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                AC Bonus
              </label>
              <select
                className="w-full p-2 border rounded"
                value={acBonus}
                onChange={(e) => setAcBonus(parseInt(e.target.value))}
                disabled={atActionEconomySpellLimit}
              >
                <option value={2}>+2 AC (Free)</option>
                <option value={4}>+4 AC (+1 MP)</option>
                <option value={6}>+6 AC (+2 MP)</option>
                <option value={8}>+8 AC (+3 MP)</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                First +2 AC is free, each additional +2 costs 1 MP
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">
                Condition Immunity
              </label>
              <select
                className="w-full p-2 border rounded"
                value={immunityCondition}
                onChange={(e) => setImmunityCondition(e.target.value)}
                disabled={atActionEconomySpellLimit}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond.charAt(0).toUpperCase() + cond.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Condition immunity costs 2 MP
              </p>
            </div>
          )}
        </>
      );
      
    case 'Healing':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">
            Healing Amount
          </label>
          <select
            className="w-full p-2 border rounded"
            value={healingDice}
            onChange={(e) => setHealingDice(parseInt(e.target.value))}
            disabled={atActionEconomySpellLimit}
          >
            <option value={1}>1d8 (Free)</option>
            <option value={2}>2d8 (+1 MP)</option>
            <option value={3}>3d8 (+2 MP)</option>
            <option value={4}>4d8 (+3 MP)</option>
            <option value={5}>5d8 (+4 MP)</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            First 1d8 is free, each additional 1d8 costs 1 MP (up to 5d8 total)
          </p>
        </div>
      );
      
    case 'Adjust Movement':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              Movement Action
            </label>
            <select
              className="w-full p-2 border rounded"
              value={movementAction}
              onChange={(e) => setMovementAction(e.target.value)}
              disabled={atActionEconomySpellLimit}
            >
              <option value="add">Add New Movement Type</option>
              <option value="double">Double Existing Movement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Movement Type
            </label>
            <select
              className="w-full p-2 border rounded"
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              disabled={atActionEconomySpellLimit}
            >
              {MOVEMENT_TYPES.map(type => (
                <option 
                  key={type} 
                  value={type}
                  disabled={movementAction === 'double' && !hasMovementType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {movementAction === 'double' ? 
                    (hasMovementType(type) ? ` (${monster.speed.find(s => s.type === type)?.value || 0} ft.)` : ' (Not Available)') : 
                    ' (30 ft.)'}
                </option>
              ))}
            </select>
            {movementAction === 'double' && (
              <p className="text-xs text-gray-600 mt-1">
                Can only double movement types the creature already has
              </p>
            )}
          </div>
        </>
      );
      
    case 'Control':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              Saving Throw
            </label>
            <select
              className="w-full p-2 border rounded"
              value={controlSavingThrow}
              onChange={(e) => setControlSavingThrow(e.target.value)}
              disabled={atActionEconomySpellLimit}
            >
              {SAVINGTHROWS.map((save) => (
                <option key={save} value={save}>
                  {save}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Applied Condition
            </label>
            <select
              className="w-full p-2 border rounded"
              value={controlCondition}
              onChange={(e) => setControlCondition(e.target.value)}
              disabled={atActionEconomySpellLimit}
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Range for Control spells */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Range
            </label>
            <select
              className="w-full p-2 border rounded"
              value={rangeMultiplier}
              onChange={(e) => setRangeMultiplier(parseInt(e.target.value, 10))}
              disabled={atActionEconomySpellLimit}
            >
              {RANGE_MULTIPLIERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({baseRange * option.value} ft.) {option.mpCost > 0 ? `+${option.mpCost} MP` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Base range: {baseRange} ft. (highest movement speed)
            </p>
          </div>
        </>
      );
      
    default:
      return null;
  }
};

return (
  <div className="space-y-4 mt-4">
    <h3 className="font-semibold">Add Action Economy Spell</h3>

    {/* Action Economy Spell Limit Warning */}
    {atActionEconomySpellLimit && (
      <div className="bg-red-50 p-3 rounded border border-red-200 mb-4">
        <h4 className="font-medium text-red-800">Maximum Spells Reached</h4>
        <p className="text-sm text-red-600">
          This monster can only have {maxActionEconomySpells} action economy spells 
          (twice its proficiency bonus of {monster.proficiencyBonus}).
        </p>
      </div>
    )}

    {/* Magic Points Info */}
    <div className="bg-blue-50 p-3 rounded border border-blue-200">
      <h4 className="font-medium text-blue-800">Magic Points</h4>
      <div className="text-sm text-blue-600 flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Base Cost:</span>
          <span>{baseMagicPointCost}</span>
        </div>
        <div className="flex justify-between">
          <span>Recharge Discount:</span>
          <span>-{selectedRecharge.mpValue}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Final Cost:</span>
          <span>{finalMagicPointCost}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-blue-200">
          <span>Available:</span>
          <span>{availableMagicPoints}</span>
        </div>
      </div>
      {!hasEnoughMagicPoints && (
        <p className="text-xs text-red-600 mt-2">
          Not enough magic points available
        </p>
      )}
      <div className="text-xs text-gray-600 mt-2">
        <p>Spell Count: {actionEconomySpellCount}/{maxActionEconomySpells}</p>
        <p>Recharge Abilities: {rechargeCount}/2</p>
      </div>
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
        disabled={atActionEconomySpellLimit}
      />
    </div>

    {/* Primary Effect Type */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Primary Effect Type
      </label>
      <select
        className="w-full p-2 border rounded"
        value={primaryEffectType}
        onChange={(e) => setPrimaryEffectType(e.target.value)}
        disabled={atActionEconomySpellLimit}
      >
        {PRIMARYEFFECTTYPE.map((type) => (
          <option key={type} value={type}>
            {type}
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
        disabled={atActionEconomySpellLimit}
      >
        {CASTINGTIME.map((time) => (
          <option key={time} value={time}>
            {time.charAt(0).toUpperCase() + time.slice(1)}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-600 mt-1">
        Action: 2 MP | Bonus Action/Reaction: 3 MP
      </p>
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
        disabled={atActionEconomySpellLimit}
      >
        {DURATION.map((dur) => (
          <option key={dur} value={dur}>
            {dur.charAt(0).toUpperCase() + dur.slice(1)}
          </option>
        ))}
      </select>
    </div>

    {/* Range (only for Spell Attack and Control types) */}
    {(primaryEffectType === 'Spell Attack') && (
      <div>
        <label className="block text-sm font-medium mb-1">
          Range
        </label>
        <select
          className="w-full p-2 border rounded"
          value={rangeMultiplier}
          onChange={(e) => setRangeMultiplier(parseInt(e.target.value, 10))}
          disabled={atActionEconomySpellLimit}
        >
          {RANGE_MULTIPLIERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({baseRange * option.value} ft.) {option.mpCost > 0 ? `+${option.mpCost} MP` : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-1">
          Base range: {baseRange} ft. (highest movement speed)
        </p>
      </div>
    )}

    {/* Render effect-specific fields */}
    {renderEffectSpecificFields()}

    {/* Recharge Options */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Recharge Option
      </label>
      <select
        className="w-full p-2 border rounded"
        value={rechargeOption}
        onChange={(e) => setRechargeOption(e.target.value)}
        disabled={atRechargeLimit || atActionEconomySpellLimit}
      >
        {RECHARGE_OPTIONS.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.value !== 'none' && atRechargeLimit}
          >
            {option.label} ({option.mpValue > 0 ? `-${option.mpValue} MP` : 'No discount'})
          </option>
        ))}
      </select>
      {rechargeOption !== 'none' && (
        <p className="text-xs text-gray-500 mt-1">
          Reduces magic point cost by {selectedRecharge.mpValue} (minimum cost of 1 MP)
        </p>
      )}
      {atRechargeLimit && rechargeOption === 'none' && (
        <p className="text-xs text-red-500 mt-1">
          This monster already has 2 recharge abilities (maximum allowed)
        </p>
      )}
    </div>

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
        disabled={atActionEconomySpellLimit}
      />
    </div>

    {/* Preview */}
    <div className="bg-gray-50 p-3 rounded border">
      <h4 className="font-medium">Spell Preview</h4>
      <div className="text-sm mt-1">
        <strong>{spellName || "[Spell Name]"}</strong>
        {rechargeOption !== 'none' && (
          <span className="font-medium ml-1">
            ({rechargeOption === 'recharge4-6' 
              ? 'Recharge 4-6' 
              : rechargeOption === 'recharge5-6' 
                ? 'Recharge 5-6' 
                : 'Recharge 6'})
          </span>
        )}
        <p className="mt-1">
          {generateSpellDescription()}
        </p>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Will appear in: <span className="font-medium">{getCategoryFromCastingTime(castingTime)}</span> section
      </div>
    </div>

    <button 
      onClick={handleSubmit}
      disabled={!spellName || !hasEnoughMagicPoints || atActionEconomySpellLimit}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      {atActionEconomySpellLimit 
        ? "Maximum Spells Reached" 
        : `Add Spell (-${finalMagicPointCost} Magic ${finalMagicPointCost === 1 ? 'Point' : 'Points'})`}
    </button>
  </div>
);
}