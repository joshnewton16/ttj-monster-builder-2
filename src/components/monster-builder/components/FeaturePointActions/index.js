// components/FeaturePointActions/index.js
import React, { useState } from 'react';
import { MultiattackAction } from './MultiattackAction';
import { SecondaryEffects } from './SecondaryEffects';
import { DoubleDamageAction } from './DoubleDamageAction';
import { MovementAction } from './MovementAction';
import { SkillAction } from './SkillAction';
import { DefenseModifications } from './DefenseModifications';

export function FeaturePointActions({
  existingAttacks,
  multiattackCount,
  monster,
  onMultiattack,
  onSecondaryEffect,
  onDoubleDamage,
  onMovementModify,
  onSkillModify,
  onImmunityModify,
  onResistanceModify,
  availablePoints
}) {
  const [selectedAction, setSelectedAction] = useState('');

  // Wrap each handler to reset the selectedAction after completion
  const handleMultiattack = () => {
    onMultiattack();
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

  const renderActionComponent = () => {
    switch (selectedAction) {
      case 'multiattack':
        return (
          <MultiattackAction
            multiattackCount={multiattackCount}
            onSubmit={handleMultiattack}
            availablePoints={availablePoints}
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
        <option value="">Select Feature Point Action...</option>
        <option value="multiattack" disabled={multiattackCount >= 2}>
          Add Multiattack ({2 - multiattackCount} remaining)
        </option>
        <option value="modifyDamage">Add Secondary Effect (Damage/Condition)</option>
        <option value="doubleDamage">Double Attack Damage</option>
        <option value="movement">Modify Movement Speed</option>
        <option value="expertise">Add Expertise in Skill</option>
        <option value="proficiency">Add Two Skill Proficiencies</option>
        <option value="defense">Add Defense Modification</option>
      </select>

      {renderActionComponent()}
    </div>
  );
}