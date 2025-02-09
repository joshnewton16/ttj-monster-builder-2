import React, { useState, useEffect } from 'react';
import { SIZES, SRD_ARMOR, MOVEMENT_TYPES, SIZE_MOVEMENT } from '../constants/srd-data';

export function BasicInfo({ monster, setMonster, onCRChange }) {
  const [customAC, setCustomAC] = useState(0);
  const [baseArmorType, setBaseArmorType] = useState('Natural Armor');
  const [diceNotation, setDiceNotation] = useState('');

  function calculateAverageHP(notation) {
    if (!notation) return 0;
    
    const match = notation.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (!match) return 0;
    
    const [, numDice, diceSize, bonus] = match;  // removed unused underscore
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

  // Update AC when armor or custom bonus changes
  useEffect(() => {
    const baseAC = SRD_ARMOR.find(a => a.name === baseArmorType)?.ac || 10;
    const totalAC = baseAC + customAC;
    const armorClassText = baseArmorType + '(' + totalAC + ')';
    setMonster(prev => ({ ...prev, ac: totalAC, acText: armorClassText }));
  }, [baseArmorType, customAC, setMonster]);

  // Update movement speed when size changes
  useEffect(() => {
    const baseSpeed = SIZE_MOVEMENT[monster.size] || 30;
    const currentSpeedType = monster.speed?.type || 'Walk';
    setMonster(prev => ({ 
      ...prev, 
      speed: { type: currentSpeedType, value: baseSpeed }
    }));
  }, [monster.size, monster.speed?.type, setMonster]);

  // Update CR when AC and HP change
  useEffect(() => {
    const calculatedCR = calculateCR(monster.ac, monster.hp);
    if (calculatedCR) {
      onCRChange(calculatedCR);
    }
  }, [monster.ac, monster.hp, onCRChange]);

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
              value={monster.name}
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
                value={baseArmorType}
                onChange={e => setBaseArmorType(e.target.value)}
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
                value={customAC}
                onChange={e => setCustomAC(parseInt(e.target.value) || 0)}
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
                placeholder="e.g., 4d8+12"
                value={diceNotation}
                onChange={e => {
                  setDiceNotation(e.target.value);
                  const avgHP = calculateAverageHP(e.target.value);
                  setMonster(prev => ({ ...prev, hp: avgHP, hpFormula: e.target.value }));
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
              value={monster.size}
              onChange={e => setMonster(prev => ({ ...prev, size: e.target.value }))}
            >
              {SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>

          <label className="block">
            Movement Type:
            <select
              className="w-full p-2 border rounded mt-2"
              value={monster.speed?.type}
              onChange={e => setMonster(prev => ({
                ...prev,
                speed: { type: e.target.value, value: SIZE_MOVEMENT[monster.size] }
              }))}
            >
              {MOVEMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            CR: {monster.cr}
          </div>
          <div>
            Speed: {monster.speed?.value}ft ({monster.speed?.type})
          </div>
        </div>
      </div>
    </div>
  );
}