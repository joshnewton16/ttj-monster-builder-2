// Attributes.js
import React from 'react';

export function Attributes({ monster, setMonster, availablePoints, setAvailablePoints }) {
  function handleAttributeChange(attr, value) {
    if (value >= 4 && value <= 20) {
      const diff = value - monster.attributes[attr];
      if (availablePoints - diff >= 0 || diff < 0) {
        setMonster(prev => ({
          ...prev,
          attributes: { ...prev.attributes, [attr]: value }
        }));
        setAvailablePoints(prev => prev - diff);
      }
    }
  }

  return (
    <div>
      <h2>Attributes</h2>
      <div>Available Points: {availablePoints}</div>
      <div className="attributes-grid">
        {Object.entries(monster.attributes).map(([attr, value]) => (
          <div key={attr} className="attribute-input-group">
            <label className="attribute-label">
              {attr.toUpperCase()}:
            </label>
            <input
              type="number"
              className="attribute-input"
              min="4"
              max="20"
              value={value}
              onChange={e => handleAttributeChange(attr, parseInt(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}