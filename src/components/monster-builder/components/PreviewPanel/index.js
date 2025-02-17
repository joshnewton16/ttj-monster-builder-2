// components/PreviewPanel/index.js
import React from 'react';
import { BasicInfo } from './BasicInfo';
import { AttributesSection } from './AttributesSection';
import { SkillsSection } from './SkillsSection';
import { AbilitiesSection } from './AbilitiesSection';
import { ActionsSection } from './ActionsSection';
import { calculateModifier, getFeaturesByCategory } from './utils';

const PreviewPanel = ({ monster, setMonster, setStep }) => {
  const handleDeleteFeature = (feature, index) => {
    const category = feature.category;
    const wasFirst = feature.isFirst;

    setMonster(prev => {
      const newFeatures = prev.features.filter((_, i) => i !== index);

      if (wasFirst) {
        const nextFeatureIndex = newFeatures.findIndex(f => f.category === category);
        if (nextFeatureIndex !== -1) {
          newFeatures[nextFeatureIndex] = {
            ...newFeatures[nextFeatureIndex],
            isFirst: true
          };
        }
      }

      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const handleDeleteMovement = (movementType) => {
    if (movementType === 'Walk' && monster.speed.some(s => s.value > 0 && s.type !== 'Walk')) {
      return;
    }

    setMonster(prev => ({
      ...prev,
      speed: prev.speed.map(speed => 
        speed.type === movementType
          ? { ...speed, value: 0 }
          : speed
      ),
      features: prev.features.filter(feature => 
        !(feature.movementModification && 
          feature.movementModification.speedType === movementType)
      )
    }));
  };

  const handleDeleteAttributePoints = () => {
    setMonster(prev => ({
      ...prev,
      attributePointsFromFeatures: undefined
    }));
  };

  const handleDeleteExpertise = (skill) => {
    setMonster(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill),
      features: prev.features.filter(feature => 
        !(feature.skillsModification && 
          Array.isArray(feature.skillsModification.skillType) &&
          feature.skillsModification.skillType.includes(skill) &&
          feature.skillsModification.type === 'expertise')
      )
    }));
  };
  
  const handleDeleteProficiency = (skill) => {
    setMonster(prev => {
      const newSkills = prev.skills.filter(s => s !== skill);
      const shouldKeepFeaturePoint = newSkills.length > monster.proficiencyBonus;
  
      return {
        ...prev,
        skills: newSkills,
        features: shouldKeepFeaturePoint 
          ? prev.features 
          : prev.features.filter(f => !f.skillModification)
      };
    });
  };

  const handleDeleteSense = (senseType) => {
    setMonster(prev => ({
      ...prev,
      senses: prev.senses.filter(sense => sense.type !== senseType),
      features: prev.features.filter(feature => 
        !(feature.senseModification && 
          feature.senseModification.type === senseType)
      )
    }));
  };

  return (
    <div className="preview-panel">
      <h2>Monster Features</h2>
      
      <div className="preview-columns">
        <div className="preview-column">
          <BasicInfo 
            monster={monster} 
            setStep={setStep}
            onDeleteMovement={handleDeleteMovement}
          />
          
          <AttributesSection 
            monster={monster}
            setStep={setStep}
            calculateModifier={calculateModifier}
            onDeleteAttributePoints={handleDeleteAttributePoints}
          />
          
          <SkillsSection 
            monster={monster}
            onDeleteExpertise={handleDeleteExpertise}
            onDeleteProficiency={handleDeleteProficiency}
          />
        </div>

        <div className="preview-column">
          <AbilitiesSection 
            features={getFeaturesByCategory(monster.features, 'Abilities')}
            setStep={setStep}
            onDeleteFeature={handleDeleteFeature}
          />
          
          <ActionsSection 
            monster={monster}
            setStep={setStep}
            onDeleteFeature={handleDeleteFeature}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;