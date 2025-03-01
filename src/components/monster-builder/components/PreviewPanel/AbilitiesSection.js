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

    let description = `The creature is a ${spellcasting.level}th-level spellcaster. `;
    description += `Its spellcasting ability is ${spellcasting.ability} `;
    description += `(spell attack bonus: +${spellAttackBonus}, spell save DC: ${spellSaveDC}).\n\n`;

    if (spellcasting.atWillSpells?.length > 0) {
      description += `*At Will spells:* ${spellcasting.atWillSpells.join(', ')}`;
    }

    return description;
  }, [monster.attributes, monster.proficiencyBonus]); // Only recalculate when these values change

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