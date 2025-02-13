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
      let description = '';
      const [dice, ...damageType] = feature.damage.split(' ');
      
      // Handle doubled damage
      if (feature.doubleDamage) {
        // Parse the dice notation (e.g., "1d6" -> { count: 1, die: 6 })
        const [count, die] = dice.split('d').map(Number);
        const doubledCount = count * 2;
        const doubledMod = mod * 2;
        const doubledModString = doubledMod >= 0 ? `+${doubledMod}` : doubledMod;
        description = `${feature.type}: ${doubledCount}d${die}${doubledModString} ${damageType.join(' ')}`;
      } else {
        description = `${feature.type}: ${dice}${modString} ${damageType.join(' ')}`;
      }

      // Add secondary effects if they exist
      if (feature.secondaryEffect) {
        if (feature.secondaryEffect.type === 'damage') {
          description += ` plus ${feature.secondaryEffect.dice} ${feature.secondaryEffect.damageType} damage`;
        } else if (feature.secondaryEffect.type === 'condition') {
          description += `. ${feature.secondaryEffect.description}`;
        }
      }

      return description;
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

  const renderMultiattack = (feature) => {
    const globalIndex = monster.features.findIndex(f => f === feature);
    
    return (
      <div className="preview-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong>Multiattack.</strong> {feature.description}
          </div>
          <button
            onClick={() => handleDeleteFeature(feature, globalIndex)}
            className="p-1 text-red-500 hover:text-red-700"
            aria-label="Delete multiattack"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const handleDeleteMovement = (movementType) => {
    // Only allow deletion of non-walk speeds or walk speeds if there are other movement types
    if (movementType === 'Walk' && monster.speed.some(s => s.value > 0 && s.type !== 'Walk')) {
      // Don't allow deleting Walk if other speeds exist
      return;
    }

    setMonster(prev => ({
      ...prev,
      speed: prev.speed.map(speed => 
        speed.type === movementType
          ? { ...speed, value: 0 }  // Reset the speed to 0 instead of removing it
          : speed
      )
    }));
  };

  const renderMovement = () => {
    return (
      <div className="space-y-1">
        {monster.speed
          .filter(speed => speed.value > 0)
          .map((speed) => (
            <div 
              key={speed.type}
              className="flex justify-between items-center"
            >
              <span>{speed.type} ({speed.value} ft.)</span>
              {/* Only show delete button if it's not Walk speed, or if it is Walk but there are no other speeds */}
              {(speed.type !== 'Walk' || !monster.speed.some(s => s.value > 0 && s.type !== 'Walk')) && (
                <button
                  onClick={() => handleDeleteMovement(speed.type)}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label={`Delete ${speed.type} movement`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
      </div>
    );
  };

  const handleDeleteAttributePoints = () => {
    setMonster(prev => ({
      ...prev,
      attributePointsFromFeatures: undefined  // Remove the attribute points bonus
    }));
  };

  const handleDeleteExpertise = (skill) => {
    setMonster(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }));
  };
  
  const handleDeleteProficiency = (skill) => {
    setMonster(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <div className="preview-panel">
      <h2>Monster Features</h2>
      
      <div className="preview-columns">
        {/* Left Column */}
        <div className="preview-column">
          {/* Basic Info Section */}
          <div className="preview-section mb-4">
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
                <strong>Movement:</strong>
                {renderMovement()}
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
            {monster.attributePointsFromFeatures && (
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>+2 Attribute Points from Feature Point</span>
                <button
                  onClick={handleDeleteAttributePoints}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label="Remove attribute points"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          {/* Skills Section */}
          <div className="preview-section">
            <h3>Skills</h3>
            {monster.skills.map(skill => (
              <div key={skill} className="flex justify-between items-center">
                <span>
                  {skill}
                  {monster.expertise?.includes(skill) && (
                    <span className="ml-2 text-green-600">(Expertise)</span>
                  )}
                </span>
                <button
                  onClick={() => {
                    if (monster.expertise?.includes(skill)) {
                      handleDeleteExpertise(skill);
                    } else {
                      handleDeleteProficiency(skill);
                    }
                  }}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label={`Remove ${skill}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="preview-column">
          {/* Abilities Section */}
          <div className="preview-section mb-4">
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
            {monster.features.find(f => f.isMultiattack) && 
                renderMultiattack(monster.features.find(f => f.isMultiattack))
              }
              {getFeaturesByCategory('Actions')
                .filter(f => !f.isMultiattack)
                .map((feature, index) => renderFeature(feature, index)
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;