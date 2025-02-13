import React, { useState } from 'react';
import { SRD_ACTIONS } from '../constants/srd-data';

export function BaseActionForm({ onSubmit, availablePoints, hasFirstAction }) {
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');

  const handleActionSelect = (e) => {
    const selectedAction = SRD_ACTIONS[e.target.value];
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
    
    const srdAction = SRD_ACTIONS.find(a => a.name === actionTitle);
    
    const newAction = {
      name: actionTitle,
      category: 'Actions',
      type: srdAction?.type || 'Custom',
      damage: srdAction?.damage || '',
      useStr: srdAction?.useStr || false,
      useDex: srdAction?.useDex || false,
      description: actionDescription,
      isFirst: !hasFirstAction,
      costFeaturePoint: hasFirstAction
    };

    onSubmit(newAction);
    setActionTitle('');
    setActionDescription('');
  };

  return (
    <div className="space-y-2">
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
        className="w-full p-2 border rounded h-16"
      />

      <button 
        onClick={handleSubmit}
        disabled={!actionTitle || !actionDescription || availablePoints <= 0}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Action
      </button>
    </div>
  );
}