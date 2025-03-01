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
import { SenseAction } from './SenseAction';  // Add this import
import { LEGENDARYACTIONS } from '../../constants/srd-data';

export function FeaturePointActions({
  existingAttacks,
  multiattackCount,
  monster,
  onBaseActionSubmit,
  hasFirstAction,      // Add this prop
  onFeatureSubmit,    // Add this
  hasFirstFeature,    // Add this
  onMultiattack,
  onSecondaryEffect,
  onDoubleDamage,
  onMovementModify,
  onSkillModify,
  onImmunityModify,
  onResistanceModify,
  onSenseModify,    // Add this prop
  availablePoints
}) {
  const [selectedAction, setSelectedAction] = useState('');

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
      featurePointCost: 2, // Costs 2 points
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

  const renderActionComponent = () => {
    switch (selectedAction) {
      case 'baseAction':  // New case for BaseActionForm
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
              monster={monster}  // Make sure this is being passed
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
      <select 
        className="w-full p-2 border rounded"
        value={selectedAction}
        onChange={(e) => setSelectedAction(e.target.value)}
      >
        <option value="">Select Feature or Action</option>
        <option value="baseAction">Add Actions, Bonus Actions, or Reactions</option>  {/* New option */}
        <option value="baseFeature">Add Features or Abilities</option>
        {monster.cr >= 5 && (
          <option value="legendaryAction">Add Legendary Action or Reaction</option>
        )}
        <option value="spellcasting">Add Spellcasting</option>
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