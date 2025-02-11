import React, { useState } from 'react';
import { SRD_ACTIONS, SRD_FEATURES } from '../constants/srd-data';

export function ActionsFeatures({ monster, setMonster }) {
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  function calculateFeaturePoints(cr, proficiencyBonus) {
    return (cr || 0) + (proficiencyBonus || 0);
  }

  const handleActionSelect = (e) => {
    const selectedAction = SRD_ACTIONS[e.target.value];
    if (selectedAction) {
      setActionTitle(selectedAction.name);
      
      // Format description with damage and modifier placeholder
      if (selectedAction.damage && (selectedAction.useStr || selectedAction.useDex)) {
        try {
          const [dice, ...damageType] = selectedAction.damage.split(' ');
          const modifier = selectedAction.useStr ? '+STR' : '+DEX';
          const damageText = `${dice} ${modifier} ${damageType.join(' ')}`;
          setActionDescription(`${selectedAction.type} - ${damageText}`);
        } catch (error) {
          console.error('Error processing damage:', error);
          setActionDescription(selectedAction.type || '');
        }
      } else {
        setActionDescription(selectedAction.type || '');
      }
    }
  };

  const handleFeatureSelect = (e) => {
    const selectedFeature = SRD_FEATURES[e.target.value];
    if (selectedFeature) {
      setFeatureTitle(selectedFeature.name);
      setFeatureDescription(selectedFeature.description);
    }
  };

  const handleAddAction = () => {
    if (!actionTitle || !actionDescription) return;
    
    // Find the original SRD action
    const srdAction = SRD_ACTIONS.find(a => a.name === actionTitle);
    
    setMonster(prev => ({
      ...prev,
      baseAction: {
        name: actionTitle,
        // Don't set description since it will be generated in the preview
        type: srdAction?.type || 'Custom',
        damage: srdAction?.damage || '',
        useStr: srdAction?.useStr || false,
        useDex: srdAction?.useDex || false
      }
    }));
  
    setActionTitle('');
    setActionDescription('');
  };

  const handleAddFeature = () => {
    if (!featureTitle || !featureDescription) return;
    
    setMonster(prev => ({
      ...prev,
      baseFeature: {
        name: featureTitle,
        description: featureDescription
      }
    }));

    setFeatureTitle('');
    setFeatureDescription('');
  };

  return (
    
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Actions and Features</h2>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Available Choices:</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Actions:</span> 1
          </div>
          <div>
            <span className="font-medium">Features:</span> 1
          </div>
          <div>
            <span className="font-medium">Feature Points:</span>{' '}
            {calculateFeaturePoints(monster.cr, monster.proficiencyBonus)}
          </div>
        </div>
      </div>
      {/* Actions Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Action</h3>
        <select 
          className="w-full p-2 border rounded"
          onChange={handleActionSelect}
          value=""
        >
          <option value="">Select an Action Template...</option>
          {SRD_ACTIONS.map((action, index) => (
            <option key={index} value={index}>
              {action.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          placeholder="Action Title"
          className="w-full p-2 border rounded"
        />

        <textarea
          value={actionDescription}
          onChange={(e) => setActionDescription(e.target.value)}
          placeholder="Action Description"
          className="w-full p-2 border rounded h-32"
        />

        <button 
          onClick={handleAddAction}
          disabled={!actionTitle || !actionDescription}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add Action
        </button>
      </div>

      {/* Features Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Feature</h3>
        <select 
          className="w-full p-2 border rounded"
          onChange={handleFeatureSelect}
          value=""
        >
          <option value="">Select a Feature Template...</option>
          {SRD_FEATURES.map((feature, index) => (
            <option key={index} value={index}>
              {feature.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={featureTitle}
          onChange={(e) => setFeatureTitle(e.target.value)}
          placeholder="Feature Title"
          className="w-full p-2 border rounded"
        />

        <textarea
          value={featureDescription}
          onChange={(e) => setFeatureDescription(e.target.value)}
          placeholder="Feature Description"
          className="w-full p-2 border rounded h-32"
        />

        <button 
          onClick={handleAddFeature}
          disabled={!featureTitle || !featureDescription}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add Feature
        </button>
      </div>
    </div>
  );
}