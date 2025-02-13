// Attributes.js
import React from 'react';

export function Attributes({ monster, setMonster, availablePoints, setAvailablePoints }) {
  // Calculate total available points including feature points
  const totalAvailablePoints = availablePoints + (monster.attributePointsFromFeatures || 0);

  function handleAttributeChange(attr, value) {
    if (value >= 4 && value <= 20) {
      const diff = value - monster.attributes[attr];
      if (totalAvailablePoints - diff >= 0 || diff < 0) {
        setMonster(prev => ({
          ...prev,
          attributes: { ...prev.attributes, [attr]: value }
        }));
        setAvailablePoints(prev => prev - diff);
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Attributes</h2>
      <div>
        Base Points: {availablePoints}
        {monster.attributePointsFromFeatures && (
          <span className="ml-2 text-green-600">
            (+{monster.attributePointsFromFeatures} from Feature Points)
          </span>
        )}
        <div className="text-lg font-semibold">
          Total Available: {totalAvailablePoints}
        </div>
      </div>
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

      {/* Added Saving Throws Section */}
      <div className="proficiencies-section">
        <h3 className="section-header">
          Saving Throws (Max: {Math.floor(monster.proficiencyBonus / 2)})
        </h3>
        <div className="proficiencies-grid">
          {Object.keys(monster.attributes).map(save => (
            <div key={save} className="proficiency-item">
              <input
                type="checkbox"
                checked={monster.savingThrows.includes(save)}
                onChange={e => {
                  if (e.target.checked && monster.savingThrows.length < Math.floor(monster.proficiencyBonus / 2)) {
                    setMonster(prev => ({
                      ...prev,
                      savingThrows: [...prev.savingThrows, save]
                    }));
                  } else if (!e.target.checked) {
                    setMonster(prev => ({
                      ...prev,
                      savingThrows: prev.savingThrows.filter(s => s !== save)
                    }));
                  }
                }}
              />
              <label>{save.toUpperCase()}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}