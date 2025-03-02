// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/AdjustMovementFields.js
import React from 'react';
import { MOVEMENT_TYPES } from '../../../../constants/srd-data';

const AdjustMovementFields = ({
  movementAction,
  setMovementAction,
  movementType,
  setMovementType,
  hasMovementType,
  monster,
  disabled
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">
          Movement Action
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={movementAction}
            onChange={(e) => setMovementAction(e.target.value)}
            disabled={disabled}
          >
            <option value="add">Add New Movement Type</option>
            <option value="double">Double Existing Movement</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Movement Type
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            disabled={disabled}
          >
            {MOVEMENT_TYPES.map(type => (
              <option
                key={type}
                value={type}
                disabled={movementAction === 'double' && !hasMovementType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {movementAction === 'double' ?
                  (hasMovementType(type) ? ` (${monster.speed.find(s => s.type === type)?.value || 0} ft.)` : ' (Not Available)') :
                  ' (30 ft.)'}
              </option>
            ))}
          </select>
        </div>
        {movementAction === 'double' && (
          <p className="text-xs text-gray-600 mt-1">
            Can only double movement types the creature already has
          </p>
        )}
      </div>
    </>
  );
};

export default AdjustMovementFields;