// components/FeaturePointActions/ActionEconomySpellForm/CommonFields.js
import React from 'react';
import { 
  CASTINGTIME, 
  PRIMARYEFFECTTYPE,
  DURATION,
} from '../../../constants/spell-parameters';

const CommonFields = ({
  spellName,
  setSpellName,
  primaryEffectType,
  setPrimaryEffectType,
  castingTime,
  setCastingTime,
  duration,
  setDuration,
  disabled
}) => {
  return (
    <>
      {/* Spell Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spell Name
        </label>
        <div>
          <input
            type="text"
            className="w-1/2 p-2 border rounded"
            value={spellName}
            onChange={(e) => setSpellName(e.target.value)}
            placeholder="Enter spell name"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Primary Effect Type */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Primary Effect Type
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={primaryEffectType}
            onChange={(e) => setPrimaryEffectType(e.target.value)}
            disabled={disabled}
          >
            {PRIMARYEFFECTTYPE.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Casting Time */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Casting Time
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={castingTime}
            onChange={(e) => setCastingTime(e.target.value)}
            disabled={disabled}
          >
            {CASTINGTIME.map((time) => (
              <option key={time} value={time}>
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Action: 2 MP | Bonus Action/Reaction: 3 MP
        </p>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Duration
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={disabled}
          >
            {DURATION.map((dur) => (
              <option key={dur} value={dur}>
                {dur.charAt(0).toUpperCase() + dur.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default CommonFields;