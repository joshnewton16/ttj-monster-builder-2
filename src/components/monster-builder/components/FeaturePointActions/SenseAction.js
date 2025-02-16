// components/FeaturePointActions/SenseAction.js
import React, { useState } from 'react';

export function SenseAction({ onSubmit, availablePoints }) {
  const [selectedSense, setSelectedSense] = useState('');

  const handleSubmit = () => {
    if (!selectedSense || availablePoints < 1) return;
    
    const range = selectedSense === 'truesight' ? 10 : 20;
    onSubmit(selectedSense, range);
    setSelectedSense('');
  };

  return (
    <div className="space-y-2">
      <select
        className="w-full p-2 border rounded"
        value={selectedSense}
        onChange={(e) => setSelectedSense(e.target.value)}
      >
        <option value="">Select Sense Type...</option>
        <option value="blindsight">Blindsight (20 ft.)</option>
        <option value="darkvision">Darkvision (20 ft.)</option>
        <option value="tremorsense">Tremorsense (20 ft.)</option>
        <option value="truesight">Truesight (10 ft.)</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={!selectedSense || availablePoints < 1}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Sense
      </button>
    </div>
  );
}