import React, { useEffect } from 'react';
import { SIZES, SRD_ARMOR } from '../constants/srd-data';

const SPEED_TYPES = ['Walk', 'Fly', 'Swim', 'Climb', 'Burrow'];

export function BasicInfo({ monster, setMonster, onCRChange }) {
  function calculateAverageHP(notation) {
    if (!notation) return 0;
    
    const match = notation.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (!match) return 0;
    
    const [, numDice, diceSize, bonus] = match;
    const average = (parseInt(numDice) * (parseInt(diceSize) + 1) / 2) + (parseInt(bonus) || 0);
    return Math.floor(average);
  }

  function calculateCR(ac, hp) {
    if (ac && hp) {
      if (ac <= 13 && hp <= 50) return 1;
      if (ac <= 14 && hp <= 100) return 2;
      if (ac <= 15 && hp <= 150) return 3;
      if (ac <= 16 && hp <= 200) return 4;
      if (ac <= 17 && hp <= 250) return 5;
    }
    return null;
  }

  // Initialize speed array if needed
  useEffect(() => {
    if (!Array.isArray(monster.speed)) {
      setMonster(prev => ({
        ...prev,
        speed: SPEED_TYPES.map(type => ({ type, value: 0 }))
      }));
    }
  }, [monster.speed, setMonster]);

  // Update AC when armor or custom bonus changes
  useEffect(() => {
    const baseAC = SRD_ARMOR.find(a => a.name === monster.baseArmorType)?.ac || 10;
    const totalAC = baseAC + (monster.customAC || 0);
    const armorClassText = monster.baseArmorType + ' (' + totalAC + ')';
    setMonster(prev => ({ ...prev, ac: totalAC, acText: armorClassText }));
  }, [monster.baseArmorType, monster.customAC, setMonster]);

  // Update CR when AC and HP change
  useEffect(() => {
    const calculatedCR = calculateCR(monster.ac, monster.hp);
    if (calculatedCR) {
      onCRChange(calculatedCR);
    }
  }, [monster.ac, monster.hp, onCRChange]);

/*   const handleSpeedChange = (speedType, newValue) => {
    if (newValue === 30) {
      const hasOther30 = monster.speed.some(s => s.type !== speedType && s.value === 30);
      if (hasOther30) {
        // Don't allow the change if another speed is already 30
        return;
      }
    }
    setMonster(prev => ({
      ...prev,
      speed: prev.speed.map(s => 
        s.type === speedType ? { ...s, value: newValue } : s
      )
    }));
  }; */

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Basic Information</h2>
      <div className="space-y-8">
        <div className="space-y-6">
          <label className="block">
            Name:
            <input
              type="text"
              className="w-full p-2 border rounded mt-2"
              value={monster.name || ''}
              onChange={e => setMonster(prev => ({ ...prev, name: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <label className="block">
              Base Armor:
              <select
                className="w-full p-2 border rounded mt-2"
                value={monster.baseArmorType || 'Natural Armor'}
                onChange={e => setMonster(prev => ({ ...prev, baseArmorType: e.target.value }))}
              >
                {SRD_ARMOR.map(armor => (
                  <option key={armor.name} value={armor.name}>
                    {armor.name} (AC {armor.ac})
                  </option>
                ))}
              </select>
            </label>
            
            <label className="block">
              Additional AC:
              <input
                type="number"
                className="w-full p-2 border rounded mt-2"
                value={monster.customAC || 0}
                onChange={e => setMonster(prev => ({ 
                  ...prev, 
                  customAC: parseInt(e.target.value) || 0 
                }))}
              />
            </label>
            
            <div>
              Total AC: {monster.ac}
            </div>
          </div>

          <div className="space-y-6">
          <label className="block">
            Hit Points:
            <input
              type="text"
              className="w-full p-2 border rounded mt-2"
              placeholder="e.g., 4d8+12 or 45"
              value={monster.diceNotation || ''}
              onChange={e => {
                const newNotation = e.target.value;
                // Check if input is just a number
                if (/^\d+$/.test(newNotation)) {
                  const hp = parseInt(newNotation);
                  setMonster(prev => ({ 
                    ...prev, 
                    diceNotation: newNotation,
                    hp: hp, 
                    hpFormula: newNotation 
                  }));
                } else {
                  // Handle dice notation as before
                  const avgHP = calculateAverageHP(newNotation);
                  setMonster(prev => ({ 
                    ...prev, 
                    diceNotation: newNotation,
                    hp: avgHP, 
                    hpFormula: newNotation 
                  }));
                }
              }}
            />
          </label>
            <div>
              Average HP: {monster.hp}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <label className="block">
            Size:
            <select
              className="w-full p-2 border rounded mt-2"
              value={monster.size || ''}
              onChange={e => setMonster(prev => ({ ...prev, size: e.target.value }))}
            >
              {SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            CR: {monster.cr}
          </div>
        </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold">Movement Speeds</h3>
          <p className="text-sm text-gray-600">Set one speed type to 30 ft.</p>
          {SPEED_TYPES.map(speedType => {
            const currentValue = monster.speed?.find(s => s.type === speedType)?.value || 0;
            
            return (
              <div key={speedType} className="flex items-center gap-2">
                <label className="w-20">{speedType}:</label>
                <span className="w-16">{currentValue} ft.</span>
                <button
                  type="button"
                  className={`px-3 py-1 rounded ${
                    currentValue === 30 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    setMonster(prev => ({
                      ...prev,
                      speed: prev.speed.map(s => ({
                        ...s,
                        value: s.type === speedType ? 30 : s.value === 30 ? 0 : s.value
                      }))
                    }));
                  }}
                >
                  Set to 30
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}