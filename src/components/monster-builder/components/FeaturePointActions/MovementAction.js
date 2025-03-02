// components/FeaturePointActions/MovementAction.js
import React, { useState } from 'react';
import { SIZE_MOVEMENT } from '../../constants/srd-data';  // Import SIZE_MOVEMENT

export function MovementAction({ existingMovement, monster, onSubmit }) {
  const [modificationType, setModificationType] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState('');

  // Add guard clause for monster prop
  if (!monster || !monster.size) {
    console.error('Monster prop is missing or invalid');
    return null;
  }

  // Get the original base speed from SIZE_MOVEMENT
  const baseSpeed = SIZE_MOVEMENT[monster.size]?.Walk || 30;

  // Rest of the component remains the same
  const availableMovementTypes = existingMovement
    .filter(s => s.value === 0)
    .map(s => s.type);

  const existingMovementTypes = existingMovement
    .filter(s => s.value > 0)
    .map(s => s.type);

  const handleSubmit = () => {
    if (!modificationType || !selectedSpeed) return;
    onSubmit(modificationType, selectedSpeed);
    
    setModificationType('');
    setSelectedSpeed('');
  };

  return (
    <div className="space-y-2">
      <div>
        <select
          className="w-1/2 p-2 border rounded"
          value={modificationType}
          onChange={(e) => setModificationType(e.target.value)}
        >
          <option value="">Select Modification Type...</option>
          <option value="new">Add New Movement Type</option>
          <option value="increase">Increase Existing Speed</option>
        </select>
      </div>
      <div>
        {modificationType === 'new' && availableMovementTypes.length > 0 && (
          <select
            className="w-1/2 p-2 border rounded"
            value={selectedSpeed}
            onChange={(e) => setSelectedSpeed(e.target.value)}
          >
            <option value="">Select Movement Type...</option>
            {availableMovementTypes.map((type) => (
              <option key={type} value={type}>
                {type} (Will be set to {baseSpeed}ft)
              </option>
            ))}
          </select>
        )}
      </div>
      <div>       
        {modificationType === 'increase' && existingMovementTypes.length > 0 && (
          <select
            className="w-1/2 p-2 border rounded"
            value={selectedSpeed}
            onChange={(e) => setSelectedSpeed(e.target.value)}
          >
            <option value="">Select Movement Type...</option>
            {existingMovementTypes.map((type) => {
              const currentSpeed = existingMovement.find(s => s.type === type).value;
              return (
                <option key={type} value={type}>
                  {type} (Currently {currentSpeed}ft, will increase by 10ft)
                </option>
              );
            })}
          </select>
        )}
      </div> 
      <button
        onClick={handleSubmit}
        disabled={!modificationType || !selectedSpeed}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Modify Movement
      </button>
    </div>
  );
}