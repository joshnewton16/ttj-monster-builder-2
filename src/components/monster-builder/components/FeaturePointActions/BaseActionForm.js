import React, { useState } from 'react';
import { SRD_ACTIONS } from '../../constants/srd-data';

export function BaseActionForm({ 
  onSubmit, 
  availablePoints, 
  hasFirstAction,
  isLegendary = false,
  legendaryActions = []
}) {
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionType, setActionType] = useState('Actions');

  const handleActionSelect = (e) => {
    const actions = isLegendary ? legendaryActions : SRD_ACTIONS;
    const selectedAction = actions[e.target.value];
    if (selectedAction) {
      setActionTitle(selectedAction.name);
      
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

  const handleSubmit = () => {
    if (!actionTitle || !actionDescription) return;
    
    const actions = isLegendary ? legendaryActions : SRD_ACTIONS;
    const srdAction = actions.find(a => a.name === actionTitle);
    
    let newAction = {
      name: actionTitle,
      category: isLegendary ? 'Legendary' : actionType,
      type: srdAction?.type || 'Custom',
      damage: srdAction?.damage || '',
      useStr: srdAction?.useStr || false,
      useDex: srdAction?.useDex || false,
      description: actionDescription,
    };

    // Handle feature point costs and isFirst flag
    if (isLegendary) {
      newAction.costFeaturePoint = true;
      newAction.isFirst = false;
      newAction.featurePointCost = 2;  // Set the cost to 2 points
    } else if (actionType === 'Actions') {
      newAction.isFirst = !hasFirstAction;
      newAction.costFeaturePoint = hasFirstAction;
    } else {
      newAction.isFirst = false;
      newAction.costFeaturePoint = true;
    }

    onSubmit(newAction);
    setActionTitle('');
    setActionDescription('');
    setActionType('Actions');
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">
        {isLegendary ? 'Legendary Action' : 'Action'}
      </h3>
      
      {/* Only show action type toggle for non-legendary actions */}
      {!isLegendary && (
        <div className="flex space-x-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${
              actionType === 'Actions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActionType('Actions')}
          >
            Action
          </button>
          <button
            className={`px-3 py-1 rounded ${
              actionType === 'Bonus Actions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActionType('Bonus Actions')}
          >
            Bonus Action
          </button>
          <button
            className={`px-3 py-1 rounded ${
              actionType === 'Reactions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActionType('Reactions')}
          >
            Reaction
          </button>
        </div>
      )}
      <div>
        <select 
          className="w-1/2 p-2 border rounded"
          onChange={handleActionSelect}
          value=""
        >
          <option value="">
            {isLegendary ? 'Select a Legendary Action Template...' : 'Select an Action Template...'}
          </option>
          {(isLegendary ? legendaryActions : SRD_ACTIONS).map((action, index) => (
            <option key={index} value={index}>
              {action.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <input
          type="text"
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          placeholder={isLegendary ? "Legendary Action Title" : "Action Title"}
          className="w-1/2 p-2 border rounded"
        />
      </div>
      <div>
        <textarea
          value={actionDescription}
          onChange={(e) => setActionDescription(e.target.value)}
          placeholder={isLegendary ? "Legendary Action Description" : "Action Description"}
          className="w-1/2 p-2 border rounded h-16"
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={!actionTitle || !actionDescription || availablePoints < (isLegendary ? 2 : 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add {isLegendary ? 'Legendary Action' : actionType.slice(0, -1)}
      </button>
    </div>
  );
}