import React from 'react';
import { Trash2 } from 'lucide-react';

const PreviewPanel = ({ monster, setMonster, setStep }) => {
  const calculateModifier = (attributeValue) => {
    return Math.floor((attributeValue - 10) / 2);
  };

  const getActionString = (feature) => {
    if (!feature.damage) return feature.description;
  
    const strMod = calculateModifier(monster.attributes.str);
    const dexMod = calculateModifier(monster.attributes.dex);
    const mod = feature.useDex ? dexMod : (feature.useStr ? strMod : 0);
    const modString = mod >= 0 ? `+${mod}` : mod;
    
    try {
      const [dice, ...damageType] = feature.damage.split(' ');
      return `${feature.type}: ${dice}${modString} ${damageType.join(' ')}`;
    } catch (error) {
      return feature.description;
    }
  };

  const handleDeleteFeature = (feature, index) => {
    // Save the category and isFirst status of the feature being deleted
    const category = feature.category;
    const wasFirst = feature.isFirst;

    setMonster(prev => {
      // First, remove the feature
      const newFeatures = prev.features.filter((_, i) => i !== index);

      // If this was the first of its category, we might need to promote another feature
      if (wasFirst) {
        // Find the next feature of the same category (if any) and make it first
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

  // Helper to get features by category
  const getFeaturesByCategory = (category) => {
    return monster.features.filter(feature => feature.category === category);
  };

  const renderFeature = (feature, index) => {
    const globalIndex = monster.features.findIndex(f => f === feature);
    
    return (
      <div key={index} className="preview-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong>{feature.name}.</strong> {feature.category === 'Actions' ? getActionString(feature) : feature.description}
            {feature.isFirst && (
              <span className="ml-2 text-sm text-green-600">(Primary)</span>
            )}
          </div>
          <button
            onClick={() => handleDeleteFeature(feature, globalIndex)}
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
    <div className="preview-panel">
      <h2>Monster Features</h2>
      
      {/* Basic Info Section */}
      <div className="preview-section">
        <h3 onClick={() => setStep(1)} className="cursor-pointer hover:text-blue-600">
          Basic Info
        </h3>
        <div>
          <div>Name: {monster.name}</div>
          <div>CR: {monster.cr}</div>
          <div>Proficiency Bonus: {monster.proficiencyBonus}</div>
          <div>AC: {monster.acText}</div>
          <div>HP: {monster.hp}</div>
          <div>
            Movement: {Array.isArray(monster.speed) ? 
              monster.speed
                .filter(speed => speed.value > 0)
                .map((speed, index, array) => (
                  <span key={speed.type}>
                    {speed.type} ({speed.value} ft.){index < array.length - 1 ? ', ' : ''}
                  </span>
                ))
              : 'None'
            }
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="preview-section">
        <h3 onClick={() => setStep(2)} className="cursor-pointer hover:text-blue-600">
          Attributes
        </h3>
        <div>
          {Object.entries(monster.attributes).map(([attr, value]) => {
            const modifier = calculateModifier(value);
            const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
            const isProficientSave = monster.savingThrows.includes(attr);
            const saveModifier = isProficientSave ? modifier + monster.proficiencyBonus : modifier;
            const saveModifierText = saveModifier >= 0 ? `+${saveModifier}` : saveModifier;

            return (
              <div key={attr}>
                {attr.toUpperCase()}: {value} ({modifierText}) Save: {saveModifierText}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Abilities Section */}
      <div className="preview-section">
        <h3 onClick={() => setStep(4)} className="cursor-pointer hover:text-blue-600">
          Abilities
        </h3>
        {getFeaturesByCategory('Abilities').map((feature, index) => 
          renderFeature(feature, index)
        )}
      </div>

      {/* Actions Section */}
      <div className="preview-section">
        <h3 onClick={() => setStep(4)} className="cursor-pointer hover:text-blue-600">
          Actions
        </h3>
        {getFeaturesByCategory('Actions').map((feature, index) => 
          renderFeature(feature, index)
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;