// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/ControlFields.js
import React from 'react';
import { 
  SAVINGTHROWS, 
  CONDITIONS,
  RANGE_MULTIPLIERS
} from '../../../../constants/spell-parameters';

const ControlFields = ({
  controlSavingThrow,
  setControlSavingThrow,
  controlCondition,
  setControlCondition,
  rangeMultiplier,
  setRangeMultiplier,
  baseRange,
  disabled
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">
          Saving Throw
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={controlSavingThrow}
            onChange={(e) => setControlSavingThrow(e.target.value)}
            disabled={disabled}
          >
            {SAVINGTHROWS.map((save) => (
              <option key={save} value={save}>
                {save}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Applied Condition
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={controlCondition}
            onChange={(e) => setControlCondition(e.target.value)}
            disabled={disabled}
          >
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Range for Control spells */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Range
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={rangeMultiplier}
            onChange={(e) => setRangeMultiplier(parseInt(e.target.value, 10))}
            disabled={disabled}
          >
            {RANGE_MULTIPLIERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({baseRange * option.value} ft.) {option.mpCost > 0 ? `+${option.mpCost} MP` : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Base range: {baseRange} ft. (highest movement speed)
        </p>
      </div>
    </>
  );
};

export default ControlFields;