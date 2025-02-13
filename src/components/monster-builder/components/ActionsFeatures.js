// ActionsFeatures/index.js
import React from 'react';
import { FeaturePointsSummary } from './FeaturePointSummary';
import { FeaturePointActions } from './FeaturePointActions';
import { BaseActionForm } from './BaseActionForm';
import { BaseFeatureForm } from './BaseFeatureForm';
import { useFeaturePoints } from '../hooks/useFeaturePoints';
import { useFeatureModification } from '../hooks/useFeatureModification';
import { SIZE_MOVEMENT } from '../constants/srd-data';

export function ActionsFeatures({ monster, setMonster }) {
  const {
    totalFeaturePoints,
    availableFeaturePoints,
    hasFirstAction,
    hasFirstFeature
  } = useFeaturePoints(monster);

  const {
    addMultiattack,
    addSecondaryEffect,
    doubleDamage
  } = useFeatureModification(monster, setMonster);

  // Get existing attacks that can be modified
  const existingAttacks = monster.features.filter(f => 
    f.category === 'Actions' && f.damage && !f.isMultiattack
  );

  // Check for existing multiattack and get its count
  const existingMultiattack = monster.features.find(f => f.isMultiattack);
  const multiattackCount = existingMultiattack ? existingMultiattack.attackCount - 1 : 0;

  const handleAddAction = (newAction) => {
    setMonster(prev => ({
      ...prev,
      features: [...prev.features, newAction]
    }));
  };

  const handleAddFeature = (newFeature) => {
    setMonster(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const handleMovementModify = (modificationType, speedType) => {
    setMonster(prev => {
      const newSpeed = [...prev.speed];
      const speedIndex = newSpeed.findIndex(s => s.type === speedType);
      
      if (modificationType === 'new') {
        // Get the original base speed from SIZE_MOVEMENT
        const baseSpeed = SIZE_MOVEMENT[prev.size]?.Walk || 30;
        
        // Set the new movement type to the original base speed
        newSpeed[speedIndex] = {
          ...newSpeed[speedIndex],
          value: baseSpeed
        };
      } else if (modificationType === 'increase') {
        // Increase existing speed by 10
        newSpeed[speedIndex] = {
          ...newSpeed[speedIndex],
          value: newSpeed[speedIndex].value + 10
        };
      }
  
      return {
        ...prev,
        speed: newSpeed
      };
    });
  };

  const handleAttributePoints = () => {
    setMonster(prev => ({
      ...prev,
      attributePointsFromFeatures: 2  // Add 2 attribute points
    }));
  };

  const handleSkillModify = (type, skills) => {
    setMonster(prev => {
      if (type === 'expertise') {
        return {
          ...prev,
          expertise: [...(prev.expertise || []), skills[0]]
        };
      } else { // proficiency
        return {
          ...prev,
          skills: [...prev.skills, ...skills]
        };
      }
    });
  };

  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold">Actions and Features</h2>
      
      <FeaturePointsSummary
        totalPoints={totalFeaturePoints}
        availablePoints={availableFeaturePoints}
        hasFirstAction={hasFirstAction}
        hasFirstFeature={hasFirstFeature}
      />

      <FeaturePointActions
        existingAttacks={existingAttacks}
        multiattackCount={multiattackCount}
        monster={monster}  // Make sure we're passing the monster prop
        availablePoints={availableFeaturePoints}
        onMultiattack={() => addMultiattack(existingMultiattack)}
        onSecondaryEffect={addSecondaryEffect}
        onDoubleDamage={doubleDamage}
        onMovementModify={handleMovementModify}
        onAttributePoints={handleAttributePoints}
        onSkillModify={handleSkillModify}  // Add this prop
      />

      <BaseActionForm
        onSubmit={handleAddAction}
        availablePoints={availableFeaturePoints}
        hasFirstAction={hasFirstAction}
      />

      <BaseFeatureForm
        onSubmit={handleAddFeature}
        availablePoints={availableFeaturePoints}
        hasFirstFeature={hasFirstFeature}
      />
    </div>
  );
}