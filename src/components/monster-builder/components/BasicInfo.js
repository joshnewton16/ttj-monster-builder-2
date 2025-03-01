import React, { useEffect, useRef } from 'react';
import { SIZES, CR_TABLE, SRD_ARMOR, SIZE_MOVEMENT } from '../constants/srd-data';

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
    // Find all possible CRs based on AC
    const acMatches = CR_TABLE.filter(entry => ac >= entry.minAC);
    
    // Find all possible CRs based on HP
    const hpMatches = CR_TABLE.filter(entry => 
      hp >= entry.minHP && hp <= entry.maxHP
    );
    
    if (!acMatches.length || !hpMatches.length) {
      return null;
    }
    
    // Get the highest CR from AC matches
    const acCR = Math.max(...acMatches.map(entry => entry.cr));
    
    // Get the CR from HP range
    const hpCR = hpMatches[0].cr;
    console.log(acCR, hpCR)
    
    // Return the higher of the two CRs
    if (acCR !== hpCR) {
      return Math.round((acCR + hpCR) / 2);
    }
    
    // If results are the same, return either one
    return acCR;
  }

  // Initialize speed array if needed
  useEffect(() => {
    const initializeSpeeds = () => {
      // Check both the current and previous state to ensure we're not re-initializing
      setMonster(prev => {
        if (prev.speed === undefined || prev.speed === null) {
          return {
            ...prev,
            speed: SPEED_TYPES.map(type => ({ type, value: 0 }))
          };
        }
        return prev; // Return unchanged state if speed is already initialized
      });
    };
  
    initializeSpeeds();
  }, [setMonster]); // Only depend on setMonster

  const previousSize = useRef(monster.size);

  useEffect(() => {
    // Only update if size has actually changed
    if (previousSize.current !== monster.size) {
      if (Array.isArray(monster.speed) && monster.size) {
        const sizeSpeed = SIZE_MOVEMENT[monster.size] || 30;
        const hasActiveSpeed = monster.speed.some(s => s.value > 0);
        
        if (hasActiveSpeed) {
          setMonster(prev => ({
            ...prev,
            speed: prev.speed.map(s => ({
              ...s,
              value: s.value > 0 ? sizeSpeed : 0
            }))
          }));
        }
      }
      // Update the ref
      previousSize.current = monster.size;
    }
  }, [monster.size, monster.speed, setMonster]);

  // Update AC when armor or custom bonus changes
  useEffect(() => {
    const baseAC = SRD_ARMOR.find(a => a.name === monster.baseArmorType)?.ac || 10;
    const totalAC = baseAC + (monster.customAC || 0);
    const armorClassText = monster.baseArmorType + ' (' + totalAC + ')';
    setMonster(prev => ({ ...prev, ac: totalAC, acText: armorClassText }));
  }, [monster.baseArmorType, monster.customAC, setMonster]);

  // Update CR when AC and HP change
  useEffect(() => {
    const newCR = calculateCR(monster.ac, monster.hp);
    if (newCR !== monster.cr) {  // Only update if CR actually changed
      onCRChange(newCR);
    }
  }, [monster.ac, monster.hp, monster.cr, onCRChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Information</h2>
        <div className="space-y-2">
          <label className="block">
            Name:
            <input
              type="text"
              className="w-full p-1 border rounded mt-1"
              value={monster.name || ''}
              onChange={e => setMonster(prev => ({ ...prev, name: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block">
              Base Armor:
              <select
                className="w-full p-1 border rounded mt-1"
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
                className="w-full p-1 border rounded mt-1"
                value={monster.customAC || 0}
                onChange={e => setMonster(prev => ({ 
                  ...prev, 
                  customAC: parseInt(e.target.value) || 0 
                }))}
              />
            </label>
            

          </div>

          <div className="space-y-2">
          <label className="block">
            Hit Points:
            <input
              type="text"
              className="w-full p-1 border rounded mt-1"
              placeholder="e.g., 4d8+12 or 45"
              value={monster.diceNotation || ''}
              onChange={e => {
                const newNotation = e.target.value;
                let newHP;

                // Check if input is just a number
                if (/^\d+$/.test(newNotation)) {
                  newHP = parseInt(newNotation);
                } else {
                  // Handle dice notation
                  newHP = calculateAverageHP(newNotation);
                }

                // Single state update with all related HP fields
                setMonster(prev => ({ 
                  ...prev, 
                  diceNotation: newNotation,
                  hp: newHP,
                  hpFormula: newNotation 
                }));
              }}
            />
          </label>
          <div>
            Average HP: {monster.hp}
          </div>
          <div>
            Total AC: {monster.ac}
          </div>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <label className="block m-0">
            Size:
            <select
              className="w-full p-1 border rounded mt-1"
              value={monster.size || ''}
              onChange={e => setMonster(prev => ({ ...prev, size: e.target.value }))}
            >
              {SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            CR: {monster.cr}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Movement Speeds</h3>
          {SPEED_TYPES.map(speedType => {
            const currentValue = monster.speed?.find(s => s.type === speedType)?.value || 0;
            const sizeSpeed = SIZE_MOVEMENT[monster.size] || 30; // default to 30 if size not found
            
            return (
              <div key={speedType} className="flex items-center gap-2">
                <label className="w-20">{speedType}:</label>
                <span className="w-16">{currentValue} ft.</span>
                <button
                  type="button"
                  className={`px-3 py-1 rounded ${
                    currentValue === sizeSpeed
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    setMonster(prev => ({
                      ...prev,
                      speed: prev.speed.map(s => ({
                        ...s,
                        value: s.type === speedType ? sizeSpeed : s.value === sizeSpeed ? 0 : s.value
                      }))
                    }));
                  }}
                >
                  Set to {sizeSpeed}
                </button>
              </div>
            );
          })}
        </div>
    </div>
  );
}