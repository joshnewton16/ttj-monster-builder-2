import React, { useState, useEffect } from 'react';
import { SIZES, SRD_ARMOR, MOVEMENT_TYPES, SIZE_MOVEMENT } from '../constants/srd-data';

export function BasicInfo({ monster, setMonster, onCRChange }) {
  const [customAC, setCustomAC] = useState(0);
  const [baseArmorType, setBaseArmorType] = useState('Natural Armor');
  const [diceNotation, setDiceNotation] = useState('');

  function calculateProficiencyBonus(cr) {
    return Math.floor((cr - 1) / 4) + 2;
  }

  // Function to calculate average from dice notation (e.g., "2d6+3")
  function calculateAverageHP(notation) {
    if (!notation) return 0;
    
    const match = notation.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (!match) return 0;
    
    const [_, numDice, diceSize, bonus] = match;
    const average = (parseInt(numDice) * (parseInt(diceSize) + 1) / 2) + (parseInt(bonus) || 0);
    return Math.floor(average);
  }

  // Function to calculate CR based on AC and HP
  function calculateCR(ac, hp) {
    // This is a simplified version - you might want to make this more sophisticated
    if (ac && hp) {
      if (ac <= 13 && hp <= 50) return 1;
      if (ac <= 14 && hp <= 100) return 2;
      if (ac <= 15 && hp <= 150) return 3;
      if (ac <= 16 && hp <= 200) return 4;
      if (ac <= 17 && hp <= 250) return 5;
      // Add more ranges as needed
    }
    return null;
  }

  // Update AC when armor or custom bonus changes
  useEffect(() => {
    const baseAC = SRD_ARMOR.find(a => a.name === baseArmorType)?.ac || 10;
    const totalAC = baseAC + customAC;
    setMonster(prev => ({ ...prev, ac: totalAC }));
  }, [baseArmorType, customAC]);

  // Update movement speed when size changes
  useEffect(() => {
    const baseSpeed = SIZE_MOVEMENT[monster.size] || 30;
    setMonster(prev => ({ 
      ...prev, 
      speed: { type: monster.speed?.type || 'Walk', value: baseSpeed }
    }));
  }, [monster.size]);

  // Update CR when AC and HP change
  useEffect(() => {
    const calculatedCR = calculateCR(monster.ac, monster.hp);
    if (calculatedCR) {
      onCRChange(calculatedCR);
    }
  }, [monster.ac, monster.hp]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Information</h2>
      <div className="space-y-4">
        <label className="block">
          Name:
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={monster.name}
            onChange={e => setMonster(prev => ({ ...prev, name: e.target.value }))}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block">
              Base Armor:
              <select
                className="w-full p-2 border rounded"
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
            
            <label className="block mt-2">
              Additional AC:
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={customAC}
                onChange={e => setCustomAC(parseInt(e.target.value) || 0)}
              />
            </label>
            
            <div className="mt-2">
              Total AC: {monster.ac}
            </div>
          </div>

          <div>
            <label className="block">
              Hit Points:
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="e.g., 4d8+12"
                value={diceNotation}
                onChange={e => {
                  setDiceNotation(e.target.value);
                  const avgHP = calculateAverageHP(e.target.value);
                  setMonster(prev => ({ ...prev, hp: avgHP, hpFormula: e.target.value }));
                }}
              />
            </label>
            <div className="mt-2">
              Average HP: {monster.hp}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <label className="block">
            Movement Type:
            <select
              className="w-full p-2 border rounded"
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

        <div className="grid grid-cols-2 gap-4">
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