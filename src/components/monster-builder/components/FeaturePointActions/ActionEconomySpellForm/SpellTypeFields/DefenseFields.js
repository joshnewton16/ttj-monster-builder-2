// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/DefenseFields.js
import React from 'react';
import { CONDITIONS } from '../../../../constants/spell-parameters';

const DefenseFields = ({
  defenseType,
  setDefenseType,
  acBonus,
  setAcBonus,
  immunityCondition,
  setImmunityCondition,
  defenseDuration,
  setDefenseDuration,
  disabled
}) => {
  return (
    <>
      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">
            Defense Type
          </label>
          <div>
            <select
              className="w-full p-2 border rounded"
              value={defenseType}
              onChange={(e) => setDefenseType(e.target.value)}
              disabled={disabled}
            >
              <option value="ac">AC Bonus</option>
              <option value="immunity">Condition Immunity</option>
            </select>
          </div>
        </div>
        
        {defenseType === 'ac' ? (
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">
              AC Bonus
            </label>
            <div>
              <select
                className="w-full p-2 border rounded"
                value={acBonus}
                onChange={(e) => setAcBonus(parseInt(e.target.value))}
                disabled={disabled}
              >
                <option value={2}>+2 AC (Free)</option>
                <option value={4}>+4 AC (+1 MP)</option>
                <option value={6}>+6 AC (+2 MP)</option>
                <option value={8}>+8 AC (+3 MP)</option>
              </select>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              First +2 AC is free, each additional +2 costs 1 MP
            </p>
          </div>
        ) : (
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">
              Condition Immunity
            </label>
            <div>
              <select
                className="w-full p-2 border rounded"
                value={immunityCondition}
                onChange={(e) => setImmunityCondition(e.target.value)}
                disabled={disabled}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond.charAt(0).toUpperCase() + cond.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Condition immunity costs 2 MP
            </p>
          </div>
        )}
      </div>
      
    </>
  );
};

export default DefenseFields;