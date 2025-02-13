// components/FeaturePointActions/SecondaryEffects.js
import React, { useState } from 'react';

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
      <select
        className="w-full p-2 border rounded"
        value={effectType}
        onChange={(e) => setEffectType(e.target.value)}
      >
        <option value="">Select Effect Type...</option>
        <option value="damage">Secondary Damage</option>
        <option value="condition">Add Condition</option>
      </select>

      <select
        className="w-full p-2 border rounded"
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

      {effectType === 'damage' && (
        <select
          className="w-full p-2 border rounded"
          value={effect}
          onChange={(e) => setEffect(e.target.value)}
        >
          <option value="">Select Secondary Damage Type...</option>
          <option value="acid">Acid</option>
          <option value="cold">Cold</option>
          <option value="fire">Fire</option>
          <option value="force">Force</option>
          <option value="lightning">Lightning</option>
          <option value="necrotic">Necrotic</option>
          <option value="poison">Poison</option>
          <option value="psychic">Psychic</option>
          <option value="radiant">Radiant</option>
          <option value="thunder">Thunder</option>
        </select>
      )}

      {effectType === 'condition' && (
        <select
          className="w-full p-2 border rounded"
          value={effect}
          onChange={(e) => setEffect(e.target.value)}
        >
          <option value="">Select Condition...</option>
          <option value="blinded">Blinded</option>
          <option value="charmed">Charmed</option>
          <option value="deafened">Deafened</option>
          <option value="frightened">Frightened</option>
          <option value="grappled">Grappled</option>
          <option value="incapacitated">Incapacitated</option>
          <option value="paralyzed">Paralyzed</option>
          <option value="petrified">Petrified</option>
          <option value="poisoned">Poisoned</option>
          <option value="prone">Prone</option>
          <option value="restrained">Restrained</option>
          <option value="stunned">Stunned</option>
          <option value="unconscious">Unconscious</option>
        </select>
      )}

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