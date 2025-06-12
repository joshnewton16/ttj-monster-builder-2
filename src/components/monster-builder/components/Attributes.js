import React from 'react';
import { getSavingThrowCount } from '../constants/methodology-calcs';

export function Attributes({ monster, setMonster }) {
  let maxPointsForCR = 10;
  
  if (monster.cr >= 2 && monster.cr <= 5) maxPointsForCR = 20;
  if (monster.cr >= 6 && monster.cr <= 8) maxPointsForCR = 25;
  if (monster.cr >= 9 && monster.cr <= 12) maxPointsForCR = 30;
  if (monster.cr >= 13 && monster.cr <= 15) maxPointsForCR = 35;
  if (monster.cr > 15) maxPointsForCR = 40;

  //TroubleShooting
  //console.log('maxPointsForCR', maxPointsForCR);

  // Calculate spent points (how many points above base value 8 have been spent)
  const calculateSpentPoints = () => {
    return Object.values(monster.attributes).reduce((total, value) => {
      return total + (value - 10); // 8 is the base attribute value
    }, 0);
  };

  // Calculate total spent and available
  const spentPoints = calculateSpentPoints();
  const featurePoints = monster.attributePointsFromFeatures || 0;
  const featureSavingThrows = monster.savingThrowsFromFeatures || 0;
  const totalAvailable = maxPointsForCR + featurePoints - spentPoints;

  function handleAttributeChange(attr, value) {
    if (value >= 4 && value <= 20) {
      const diff = value - monster.attributes[attr];
      if (totalAvailable - diff >= 0 || diff < 0) {
        setMonster(prev => ({
          ...prev,
          attributes: { ...prev.attributes, [attr]: value }
        }));
        // We don't modify availablePoints directly anymore, we compute it from maxPointsForCR and spent points
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Attributes</h2>
      <div>
        <div>
          Base Points: {maxPointsForCR}
          {featurePoints > 0 && (
            <span className="ml-2 text-green-600">
              (+{featurePoints} from Feature Points)
            </span>
          )}
        </div>
        <div>
          Spent Points: {spentPoints}
        </div>
        <div className={`text-lg font-semibold ${totalAvailable < 0 ? 'text-red-600 font-bold' : ''}`}>
          Total Available: {totalAvailable}
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
          Saving Throws (Max: {getSavingThrowCount(monster)})
        </h3>
        {featureSavingThrows > 0 && (
            <span className="ml-2 text-green-600">
              (+{featureSavingThrows} from Feature Points)
            </span>
          )}
        <div className="proficiencies-grid">
          {Object.keys(monster.attributes).map(save => (
            <div key={save} className="proficiency-item">
              <input
                type="checkbox"
                checked={monster.savingThrows.includes(save)}
                onChange={e => {
                  if (e.target.checked && monster.savingThrows.length < (getSavingThrowCount(monster) + featureSavingThrows)) {
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