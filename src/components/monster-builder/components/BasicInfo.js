import React, { useEffect, useRef, useState } from 'react';
import { SIZES, CR_TABLE, SIZE_MOVEMENT, CREATURETYPES } from '../constants/srd-data';
import { calculateAverageHP, calculateCR } from '../functions/globalFunctions';

const SPEED_TYPES = ['Walk', 'Fly', 'Swim', 'Climb', 'Burrow'];

export function BasicInfo({ monster, setMonster, onCRChange }) {
  // Ref to track previous size for movement speed updates
  const previousSize = useRef(monster.size);
  // Ref to track if component has mounted (for initial calculations)
  const hasInitialized = useRef(false);

  // Initialize component on first render
  useEffect(() => {
    if (!hasInitialized.current) {
      
      // Initialize speeds if not already set
      if (!monster.speed || !Array.isArray(monster.speed)) {
        setMonster(prev => ({
          ...prev,
          speed: SPEED_TYPES.map(type => ({ 
            type, 
            value: type === 'Walk' && monster.size ? SIZE_MOVEMENT[monster.size] || 30 : 0 
          }))
        }));
      }
      
      // Set initial CR if HP and AC exist but CR doesn't
      if (monster.hp && monster.ac && (!monster.cr || monster.cr === 0)) {
        const acValue = parseInt(monster.ac);
        const hpValue = parseInt(monster.hp);
        
        if (!isNaN(acValue) && !isNaN(hpValue)) {
          const initialCR = calculateCR(acValue, hpValue);
          onCRChange(initialCR);
        }
      }
      
      hasInitialized.current = true;
    }
  }, [monster, setMonster, onCRChange]);

  // Update walking speed when size changes
  useEffect(() => {
    if (previousSize.current !== monster.size && Array.isArray(monster.speed)) {
      const sizeSpeed = SIZE_MOVEMENT[monster.size] || 30;
      
      setMonster(prev => ({
        ...prev,
        speed: prev.speed.map(s => ({
          ...s,
          value: s.value > 0 ? sizeSpeed : s.value
        }))
      }));
      
      previousSize.current = monster.size;
    }
  }, [monster.size, monster.speed, setMonster]);

  // Update AC and acText when armor class or description changes
  useEffect(() => {
    if (monster.armorClass) {
      const acValue = parseInt(monster.armorClass);
      if (!isNaN(acValue)) {
        const armorClassText = monster.armorDescription ? 
          `${acValue} (${monster.armorDescription})` : 
          `${acValue}`;
        
        setMonster(prev => ({
          ...prev, 
          ac: acValue,
          acText: armorClassText
        }));
      }
    }
  }, [monster.armorClass, monster.armorDescription, setMonster]);

  // Calculate CR when AC or HP changes (but only if CR is not manually set)
  useEffect(() => {
    // Skip if CR was manually adjusted
    if (monster.isManualCR) {
      return;
    }
    
    // Skip if hp or ac are missing
    if (!monster.hp || !monster.ac) {
      return;
    }

    const newCR = calculateCR(monster.ac, monster.hp);
    
    // Only update if CR actually changed and isn't undefined
    if (newCR !== undefined && newCR !== monster.cr) {  
      onCRChange(newCR);
    }
  }, [monster.ac, monster.hp, monster.isManualCR, monster.cr, onCRChange]);
  
  // Function to handle manual CR adjustment
  function handleCRAdjustment(increment) {
    const currentCR = parseInt(monster.cr) || 0;
    const newCR = Math.max(0, currentCR + increment);
    
    // If CR didn't change, do nothing
    if (newCR === currentCR) {
      return;
    }
    
    // Mark CR as manually adjusted in monster state
    setMonster(prev => ({
      ...prev,
      isManualCR: true
    }));
    
    // Call onCRChange to update CR
    onCRChange(newCR);
  }

  // Function to reset to automatic CR calculation
  function resetToAutomaticCR() {
    // Reset manual CR flag
    setMonster(prev => ({
      ...prev,
      isManualCR: false
    }));
    
    // Recalculate CR based on current AC and HP
    if (monster.hp && monster.ac) {
      const automaticCR = calculateCR(monster.ac, monster.hp);
      if (automaticCR !== undefined) {
        onCRChange(automaticCR);
      }
    }
  }

  // Reset manual CR flag when AC or HP changes significantly
  useEffect(() => {
    if (monster.isManualCR && monster.hp && monster.ac) {
      const automaticCR = calculateCR(monster.ac, monster.hp);
      // If the automatic CR would be very different, suggest resetting
      if (Math.abs(automaticCR - monster.cr) > 2) {
        // Could add a notification here, or auto-reset
      }
    }
  }, [monster.ac, monster.hp, monster.cr, monster.isManualCR]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Information</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Left column - Core info */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Name field */}
            <div>
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
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Size field */}
            <div> 
              <label className="block">
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
          
            {/* Creature Type field */}
            <div>
              <label className="block">
                Creature Type:
                <select
                  className="w-full p-1 border rounded mt-1"
                  value={monster.creaturetype || ''}
                  onChange={e => setMonster(prev => ({ ...prev, creaturetype: e.target.value }))}
                >
                  {CREATURETYPES.map(creaturetype => (
                    <option key={creaturetype} value={creaturetype}>{creaturetype}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Armor Class with description */}
            <div>
              <label className="block">
                Armor Class:
                <div className="flex gap-2">
                  <select
                    className="w-1/3 p-1 border rounded mt-1"
                    value={monster.armorClass || '13'}
                    onChange={e => setMonster(prev => ({ ...prev, armorClass: e.target.value }))}
                  >
                    {Array.from({ length: 8 }, (_, i) => (i + 13).toString()).map(ac => (
                      <option key={ac} value={ac}>{ac}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="w-2/3 p-1 border rounded mt-1"
                    placeholder="Armor Description (e.g., natural armor)"
                    value={monster.armorDescription || ''}
                    onChange={e => setMonster(prev => ({ ...prev, armorDescription: e.target.value }))}
                  />
                </div>
              </label>
            </div>

            {/* Hit Points */}
            <div>
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

                    // Skip update if HP calculation failed
                    if (isNaN(newHP)) {
                      return;
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
              <div className="text-sm mt-1 flex items-center flex-wrap">
                <span>Average HP: {monster.hp || 0}</span>
                <span className="mx-2">|</span>
                <span className={monster.isManualCR ? 'text-blue-600 font-semibold' : ''}>
                  CR: {monster.cr || 0}
                  {monster.isManualCR && ' (Manual)'}
                </span>
                <div className="ml-2 flex">
                  <button
                    type="button"
                    className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded-l"
                    onClick={() => handleCRAdjustment(-1)}
                    title="Decrease CR"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded-r"
                    onClick={() => handleCRAdjustment(1)}
                    title="Increase CR"
                  >
                    +
                  </button>
                </div>
                {monster.isManualCR && (
                  <button
                    type="button"
                    className="ml-2 px-2 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded text-xs"
                    onClick={resetToAutomaticCR}
                    title="Reset to automatic CR calculation"
                  >
                    Auto
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Movement speeds */}
          <div className="space-y-2">
            <h3 className="font-semibold">Movement Speeds</h3>
            <div className="grid grid-cols-2 gap-2">
              {Array.isArray(monster.speed) && SPEED_TYPES.map(speedType => {
                    const currentValue = monster.speed?.find(s => s.type === speedType)?.value || 0;
                    const sizeSpeed = SIZE_MOVEMENT[monster.size] || 30;
                    
                    return (
                      <div key={speedType} className="flex items-center gap-2">
                        <label className="w-16">{speedType}:</label>
                        <span className="w-12">{currentValue} ft.</span>
                        <button
                          type="button"
                          className={`px-2 py-1 text-sm rounded ${
                            currentValue === sizeSpeed
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          onClick={() => {
                            setMonster(prev => {
                              const newSpeed = prev.speed.map(s => ({
                                ...s,
                                value: 0
                              }));
                              
                              if (currentValue !== sizeSpeed) {
                                const targetIndex = newSpeed.findIndex(s => s.type === speedType);
                                if (targetIndex >= 0) {
                                  newSpeed[targetIndex].value = sizeSpeed;
                                }
                              }
                              
                              return {
                                ...prev,
                                speed: newSpeed
                              };
                            });
                          }}
                        >
                          {currentValue === sizeSpeed ? 'Clear' : `Set to ${sizeSpeed}`}
                        </button>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
        
        {/* Right column - CR Reference table */}
        <div>
          <div className="bg-white p-3 border rounded h-full">
            <h3 className="font-semibold mb-2 text-sm">CR Reference Table</h3>
            <div className="overflow-auto" style={{ maxHeight: "300px" }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">CR</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">AC</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Min HP</th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Max HP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {CR_TABLE.map((entry, index) => (
                    <tr 
                      key={entry.cr} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                        entry.cr === monster.cr ? 'bg-blue-100' : ''
                      }`}
                    >
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{entry.cr}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{entry.minAC}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{entry.minHP}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{entry.maxHP}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}