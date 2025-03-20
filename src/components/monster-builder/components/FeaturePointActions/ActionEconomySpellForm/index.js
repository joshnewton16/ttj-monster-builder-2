// components/FeaturePointActions/ActionEconomySpellForm/index.js
import React, { useState, useEffect } from 'react';
import { 
  getPrimaryDamageForCR,
  getSecondaryDamageForCR
} from '../../../constants/spell-parameters';

import CommonFields from './CommonFields';
import SpellPreview from './SpellPreview';
import { InfoBoxes } from './InfoBoxes';

// Import spell type-specific field components
import SpellAttackFields from './SpellTypeFields/SpellAttackFields';
import DefenseFields from './SpellTypeFields/DefenseFields';
import HealingFields from './SpellTypeFields/HealingFields';
import AdjustMovementFields from './SpellTypeFields/AdjustMovementFields';
import ControlFields from './SpellTypeFields/ControlFields';

// Import utility functions
import { 
  calculateBaseMagicPointCost, 
  calculateFinalMagicPointCost 
} from './utils/costCalculations';
import { generateSpellDescription } from './utils/descriptionGenerators';
import { 
  getCategoryFromCastingTime,
  getBaseRange,
  getRechargeById,
  isSecondaryDamage
} from './utils/helpers';

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
  const [rangeMultiplier, setRangeMultiplier] = useState(1);
  
  // Type-specific state - these will be managed in the parent component
  // but modified by child components
  
  // Spell Attack state
  const [actionType, setActionType] = useState('spell attack');
  const [savingThrow, setSavingThrow] = useState('DEX');
  const [primaryDamageType, setPrimaryDamageType] = useState('fire');
  const [secondaryEffect, setSecondaryEffect] = useState('none');
  const [areaOfEffect, setAreaOfEffect] = useState('');
  const [areaSize, setAreaSize] = useState(10);
  
  // Defense state
  const [defenseType, setDefenseType] = useState('ac');
  const [acBonus, setAcBonus] = useState(2);
  const [immunityCondition, setImmunityCondition] = useState('blinded');
  const [defenseDuration, setDefenseDuration] = useState('next-turn');
  
  // Healing state
  const [healingDice, setHealingDice] = useState(1);
  
  // Movement state
  const [movementAction, setMovementAction] = useState('add');
  const [movementType, setMovementType] = useState('fly');
  
  // Control state
  const [controlCondition, setControlCondition] = useState('charmed');
  const [controlSavingThrow, setControlSavingThrow] = useState('WIS');
  
  // Find highest movement speed for base range
  const baseRange = getBaseRange(monster);
  
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

  // Calculate base magic point cost 

  const baseMagicPointCost=2;
  const featureMagicPointCost = calculateBaseMagicPointCost({
    castingTime,
    primaryEffectType,
    areaOfEffect,
    secondaryEffect,
    rangeMultiplier,
    defenseType,
    acBonus,
    healingDice,
    defenseDuration,
    duration,
    areaSize // Add this parameter
  });
  
  // Find the selected recharge option
  const selectedRecharge = getRechargeById(RECHARGE_OPTIONS, rechargeOption);
  
  // Calculate final cost after recharge discount
  const finalMagicPointCost = calculateFinalMagicPointCost(baseMagicPointCost,featureMagicPointCost, selectedRecharge.mpValue);
  
  // Check if we have enough magic points
  const availableMagicPoints = magicPoints ? (magicPoints.total - magicPoints.used) : 0;
  const hasEnoughMagicPoints = availableMagicPoints >= finalMagicPointCost;

  // Generate spell description
  const spellDescription = generateSpellDescription({
    spellName,
    rechargeOption,
    castingTime,
    primaryEffectType,
    actionType,
    savingThrow,
    areaOfEffect,
    areaSize,
    primaryDamageType,
    secondaryEffect,
    duration,
    actualRange,
    defenseType,
    acBonus,
    immunityCondition,
    healingDice,
    movementAction,
    movementType,
    controlSavingThrow,
    controlCondition,
    description,
    monster
  });

  const handleSubmit = () => {
    if (!spellName || !hasEnoughMagicPoints || atActionEconomySpellLimit) return;

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
    
    // Add type-specific details based on primary effect type
    switch (primaryEffectType) {
      case 'Spell Attack':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          actionType,
          savingThrow: actionType === 'saving throw' ? savingThrow : null,
          primaryDamageType,
          primaryDamageDice: getPrimaryDamageForCR(monster.cr, monster.proficiencyBonus).dice,
          secondaryEffect: secondaryEffect !== 'none' ? secondaryEffect : null,
          secondaryDamageDice: isSecondaryDamage(secondaryEffect) ? 
            getSecondaryDamageForCR(monster.cr).dice : null,
          areaOfEffect: areaOfEffect || null,
          areaSize: areaOfEffect ? areaSize : null,
          range: actualRange,
          rangeMultiplier: rangeMultiplier
        };

        newSpell.damage = `${newSpell.spellDetails.primaryDamageDice} ${primaryDamageType}`;
        break;
        
      case 'Defense':
        newSpell.spellDetails = {
          ...newSpell.spellDetails,
          defenseType,
          acBonus: defenseType === 'ac' ? acBonus : null,
          immunityCondition: defenseType === 'immunity' ? immunityCondition : null,
          defenseDuration // Add this line
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

  // Render the specific fields based on the selected primary effect type
  const renderEffectSpecificFields = () => {
    switch (primaryEffectType) {
      case 'Spell Attack':
        return (
          <SpellAttackFields
            actionType={actionType}
            setActionType={setActionType}
            savingThrow={savingThrow}
            setSavingThrow={setSavingThrow}
            primaryDamageType={primaryDamageType}
            setPrimaryDamageType={setPrimaryDamageType}
            secondaryEffect={secondaryEffect}
            setSecondaryEffect={setSecondaryEffect}
            areaOfEffect={areaOfEffect}
            setAreaOfEffect={setAreaOfEffect}
            areaSize={areaSize}
            setAreaSize={setAreaSize}
            rangeMultiplier={rangeMultiplier}
            setRangeMultiplier={setRangeMultiplier}
            baseRange={baseRange}
            disabled={atActionEconomySpellLimit}
            monster={monster}
          />
        );
      case 'Defense':
        return (
          <DefenseFields
            defenseType={defenseType}
            setDefenseType={setDefenseType}
            acBonus={acBonus}
            setAcBonus={setAcBonus}
            immunityCondition={immunityCondition}
            setImmunityCondition={setImmunityCondition}
            defenseDuration={defenseDuration} // Add this prop
            setDefenseDuration={setDefenseDuration} // Add this prop
            disabled={atActionEconomySpellLimit}
          />
        );
      case 'Healing':
        return (
          <HealingFields
            healingDice={healingDice}
            setHealingDice={setHealingDice}
            disabled={atActionEconomySpellLimit}
          />
        );
      case 'Adjust Movement':
        return (
          <AdjustMovementFields
            movementAction={movementAction}
            setMovementAction={setMovementAction}
            movementType={movementType}
            setMovementType={setMovementType}
            hasMovementType={hasMovementType}
            monster={monster}
            disabled={atActionEconomySpellLimit}
          />
        );
      case 'Control':
        return (
          <ControlFields
            controlSavingThrow={controlSavingThrow}
            setControlSavingThrow={setControlSavingThrow}
            controlCondition={controlCondition}
            setControlCondition={setControlCondition}
            rangeMultiplier={rangeMultiplier}
            setRangeMultiplier={setRangeMultiplier}
            baseRange={baseRange}
            disabled={atActionEconomySpellLimit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold">Add Action Economy Spell</h3>

      {/* Info and warning boxes */}
      <InfoBoxes
        atActionEconomySpellLimit={atActionEconomySpellLimit}
        maxActionEconomySpells={maxActionEconomySpells}
        monster={monster}
        baseMagicPointCost={baseMagicPointCost}
        featureMagicPointCost={featureMagicPointCost}
        selectedRecharge={selectedRecharge}
        finalMagicPointCost={finalMagicPointCost}
        availableMagicPoints={availableMagicPoints}
        hasEnoughMagicPoints={hasEnoughMagicPoints}
        actionEconomySpellCount={actionEconomySpellCount}
        rechargeCount={rechargeCount}
      />

      {/* Common form fields */}
      <CommonFields
        spellName={spellName}
        setSpellName={setSpellName}
        primaryEffectType={primaryEffectType}
        setPrimaryEffectType={setPrimaryEffectType}
        castingTime={castingTime}
        setCastingTime={setCastingTime}
        duration={duration}
        setDuration={setDuration}
        disabled={atActionEconomySpellLimit}
      />

      {/* Effect-specific fields */}
      {renderEffectSpecificFields()}

      {/* Recharge Options */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Recharge Option
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
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
        </div>
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
        <div>
          <textarea
            className="w-1/2 p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Add any additional spell effects or details"
            disabled={atActionEconomySpellLimit}
          />
        </div>
      </div>

      {/* Spell Preview */}
      <SpellPreview
        spellName={spellName}
        rechargeOption={rechargeOption}
        spellDescription={spellDescription}
        castingTime={castingTime}
      />

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

export default ActionEconomySpellForm;