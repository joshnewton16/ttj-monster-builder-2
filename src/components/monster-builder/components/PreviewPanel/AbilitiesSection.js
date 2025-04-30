import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';

export const AbilitiesSection = ({ 
  features, 
  setStep,
  onDeleteFeature,
  monster
}) => {
  const getSpellcastingString = useMemo(() => (feature) => {
    const { spellcasting } = feature;
    
    const abilityMap = {
      'Intelligence': 'int',
      'Wisdom': 'wis',
      'Charisma': 'cha'
    };
  
    const abilityScore = monster.attributes[abilityMap[spellcasting.ability]];
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    const spellAttackBonus = abilityMod + monster.proficiencyBonus;
    const spellSaveDC = 8 + spellAttackBonus;
  
    // Core spellcasting information
    let description = `The creature is a ${spellcasting.level}th-level spellcaster. `;
    description += `Its spellcasting ability is ${spellcasting.ability} `;
    description += `(spell attack bonus: +${spellAttackBonus}, spell save DC: ${spellSaveDC}).`;
    
    // Add empty paragraphs for spacing using jsx elements
    const formattedOutput = [];
    formattedOutput.push(<span key="basic-info">{description}</span>);
    
    // Add two line breaks for spacing
    formattedOutput.push(<span key="spacer1"><br /></span>);
    formattedOutput.push(<span key="spacer2"><br /></span>);
    
    // Add spells by level
    if (spellcasting.spellsByLevel) {
      // Get the levels and sort them numerically
      const levels = Object.keys(spellcasting.spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b));
      
      levels.forEach((level, index) => {
        const levelData = spellcasting.spellsByLevel[level];
        
        if (levelData.spells && levelData.spells.length > 0) {
          // Get spell names for this level and make them italic
          const spellNames = levelData.spells.map(spell => spell.name).join(', ');
          
          // Format based on level
          let levelLine = '';
          if (level === '0') {
            levelLine = `At Will (Cantrip): `;
          } else {
            // Get usage limit from the spellSlots array
            const usageLimit = levelData.usageLimit;
            
            // Add ordinal suffix
            const ordinalSuffix = getOrdinalSuffix(parseInt(level));
            
            levelLine = `${usageLimit} (${level}${ordinalSuffix} Level): `;
          }
          
          // Add formatted line with italic spell names
          formattedOutput.push(
            <span key={`level-${level}`}>
              {levelLine}<i>{spellNames}</i>
              {index < levels.length - 1 && <br />}
            </span>
          );
        }
      });
    }
  
    // Return the JSX elements array
    return formattedOutput;
  }, [monster.attributes, monster.proficiencyBonus]);
  
  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const renderFeature = (feature, index) => {
    const globalIndex = features.findIndex(f => f === feature);

    return (
      <div key={index} className="preview-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong>{feature.name}.</strong> {feature.spellcasting ? getSpellcastingString(feature) : feature.description}
            {feature.isFirst && (
              <span className="ml-2 text-sm text-green-600">(Primary)</span>
            )}
          </div>
          <button
            onClick={() => onDeleteFeature(feature, globalIndex)}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label="Delete feature"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="preview-section mb-4">
      <h3 onClick={() => setStep(4)} className="cursor-pointer hover:text-blue-600">
        Abilities
      </h3>
      {features.map((feature, index) => 
        renderFeature(feature, index)
      )}
    </div>
  );
};