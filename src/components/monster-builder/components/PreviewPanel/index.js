// components/PreviewPanel/index.js
import React from 'react';
import { BasicInfo } from './BasicInfo';
import { AttributesSection } from './AttributesSection';
import { SkillsSection } from './SkillsSection';
import { AbilitiesSection } from './AbilitiesSection';
import { ActionsSection } from './ActionsSection';
import { calculateModifier, getFeaturesByCategory } from './utils';

const PreviewPanel = ({ monster, setMonster, setStep, onEditFeature }) => {
  const handleDeleteFeature = (feature, index) => {
    // Get the actual feature from the monster features array using the index
    const featureToDelete = monster.features[index];
    const category = featureToDelete.category;
    const wasFirst = featureToDelete.isFirst;
    console.log('before delete', monster);
    console.log('feature', feature);
    console.log('index', index );

    setMonster(prev => {
      const newFeatures = prev.features.filter((_, i) => i !== index);

      // If this was a Spellcasting feature with basic spells, also remove all related spell features
      if (featureToDelete.name === 'Spellcasting' && featureToDelete.spellcasting?.atWillSpells?.length > 0) {
        // Filter out all the individual basic spell features
        const spellNames = featureToDelete.spellcasting.atWillSpells;
        return {
          ...prev,
          features: newFeatures.filter(f => !(f.name.startsWith('Spell:') && spellNames.some(spell => f.name.includes(spell))))
        };
      }

      if (wasFirst) {
        const nextFeatureIndex = newFeatures.findIndex(f => f.category === category);
        if (nextFeatureIndex !== -1) {
          newFeatures[nextFeatureIndex] = {
            ...newFeatures[nextFeatureIndex],
            isFirst: true
          };
        }
      }

      console.log('after delete', monster);

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
    //console.log(monster);
    setMonster(prev => ({
      ...prev,
      attributePointsFromFeatures: undefined,
      features: prev.features.filter(feature => 
        !(feature.name === 'Add Attribute Points')
      )
    }));
  };

  const handleDeleteSavingThrows = () => {
    //console.log(monster);
    setMonster(prev => ({
      ...prev,
      savingThrowsFromFeatures: undefined,
      features: prev.features.filter(feature => 
        !(feature.name === 'Add Saving Throw')
      )
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

  const handleDeleteLanguage = (languageType) => {
    setMonster(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageType),
      features: prev.features.filter(feature => 
        !(feature.languageModification && 
          feature.languageModification === languageType)
      )
    }));
  };

  // Filter out basic spell features and ensure multiattack only appears in Actions section
  const getFilteredFeaturesByCategory = (features, category) => {
    return features.filter(feature => {
      // Basic filtering condition
      const isHidden = feature.isHidden;
      const isBasicSpell = feature.name.startsWith('Spell:') && feature.costMagicPoint;
      const hasMultiattack = feature.isMultiattack; // Check if feature has isMultiattack property
      
      // For "Actions" category, include only actions and multiattack features
      if (category === 'Actions') {
        return feature.category === 'Actions' && !isHidden && !isBasicSpell;
      }
      
      // For "Abilities" category, exclude any multiattack features
      if (category === 'Abilities') {
        return feature.category === 'Abilities' && !hasMultiattack && !isHidden && !isBasicSpell;
      }
      
      // Default case for any other categories
      return feature.category === category && !isHidden && !isBasicSpell;
    });
  };

  const actionFeatures = monster.features.filter(feature => 
    feature.category === 'Actions' && !feature.isHidden
  );
  
  const abilityFeatures = monster.features.filter(feature => 
    feature.category === 'Abilities' && !feature.isHidden && 
    // Explicitly exclude multiattack features from abilities
    !feature.isMultiattack && 
    // Exclude basic spell features
    !(feature.name.startsWith('Spell:') && feature.costMagicPoint)
  );
  

  return (
    <div className="preview-panel">
      <h2>Monster Features</h2>
      
      <div className="preview-columns">
        <div className="preview-column">
          <BasicInfo 
            monster={monster} 
            setStep={setStep}
            onDeleteMovement={handleDeleteMovement}
            onDeleteSense={handleDeleteSense}
            onDeleteLanguage={handleDeleteLanguage}
          />
          
          <AttributesSection 
            monster={monster}
            setStep={setStep}
            calculateModifier={calculateModifier}
            onDeleteAttributePoints={handleDeleteAttributePoints}
            onDeleteSavingThrowPoints={handleDeleteSavingThrows}
          />
          
          <SkillsSection 
            monster={monster}
            onDeleteExpertise={handleDeleteExpertise}
            onDeleteProficiency={handleDeleteProficiency}
          />
        </div>

        <div className="preview-column">
        <AbilitiesSection 
          features={abilityFeatures}
          setStep={setStep}
          onDeleteFeature={handleDeleteFeature}
          monster={monster} 
        />

        <ActionsSection 
          monster={monster}
          setStep={setStep}
          onDeleteFeature={handleDeleteFeature}
          features={actionFeatures}
          onEditFeature={onEditFeature}         // ADD THIS
        />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;