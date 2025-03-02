import React, { useState } from 'react';

export function DoubleDamageAction({ existingAttacks, onSubmit }) {
  const [selectedAttack, setSelectedAttack] = useState('');

  const handleSubmit = () => {
    if (!selectedAttack) return;
    onSubmit(selectedAttack);
    setSelectedAttack('');
  };

  return (
    <div className="space-y-2">
      <div>
        <select
          className="w-1/2 p-2 border rounded"
          value={selectedAttack}
          onChange={(e) => setSelectedAttack(e.target.value)}
        >
          <option value="">Select Attack to Double Damage...</option>
          {existingAttacks
            .filter(attack => !attack.doubleDamage)
            .map((attack, index) => (
              <option key={index} value={attack.name}>
                {attack.name}
              </option>
            ))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedAttack}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Double Damage
      </button>
    </div>
  );
}