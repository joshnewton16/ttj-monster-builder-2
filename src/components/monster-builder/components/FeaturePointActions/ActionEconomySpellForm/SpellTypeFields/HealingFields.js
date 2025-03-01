// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/HealingFields.js
import React from 'react';

const HealingFields = ({
  healingDice,
  setHealingDice,
  disabled
}) => {
  return (
    <div>
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
  );
};

export default HealingFields;