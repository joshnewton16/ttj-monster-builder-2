// components/FeaturePointActions/SecondaryEffects.js
import React, { useState } from 'react';
import { DAMAGE_TYPES, CONDITIONS } from '../../constants/srd-data';

export function SecondaryEffects({ 
  existingAttacks, 
  onSubmit,
  availablePoints // Add this prop
}) {
  const [selectedAttack, setSelectedAttack] = useState('');
  const [effectType, setEffectType] = useState('');
  const [effect, setEffect] = useState('');

  const handleSubmit = () => {
    if (!selectedAttack || !effectType || !effect || availablePoints <= 0) return;
    onSubmit(selectedAttack, effectType, effect);
    
    // Reset form
    setSelectedAttack('');
    setEffectType('');
    setEffect('');
  };

  return (
    <div className="space-y-2">
      <div>
        <select
          className="w-1/2 p-2 border rounded"
          value={effectType}
          onChange={(e) => setEffectType(e.target.value)}
        >
          <option value="">Select Effect Type...</option>
          <option value="damage">Secondary Damage</option>
          <option value="condition">Add Condition</option>
        </select>
      </div>
      <div>
        <select
          className="w-1/2 p-2 border rounded"
          value={selectedAttack}
          onChange={(e) => setSelectedAttack(e.target.value)}
        >
          <option value="">Select Attack to Modify...</option>
          {existingAttacks.map((attack, index) => (
            <option key={index} value={attack.name}>
              {attack.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        {effectType === 'damage' && (
          <select
            className="w-1/2 p-2 border rounded"
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
          >
            <option value="">Select Secondary Damage Type...</option>
            {DAMAGE_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        {effectType === 'condition' && (
          <select
            className="w-1/2 p-2 border rounded"
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
          >
            <option value="">Select Condition...</option>
            {CONDITIONS.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedAttack || !effectType || !effect || availablePoints <= 0}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Secondary Effect
      </button>
    </div>
  );
}