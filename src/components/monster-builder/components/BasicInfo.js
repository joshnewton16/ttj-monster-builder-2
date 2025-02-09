// BasicInfo.js
import React from 'react';
import { SIZES } from '../constants/srd-data';

export function BasicInfo({ monster, setMonster, onCRChange }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Information</h2>
      <div className="space-y-2">
        <label className="block">
          Name:
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={monster.name}
            onChange={e => setMonster(prev => ({ ...prev, name: e.target.value }))}
          />
        </label>
        <br></br>
        <br></br>
        <div className="text-sm">
        <label className="block">
          CR:
          <input
            type="number"
            min="0"
            className="w-full p-2 border rounded"
            value={monster.cr}
            onChange={e => onCRChange(parseInt(e.target.value))}
          />
        </label>
        </div>
        <br></br>
        <div className="text-sm">
          <label className="block">
          Proficiency Bonus: +{monster.proficiencyBonus}
          </label>
        </div>
        <br></br>
        <label className="block">
          Size:
          <select
            className="w-full p-2 border rounded"
            value={monster.size}
            onChange={e => setMonster(prev => ({ ...prev, size: e.target.value }))}
          >
            {SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <br></br>
        <br></br>
      </div>
    </div>
  );
}