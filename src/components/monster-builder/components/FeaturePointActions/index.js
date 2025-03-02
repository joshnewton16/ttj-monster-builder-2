// components/FeaturePointActions/index.js
import React, { useState } from 'react';
import { BaseActionForm } from './BaseActionForm';
import { BaseFeatureForm } from './BaseFeatureForm';
import { MultiattackAction } from './MultiattackAction';
import { SecondaryEffects } from './SecondaryEffects';
import { DoubleDamageAction } from './DoubleDamageAction';
import { MovementAction } from './MovementAction';
import { SkillAction } from './SkillAction';
import { DefenseModifications } from './DefenseModifications';
import { SpellcastingForm } from './SpellcastingForm';
import { ActionEconomySpellForm } from './ActionEconomySpellForm'; // Adjusted import
import { SenseAction } from './SenseAction';
import { LEGENDARYACTIONS } from '../../constants/srd-data';

export function FeaturePointActions({
  existingAttacks,
  multiattackCount,
  monster,
  onBaseActionSubmit,
  hasFirstAction,
  onFeatureSubmit,
  hasFirstFeature,
  onMultiattack,
  onSecondaryEffect,
  onDoubleDamage,
  onMovementModify,
  onSkillModify,
  onImmunityModify,
  onResistanceModify,
  onSenseModify,
  availablePoints,
  magicPoints,
  setMagicPoints
}) {
  const [selectedAction, setSelectedAction] = useState('');

  // Check if the monster has spellcasting
  const hasSpellcasting = monster.features.some(
    feature => feature.name === 'Spellcasting'
  );

  // Wrap each handler to reset the selectedAction after completion
  const handleBaseAction = (actionData) => {
    onBaseActionSubmit(actionData);
    setSelectedAction('');
  };

  const handleFeatureSubmit = (featureData) => {
    onFeatureSubmit(featureData);
    setSelectedAction('');
  };

  const handleMultiattack = () => {
    onMultiattack();
    setSelectedAction('');
  };

  const handleLegendaryAction = (actionData) => {
    const legendaryAction = {
      ...actionData,
      category: 'Legendary',
      costFeaturePoint: true,
      featurePointCost: 2,
      isFirst: false
    };
    onBaseActionSubmit(legendaryAction);
    setSelectedAction('');
  };

  const handleSecondaryEffect = (attackName, effectType, effect) => {
    onSecondaryEffect(attackName, effectType, effect);
    setSelectedAction('');
  };

  const handleDoubleDamage = (attackName) => {
    onDoubleDamage(attackName);
    setSelectedAction('');
  };

  const handleMovementModify = (modificationType, speedType) => {
    onMovementModify(modificationType, speedType);
    setSelectedAction('');
  };

  const handleSkillModify = (type, skills) => {
    onSkillModify(type, skills);
    setSelectedAction('');
  };

  const handleDefenseModify = (modificationType, type) => {
    if (modificationType === 'resistance') {
      onResistanceModify(type);
    } else {
      onImmunityModify(modificationType === 'damageImmunity' ? 'damage' : 'condition', type);
    }
    setSelectedAction('');
  };

  const handleSenseModify = (senseType, range) => {
    onSenseModify(senseType, range);
    setSelectedAction('');
  };

  // Handler for action economy spells
  const handleActionEconomySpell = (spellData) => {
   
    // Submit the spell feature
    onFeatureSubmit(spellData);
    
    // Reset the selected action
    setSelectedAction('');
  };

  const renderActionComponent = () => {
    switch (selectedAction) {
      case 'baseAction':
        return (
          <BaseActionForm
            onSubmit={handleBaseAction}
            availablePoints={availablePoints}
            hasFirstAction={hasFirstAction}
          />
        );
      case 'baseFeature':
        return (
          <BaseFeatureForm
            onSubmit={handleFeatureSubmit}
            availablePoints={availablePoints}
            hasFirstFeature={hasFirstFeature}
          />
        );
      case 'multiattack':
        return (
          <MultiattackAction
            multiattackCount={multiattackCount}
            onSubmit={handleMultiattack}
            availablePoints={availablePoints}
          />
        );
      case 'spellcasting':
        return (
          <SpellcastingForm
            onSubmit={(spellcastingData) => {
              onFeatureSubmit(spellcastingData);
              setSelectedAction('');
            }}
            availablePoints={availablePoints}
            monster={monster}
            currentMagicPoints={magicPoints}
          />
        );
      case 'actionEconomySpell':
        return (
          <ActionEconomySpellForm
            onSubmit={handleActionEconomySpell}
            availablePoints={availablePoints}
            monster={monster}
            magicPoints={magicPoints}
            setMagicPoints={setMagicPoints}
          />
        );
      case 'legendaryAction':
        return (
          <BaseActionForm
            onSubmit={handleLegendaryAction}
            availablePoints={availablePoints}
            hasFirstAction={false}
            isLegendary={true}
            legendaryActions={LEGENDARYACTIONS} 
          />
        );
      case 'modifyDamage':
        return (
          <SecondaryEffects
            existingAttacks={existingAttacks}
            onSubmit={handleSecondaryEffect}
            availablePoints={availablePoints}
          />
        );
      case 'doubleDamage':
        return (
          <DoubleDamageAction
            existingAttacks={existingAttacks}
            onSubmit={handleDoubleDamage}
            availablePoints={availablePoints}
          />
        );
      case 'movement':
        return (
          <MovementAction
            existingMovement={monster.speed}
            monster={monster}
            onSubmit={handleMovementModify}
            availablePoints={availablePoints}
          />
        );
      case 'expertise':
        return (
          <SkillAction
            type="expertise"
            monster={monster}
            onSubmit={handleSkillModify}
            availablePoints={availablePoints}
          />
        );
      case 'proficiency':
        return (
          <SkillAction
            type="proficiency"
            monster={monster}
            onSubmit={handleSkillModify}
            availablePoints={availablePoints}
          />
        );
      case 'defense':
        return (
          <DefenseModifications
            onSubmit={handleDefenseModify}
            availablePoints={availablePoints}
          />
        );
      case 'senses':
        return (
          <SenseAction
            onSubmit={handleSenseModify}
            availablePoints={availablePoints}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Feature Point Actions</h3>
      
      {/* Points Display */}
      <div className="flex gap-4 bg-gray-50 p-2 rounded mb-2">
        <div>
          <span className="font-medium text-sm">Feature Points:</span> 
          <span className="ml-1">{availablePoints}</span>
        </div>
        
        {/* Only show Magic Points if they exist */}
        {magicPoints && magicPoints.total > 0 && (
          <div>
            <span className="font-medium text-sm">Magic Points:</span> 
            <span className="ml-1">{magicPoints.total - magicPoints.used}/{magicPoints.total}</span>
          </div>
        )}
      </div>
      
      <select 
        className="w-1/2 p-2 border rounded"
        value={selectedAction}
        onChange={(e) => setSelectedAction(e.target.value)}
      >
        <option value="">Select Feature or Action</option>
        <option value="baseAction">Add Actions, Bonus Actions, or Reactions</option>
        <option value="baseFeature">Add Features or Abilities</option>
        {monster.cr >= 5 && (
          <option value="legendaryAction">Add Legendary Action or Reaction</option>
        )}
        <option value="spellcasting">Add Spellcasting</option>
        {/* Add Action Economy Spell option only if spellcasting exists */}
        {hasSpellcasting && magicPoints && magicPoints.total > 0 && (
          <option value="actionEconomySpell">Add Action Economy Spell</option>
        )}
        <option value="multiattack" disabled={multiattackCount >= 2}>
          Add Multiattack ({2 - multiattackCount} remaining)
        </option>
        <option value="modifyDamage">Add Secondary Effect (Damage/Condition)</option>
        <option value="doubleDamage">Double Attack Damage</option>
        <option value="movement">Modify Movement Speed</option>
        <option value="expertise">Add Expertise in Skill</option>
        <option value="proficiency">Add Two Skill Proficiencies</option>
        <option value="defense">Add Defense Modification</option>
        <option value="senses">Add Enhanced Senses</option>
      </select>

      {renderActionComponent()}
    </div>
  );
}