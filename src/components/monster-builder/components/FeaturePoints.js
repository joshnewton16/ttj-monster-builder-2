import React, { useState } from 'react';
import { SRD_ACTIONS } from '../constants/srd-data';

export function FeaturePoints({ monster, setMonster }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [actionType, setActionType] = useState('Action');  // Default to Action
  const [selectedAction, setSelectedAction] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [doublesDamage, setDoublesDamage] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState([]);

  const FEATURE_POINT_OPTIONS = [
    {
      id: 'action',
      name: 'Additional Action/Reaction/Bonus Action',
      cost: 1,
      type: 'action'
    },
    {
      id: 'damage',
      name: 'Secondary Damage Type or Double Damage',
      cost: 1,
      type: 'damage'
    },
    {
      id: 'movement',
      name: 'Additional Movement',
      cost: 1,
      type: 'movement',
      options: ['Burrow', 'Swim', 'Climb', 'Fly', '+10 ft to existing']
    }
  ].sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.name.localeCompare(b.name);
  });

  function calculateModifier(attributeValue) {
    return Math.floor((attributeValue - 10) / 2);
  }

  const handleAddAction = (action) => {
    if (!action) return;
    
    setMonster(prev => ({
      ...prev,
      additionalActions: [...(prev.additionalActions || []), action],
      featurePoints: prev.featurePoints - 1
    }));

    // Reset form
    setSelectedOption('');
    setSelectedAction('');
    setCustomEffect('');
  };

  const handleCustomActionSubmit = () => {
    if (!customEffect || !selectedAction) return;

    const newAction = {
      name: customEffect,
      type: actionType,
      description: selectedAction
    };

    setMonster(prev => ({
      ...prev,
      additionalActions: [...(prev.additionalActions || []), newAction],
      featurePoints: prev.featurePoints - 1
    }));

    // Reset form
    setSelectedOption('');
    setSelectedAction('');
    setCustomEffect('');
  };

  const renderOptionForm = () => {
    const option = FEATURE_POINT_OPTIONS.find(opt => opt.id === selectedOption);
    if (!option) return null;

    switch (option.type) {
      case 'action':
        return (
          <div className="form-section">
            <div className="option-group">
              <h3>Select Action Type</h3>
              <div className="radio-group">
                {['Action', 'Bonus Action', 'Reaction'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="actionType"
                      value={type}
                      checked={actionType === type}
                      onChange={e => {
                        setActionType(e.target.value);
                        setSelectedAction('');
                        setCustomEffect('');
                      }}
                    />
                    <span className="ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {actionType === 'Action' ? (
              <div className="form-section">
                <h3>Select Action</h3>
                <select
                  className="w-1/2 p-2 border rounded"
                  value={selectedAction}
                  onChange={e => {
                    const actionName = e.target.value;
                    setSelectedAction(actionName);
                    
                    if (actionName && actionName !== 'custom') {
                      const selectedAction = SRD_ACTIONS.find(a => a.name === actionName);
                      handleAddAction(selectedAction);
                    }
                  }}
                >
                  <option value="">Select an action...</option>
                  {SRD_ACTIONS.map(action => {
                    const strMod = calculateModifier(monster.attributes.str);
                    const dexMod = calculateModifier(monster.attributes.dex);
                    const mod = action.useDex ? dexMod : (action.useStr ? strMod : 0);
                    const modString = mod >= 0 ? `+${mod}` : mod;
                    const [dice, ...damageType] = action.damage.split(' ');
                    return (
                      <option key={action.name} value={action.name}>
                        {action.name} ({dice}{modString} {damageType.join(' ')})
                      </option>
                    );
                  })}
                  <option value="custom">Custom Action</option>
                </select>
              </div>
            ) : (
              <div className="custom-input-group">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder={`${actionType} Name`}
                  value={customEffect}
                  onChange={e => setCustomEffect(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                  value={selectedAction}
                  onChange={e => setSelectedAction(e.target.value)}
                  rows={3}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded w-full"
                  onClick={handleCustomActionSubmit}
                  disabled={!customEffect || !selectedAction}
                >
                  Add {actionType}
                </button>
              </div>
            )}
          </div>
        );

      case 'damage':
        return (
          <div className="form-section">
            <div className="option-group">
              <h3>Select Action to Modify</h3>
              <select
                className="w-full p-2 border rounded"
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value)}
              >
                <option value="">Select an action...</option>
                {monster.baseAction && (
                  <option value="baseAction">{monster.baseAction.name}</option>
                )}
                {monster.additionalActions?.map((action, index) => (
                  <option key={index} value={`additional${index}`}>
                    {action.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedAction && (
              <div className="option-group">
                <h3>Select Modification Type</h3>
                <div className="radio-group">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="damageModType"
                      checked={doublesDamage === 'diceOnly'}
                      onChange={() => {
                        setDoublesDamage('diceOnly');
                        setCustomEffect('');
                      }}
                    />
                    <span className="ml-2">Double Damage Dice Only</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="damageModType"
                      checked={doublesDamage === 'diceAndMod'}
                      onChange={() => {
                        setDoublesDamage('diceAndMod');
                        setCustomEffect('');
                      }}
                    />
                    <span className="ml-2">Double Damage Dice and Modifier</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="damageModType"
                      checked={doublesDamage === 'custom'}
                      onChange={() => {
                        setDoublesDamage('custom');
                      }}
                    />
                    <span className="ml-2">Add Secondary Damage</span>
                  </label>

                  {doublesDamage === 'custom' && (
                    <input
                      type="text"
                      className="w-full p-2 border rounded mt-4"
                      placeholder="Describe additional damage effect"
                      value={customEffect}
                      onChange={e => setCustomEffect(e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'movement':
        return (
          <div className="form-section">
            <h3>Select Movement Type</h3>
            <div className="option-group">
              {option.options.map(moveType => (
                <label key={moveType} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMovement.includes(moveType)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedMovement([...selectedMovement, moveType]);
                      } else {
                        setSelectedMovement(selectedMovement.filter(t => t !== moveType));
                      }
                    }}
                  />
                  <span className="ml-2">{moveType}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h2>Add Features ({monster.featurePoints} points remaining)</h2>
      
      <select
        className="w-full p-2 border rounded"
        value={selectedOption}
        onChange={e => setSelectedOption(e.target.value)}
      >
        <option value="">Select a feature to add...</option>
        {FEATURE_POINT_OPTIONS.map(option => (
          <option 
            key={option.id} 
            value={option.id}
            disabled={monster.featurePoints < option.cost}
          >
            {option.name} ({option.cost} {option.cost === 1 ? 'Point' : 'Points'})
          </option>
        ))}
      </select>

      {selectedOption && renderOptionForm()}
    </div>
  );
}