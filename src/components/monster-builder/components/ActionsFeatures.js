// ActionsFeatures/index.js
import React, { useState, useEffect } from 'react';
import { FeaturePointsSummary } from './FeaturePointSummary';
import { FeaturePointActions } from './FeaturePointActions';
import { useFeaturePoints } from '../hooks/useFeaturePoints';
import { useFeatureModification } from '../hooks/useFeatureModification';
import { SIZE_MOVEMENT } from '../constants/srd-data';

export function ActionsFeatures({ monster, setMonster }) {
  // Add magic points state
  const [magicPoints, setMagicPoints] = useState({
    total: 0,
    used: 0
  });

  // Load any existing magic points from monster when component mounts
  useEffect(() => {
    // Check if monster already has spellcasting with magic points
    const spellcastingFeature = monster.features.find(
      feature => feature.name === 'Spellcasting' && feature.magicPointsTotal !== undefined
    );
    
    if (spellcastingFeature) {
      setMagicPoints({
        total: spellcastingFeature.magicPointsTotal,
        used: 0 // Reset to zero initially and then calculate used points
      });
      
      // Calculate used magic points from existing spells
      const usedPoints = monster.features
        .filter(f => f.costMagicPoint && f.magicPointCost)
        .reduce((total, feature) => total + (feature.magicPointCost || 0), 0);
      
      // Update with used points
      if (usedPoints > 0) {
        setMagicPoints(prev => ({
          ...prev,
          used: usedPoints
        }));
      }
    }
  }, [monster.features]);

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
    // If this is spellcasting with magic points, update our state
    if (newFeature.name === 'Spellcasting' && newFeature.magicPointsTotal !== undefined) {
      setMagicPoints({
        total: newFeature.magicPointsTotal,
        used: newFeature.magicPointsUsed || 0
      });
    }
    
    // If this feature costs magic points, update our counter
    if (newFeature.costMagicPoint && newFeature.magicPointCost > 0) {
      setMagicPoints(prev => ({
        ...prev,
        used: prev.used + newFeature.magicPointCost
      }));
    }
    
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

      if (type === 'expertise') {
        return {
          ...prev,
          expertise: [...(prev.expertise || []), skills[0]],
          features: [...prev.features, newFeature]
        };
      } else {
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
  };

  const handleImmunityModify = (type, immunityType) => {
    setMonster(prev => {
      const newFeature = {
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Immunity`,
        description: `Immune to ${immunityType}`,
        category: 'Abilities',
        // Remove modificationCost flag since we'll use immunityModification only
        immunityModification: {
          type: type,
          immunityType: immunityType
        }
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
        // Use resistanceModification instead of modificationCost
        resistanceModification: {
          type: 'damage',
          damageType: damageType
        }
      };

      return {
        ...prev,
        features: [...prev.features, newFeature]
      };

    });
  };

  // In ActionsFeatures component
  const handleSenseModify = (senseType, range) => {
    setMonster(prev => {
      const newFeature = {
        name: `Enhanced Senses`,
        description: `${senseType.charAt(0).toUpperCase() + senseType.slice(1)} ${range} ft.`,
        category: 'Abilities',
        senseModification: {
          type: senseType,
          range: range
        },
        isHidden: true
      };

      return {
        ...prev,
        senses: [...(prev.senses || []), { type: senseType, range: range }],
        features: [...prev.features, newFeature]
      };
    });
  };
  
  // Calculate the actual used magic points from features (for debugging)
  const actualUsedMagicPoints = monster.features
    .filter(f => f.costMagicPoint && f.magicPointCost)
    .reduce((total, feature) => total + (feature.magicPointCost || 0), 0);

  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold">Actions and Features</h2>
      
      <FeaturePointsSummary
        totalPoints={totalFeaturePoints}
        availablePoints={availableFeaturePoints}
        hasFirstAction={hasFirstAction}
        hasFirstFeature={hasFirstFeature}
        magicPoints={magicPoints.total > 0 ? magicPoints : null}
      />

      <FeaturePointActions
        existingAttacks={existingAttacks}
        multiattackCount={multiattackCount}
        monster={monster}
        availablePoints={availableFeaturePoints}
        onBaseActionSubmit={handleAddAction}
        hasFirstAction={hasFirstAction}
        onFeatureSubmit={handleAddFeature}
        hasFirstFeature={hasFirstFeature}
        onMultiattack={() => addMultiattack(existingMultiattack)}
        onSecondaryEffect={addSecondaryEffect}
        onDoubleDamage={doubleDamage}
        onMovementModify={handleMovementModify}
        onAttributePoints={handleAttributePoints}
        onSkillModify={handleSkillModify}
        onImmunityModify={handleImmunityModify}
        onResistanceModify={handleResistanceModify}
        onSenseModify={handleSenseModify}
        magicPoints={magicPoints}
        setMagicPoints={setMagicPoints}
      />
    </div>
  );
}