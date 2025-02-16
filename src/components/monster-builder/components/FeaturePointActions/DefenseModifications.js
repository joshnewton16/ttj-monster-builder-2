// components/FeaturePointActions/DefenseModifications.js
import React, { useState } from 'react';
import { DAMAGE_TYPES, CONDITIONS } from '../../constants/srd-data';

export function DefenseModifications({ 
  onSubmit,  // This is being passed from FeaturePointActions
  availablePoints 
}) {
  const [modificationType, setModificationType] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleSubmit = () => {
    if (!modificationType || !selectedType) return;
    
    // Check if we have enough points
    if (modificationType === 'damageImmunity' && availablePoints < 2) return;
    if (['conditionImmunity', 'resistance'].includes(modificationType) && availablePoints < 1) return;

    // Pass modification type and selected type to the parent's onSubmit handler
    onSubmit(modificationType, selectedType);

    // Reset form
    setModificationType('');
    setSelectedType('');
  };

  return (
    <div className="space-y-2">
      <select
        className="w-full p-2 border rounded"
        value={modificationType}
        onChange={(e) => setModificationType(e.target.value)}
      >
        <option value="">Select Modification Type...</option>
        <option value="damageImmunity">Damage Immunity (2 points)</option>
        <option value="conditionImmunity">Condition Immunity</option>
        <option value="resistance">Damage Resistance</option>
      </select>

      {modificationType && (
        <select
          className="w-full p-2 border rounded"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Select Type...</option>
          {(modificationType === 'conditionImmunity' ? CONDITIONS : DAMAGE_TYPES).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleSubmit}
        disabled={!modificationType || !selectedType || 
          (modificationType === 'damageImmunity' && availablePoints < 2) ||
          (['conditionImmunity', 'resistance'].includes(modificationType) && availablePoints < 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Modification
      </button>
    </div>
  );
}