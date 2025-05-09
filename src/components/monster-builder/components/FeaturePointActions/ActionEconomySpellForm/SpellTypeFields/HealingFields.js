// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/HealingFields.js
import React from 'react';
import { RANGE_MULTIPLIERS } from '../../../../constants/spell-parameters';

const HealingFields = ({
  healingDice,
  setHealingDice,
  rangeMultiplier,
  setRangeMultiplier,
  baseRange,
  disabled, 
  monster
}) => {
  console.log(baseRange, rangeMultiplier);

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <label className="block text-sm font-medium mb-1">
          Healing Amount
        </label>
        <select
          className="w-full p-2 border rounded"
          value={healingDice}
          onChange={(e) => setHealingDice(parseInt(e.target.value))}
          disabled={disabled}
        >
          <option value={1}>1d8 (Free)</option>
          <option value={2}>2d8 (+1 MP)</option>
          <option value={3}>3d8 (+2 MP)</option>
          <option value={4}>4d8 (+3 MP)</option>
          <option value={5}>5d8 (+4 MP)</option>
        </select>
        <p className="text-xs text-gray-600 mt-1">
          First 1d8 is free, each additional 1d8 costs 1 MP (up to 5d8 total)
        </p>
      </div>

      <div className="w-1/2">
        <label className="block text-sm font-medium mb-1">
          Range
        </label>
        <div>
          <select
            className="w-full p-2 border rounded"
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
    </div>
  );
};

export default HealingFields;