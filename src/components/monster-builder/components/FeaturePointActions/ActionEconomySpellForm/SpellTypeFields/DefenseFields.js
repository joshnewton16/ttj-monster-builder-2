// components/FeaturePointActions/ActionEconomySpellForm/SpellTypeFields/DefenseFields.js
import React from 'react';
import { CONDITIONS, DEFENSE_DURATIONS } from '../../../../constants/spell-parameters';

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
      <div>
        <label className="block text-sm font-medium mb-1">
          Defense Type
        </label>
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
      
      {defenseType === 'ac' ? (
        <div>
          <label className="block text-sm font-medium mb-1">
            AC Bonus
          </label>
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
          <p className="text-xs text-gray-600 mt-1">
            First +2 AC is free, each additional +2 costs 1 MP
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-1">
            Condition Immunity
          </label>
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
          <p className="text-xs text-gray-600 mt-1">
            Condition immunity costs 2 MP
          </p>
        </div>
      )}
      
      {/* Defense Duration */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Duration
        </label>
        <select
          className="w-full p-2 border rounded"
          value={defenseDuration}
          onChange={(e) => setDefenseDuration(e.target.value)}
          disabled={disabled}
        >
          {DEFENSE_DURATIONS.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label} {duration.mpCost > 0 ? `(+${duration.mpCost} MP)` : '(Free)'}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-1">
          Basic duration is until the end of next turn, extending costs 1 MP per round
        </p>
      </div>
    </>
  );
};

// Export the DEFENSE_DURATIONS constant for use in cost calculations
export { DEFENSE_DURATIONS };

export default DefenseFields;