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

      if (speedIndex === -1) {
        console.error('Speed type not found:', speedType);
        return prev;
      }

      // Get the original base speed from SIZE_MOVEMENT
      const baseSpeed = SIZE_MOVEMENT[prev.size]?.Walk || 30;
      
      // Set the new movement type to the original base speed
      if (modificationType === 'new') {
        newSpeed[speedIndex] = {
          ...newSpeed[speedIndex],
          value: baseSpeed
        };
      } else if (modificationType === 'increase') {
        newSpeed[speedIndex] = {
          ...newSpeed[speedIndex],
          value: newSpeed[speedIndex].value + 10
        };
      }

      const newFeature = {
        name: `${speedType} Movement Modification`,
        description: modificationType === 'new' 
          ? `Added ${speedType} movement` 
          : `Increased ${speedType} movement`,
        modificationCost: true,
        movementModification: {
          type: modificationType,
          speedType: speedType
        },
        isHidden: true  // Add this flag to indicate it shouldn't be displayed
      };

      console.log(monster);
      return {
        ...prev,
        speed: newSpeed,
        features: [...prev.features, newFeature]
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

      const newFeature = {
        name: `${skills} Modification`,
        description: type === 'expertise' 
          ? `Added Expertise in ${skills}` 
          : `Added ${skills}`,
        modificationCost: true,
        skillsModification: {
          type: type,
          skillType: skills
        },
        isHidden: true  // Add this flag to indicate it shouldn't be displayed
      };

      console.log(newFeature);
      console.log('Before Add:',monster);
      if (type === 'expertise') {
        return {
          ...prev,
          expertise: [...(prev.expertise || []), skills[0]],
          features: [...prev.features, newFeature]
        };
      } else {
        console.log("enter else");
        const currentSkillCount = prev.skills.length;
        const willNeedFeaturePoint = currentSkillCount >= monster.proficiencyBonus;

        return {
          ...prev,
          skills: [...prev.skills, ...skills],
          features: willNeedFeaturePoint ? [
            ...prev.features,
            {
              name: 'Additional Skill Proficiencies',
              modificationCost: true,
              isHidden: true,
              skillModification: {
                type: 'proficiency',
                baseCount: monster.proficiencyBonus
              }
            }
          ] : prev.features
        };      
      }
    });
    console.log('After Add:', monster);
  };

  const handleImmunityModify = (type, immunityType) => {
    setMonster(prev => {
      const newFeature = {
        name: `${type} Immunity`,
        description: `Immune to ${immunityType}`,
        category: 'Abilities',
        modificationCost: true,
        isImmunity: true,
        immunityModification: {
          type: type,
          immunityType: immunityType,
          costsTwoPoints: type === 'damage' // damage immunity costs 2 points
        },
        isHidden: true
      };
  
      return {
        ...prev,
        features: [...prev.features, newFeature]
      };
    });
  };
  
  const handleResistanceModify = (damageType) => {
    setMonster(prev => {
      const newFeature = {
        name: `Damage Resistance`,
        description: `Resistant to ${damageType} damage`,
        category: 'Abilities',
        modificationCost: true,
        isResistance: true,
        resistanceModification: {
          damageType: damageType
        },
        isHidden: true
      };
  
      return {
        ...prev,
        features: [...prev.features, newFeature]
      };
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
        onImmunityModify={handleImmunityModify}     // Add these handlers
        onResistanceModify={handleResistanceModify}  // Add these handlers
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