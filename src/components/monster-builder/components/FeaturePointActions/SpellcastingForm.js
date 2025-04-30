// components/FeaturePointActions/SpellcastingForm.js
import React, { useState, useMemo } from 'react';
import { FULL_SPELL_LIST } from '../../constants/spell-list';
import { SPELLCASTERLEVELS } from '../../constants/srd-data';

export function SpellcastingForm({ onSubmit, availablePoints, monster, currentMagicPoints }) {
  const [spellcastingAbility, setSpellcastingAbility] = useState('');
  const [selectedBasicSpells, setSelectedBasicSpells] = useState([]);
  const [levelFilter, setLevelFilter] = useState('all');

  function getLevelFromCR(challengeRating) {
    // Convert the CR to string for consistent comparison
    const crString = String(challengeRating);
    
    // Find the matching record in the table
    const matchingRecord = SPELLCASTERLEVELS.find(record => String(record.cr) === crString);
    
    // Return the level if found, otherwise provide a fallback
    return matchingRecord ? matchingRecord.level : 20;
  }

  // Calculate spellcasting stats based on CR and proficiency
  const spellcastingStats = useMemo(() => {
    const baseStat = getLevelFromCR(monster.cr);
    const matchingRecord = SPELLCASTERLEVELS.find(record => String(record.cr) === String(monster.cr));
    
    return {
      magicPoints: Math.floor(baseStat) * 2, // Magic points based on caster level
      casterLevel: Math.max(2, Math.floor(baseStat)),
      spellSlots: matchingRecord ? matchingRecord.spellSlots : [0,0,0,0,0,0,0,0,0]
    };
  }, [monster.cr]);

  // Get current available magic points
  const availableMagicPoints = useMemo(() => {
    // If we already have magic points, use those values
    if (currentMagicPoints && currentMagicPoints.total > 0) {
      return currentMagicPoints.total - currentMagicPoints.used - selectedBasicSpells.length;
    }
    // Otherwise, calculate from scratch
    return spellcastingStats.magicPoints - selectedBasicSpells.length;
  }, [currentMagicPoints, spellcastingStats.magicPoints, selectedBasicSpells.length]);

  // Count spells by level
  const spellCountByLevel = useMemo(() => {
    const counts = {};
    selectedBasicSpells.forEach(spell => {
      counts[spell.level] = (counts[spell.level] || 0) + 1;
    });
    return counts;
  }, [selectedBasicSpells]);

  // Filter only for basic spells (no flags) and exclude already selected spells
  const availableBasicSpells = useMemo(() => {
    const maxSpellLevel = Math.floor(spellcastingStats.casterLevel / 2);
    const selectedSpellNames = selectedBasicSpells.map(spell => spell.name);
    
    return FULL_SPELL_LIST.filter(spell => {
      // Check spell level against caster level first
      if (spell.level > maxSpellLevel) {
        return false;
      }

      // Exclude already selected spells
      if (selectedSpellNames.includes(spell.name)) {
        return false;
      }

      // Check if we've reached the limit of 2 spells per level
      if ((spellCountByLevel[spell.level] || 0) >= 2) {
        return false;
      }

      // Level filter
      if (levelFilter !== 'all' && spell.level !== parseInt(levelFilter)) {
        return false;
      }

      // Only basic spells - those without flags
      return !spell.causes_damage && 
             !spell.prevents_damage && 
             !spell.provides_healing && 
             !spell.controls_creatures && 
             !spell.movement_enhancement;
    });
  }, [levelFilter, spellcastingStats.casterLevel, selectedBasicSpells, spellCountByLevel]);

  const handleBasicSpellSelect = (e) => {
    const selectedSpellName = e.target.value;
    if (!selectedSpellName) return;
    
    const selectedSpell = FULL_SPELL_LIST.find(spell => spell.name === selectedSpellName);
    
    if (selectedSpell && availableMagicPoints > 0) {
      // Check if we've reached the limit of 2 spells per level
      const spellLevel = selectedSpell.level;
      if ((spellCountByLevel[spellLevel] || 0) < 2) {
        setSelectedBasicSpells([...selectedBasicSpells, selectedSpell]);
      }
    }
  };

  const removeBasicSpell = (spellToRemove) => {
    setSelectedBasicSpells(selectedBasicSpells.filter(spell => spell !== spellToRemove));
  };

  // Group spells by level for display
  const spellsByLevel = useMemo(() => {
    const groupedSpells = {};
    selectedBasicSpells.forEach(spell => {
      if (!groupedSpells[spell.level]) {
        groupedSpells[spell.level] = [];
      }
      groupedSpells[spell.level].push(spell);
    });
    return groupedSpells;
  }, [selectedBasicSpells]);

  // Format spell description by level
  const formatSpellDescription = () => {
    if (!selectedBasicSpells.length) return '';
    
    const spellLevels = Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b));
    const descriptions = [];
    
    spellLevels.forEach(level => {
      const spells = spellsByLevel[level];
      const spellNames = spells.map(s => s.name).join(', ');
      
      if (Number(level) === 0) {
        descriptions.push(`At will: ${spellNames}`);
      } else {
        const slots = spellcastingStats.spellSlots[Number(level) - 1];
        if (slots > 0) {
          descriptions.push(`${slots}/day each (${level}${getOrdinalSuffix(level)} level): ${spellNames}`);
        }
      }
    });
    
    return descriptions.join('. ');
  };

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const handleSubmit = () => {
    if (!spellcastingAbility) return;

    const spellDescription = formatSpellDescription();
    
    // Create detailed spell information by level for state storage
    const detailedSpellInfo = {};
    Object.entries(spellsByLevel).forEach(([level, spells]) => {
      detailedSpellInfo[level] = {
        spells: spells.map(spell => ({
          name: spell.name,
          level: spell.level,
          description: spell.description || ''
        })),
        usageLimit: level === '0' 
          ? 'at will' 
          : `${spellcastingStats.spellSlots[parseInt(level)-1] || 0}/day each`
      };
    });
    
    // Create the main spellcasting feature
    const mainFeature = {
      name: 'Spellcasting',
      type: 'spellcasting', // Add a unique type to identify this feature
      id: 'spellcasting-feature', // Add a unique ID for this feature
      category: 'Abilities',
      description: `The creature is a ${spellcastingStats.casterLevel}th-level spellcaster. Its spellcasting ability is ${spellcastingAbility}. ${spellDescription}`,
      costFeaturePoint: true,
      featurePointCost: 2,
      magicPointsTotal: spellcastingStats.magicPoints,
      magicPointsUsed: 0, // The individual spell features track this instead
      spellcasting: {
        ability: spellcastingAbility,
        level: spellcastingStats.casterLevel,
        spellsByLevel: detailedSpellInfo, // Include the detailed spell info
        spellSlots: spellcastingStats.spellSlots, // Include the spell slots array
        totalSpells: selectedBasicSpells.length, // Total number of spells selected
        spellCountByLevel: spellCountByLevel // Count of spells per level
      }
    };
    
    // Debug log the main feature
    console.log('Submitting Spellcasting Feature:', mainFeature);
    
    // Submit main spellcasting feature first
    onSubmit(mainFeature);
    
    // Then submit one consolidated feature for all basic spells to track magic point usage
/*     if (selectedBasicSpells.length > 0) {
      const basicSpellsFeature = {
        name: 'Basic Spells',
        type: 'basic-spells', // Add a unique type to identify this feature
        id: 'basic-spells-feature', // Add a unique ID for this feature
        category: 'Abilities',
        costMagicPoint: true, // This flag is used in ActionsFeatures to identify magic point features
        magicPointCost: selectedBasicSpells.length, // Total cost for all basic spells
        isHidden: true, // Don't show this as a separate feature in the UI
        description: `The creature can cast these spells based on its spell slots: ${spellDescription}`,
        spellDetails: detailedSpellInfo, // Include the detailed spell information here too
        linkedToFeature: 'spellcasting-feature' // Reference to the main feature
      };
      
      // Debug log the basic spells feature
      console.log('Submitting Basic Spells Feature:', basicSpellsFeature);
      
      // Add slight delay to ensure the first feature is processed first
      setTimeout(() => {
        onSubmit(basicSpellsFeature);
      }, 10);
    } */
    
    // Add an additional debug log to check if the features are being properly added to monster state
    //console.log('After submission - selectedBasicSpells:', selectedBasicSpells);
    
    // You might add a timeout to check the monster state after submission
    //setTimeout(() => {
    //  console.log('Check monster state after submission (timeout)');
    //  console.log(monster);
    //}, 500);
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold">Spellcasting</h3>
      
      {/* Ability Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spellcasting Ability
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={spellcastingAbility}
            onChange={(e) => setSpellcastingAbility(e.target.value)}
          >
            <option value="">Select Ability...</option>
            <option value="Intelligence">Intelligence</option>
            <option value="Wisdom">Wisdom</option>
            <option value="Charisma">Charisma</option>
          </select>
        </div>
      </div>

      {/* Magic Points Info */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h4 className="font-medium text-blue-800">Magic Points</h4>
        <p className="text-sm text-blue-600">
          {currentMagicPoints && currentMagicPoints.total > 0 ? (
            <>
              Total: {currentMagicPoints.total} | 
              Already Used: {currentMagicPoints.used} | 
              New Usage: {selectedBasicSpells.length} | 
              Will Remain: {availableMagicPoints}
            </>
          ) : (
            <>
              Total: {spellcastingStats.magicPoints} | 
              Used: {selectedBasicSpells.length} | 
              Available: {availableMagicPoints}
            </>
          )}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Based on caster level {spellcastingStats.casterLevel}. Each basic spell costs 1 magic point.
        </p>
      </div>

      {/* Spell Slots Display */}
      <div className="bg-green-50 p-3 rounded border border-green-200">
        <h4 className="font-medium text-green-800">Spell Slots</h4>
        <div className="grid grid-cols-9 gap-2 text-sm">
          {spellcastingStats.spellSlots.map((slots, idx) => (
            <div key={idx} className="text-center">
              <div className="font-medium">{idx + 1}</div>
              <div className={slots > 0 ? "text-green-700" : "text-gray-400"}>{slots}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Number of spell slots per day for each spell level
        </p>
      </div>

      {/* Filters for Basic Spells */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spell Level Filter
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="0">Cantrips (Level 0)</option>
            {[...Array(Math.floor(spellcastingStats.casterLevel / 2))].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Level {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Basic Spell Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Basic Spells
        </label>
        <div>
          <select
            className="w-1/2 p-2 border rounded"
            onChange={handleBasicSpellSelect}
            value=""
            disabled={availableMagicPoints <= 0}
          >
            <option value="">Select a Basic Spell...</option>
            {availableBasicSpells.map((spell) => (
              <option key={spell.name} value={spell.name}>
                {spell.name} (Level {spell.level}) {(spellCountByLevel[spell.level] || 0) >= 1 ? `- ${(spellCountByLevel[spell.level] || 0)}/2` : ""}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Basic spells are utility spells with no combat effects. Maximum 2 spells per level. Each costs 1 magic point.
        </p>
      </div>

      {/* Selected Basic Spells List - Grouped by Level */}
      {Object.keys(spellsByLevel).length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">Selected Basic Spells:</label>
          
          {Object.entries(spellsByLevel)
            .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
            .map(([level, spells]) => (
              <div key={level} className="space-y-1">
                <div className="font-medium text-sm">
                  {level === "0" ? "Cantrips (At Will)" : 
                    `Level ${level} - ${spellcastingStats.spellSlots[level-1] || 0}/day each`}
                  <span className="ml-2 text-gray-500">{spells.length}/2</span>
                </div>
                {spells.map((spell, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{spell.name}</span>
                    <button
                      onClick={() => removeBasicSpell(spell)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      <div className="text-sm text-gray-600">
        This creature will be a {spellcastingStats.casterLevel}th-level spellcaster
        with {spellcastingStats.magicPoints} magic points.
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!spellcastingAbility || availablePoints < 2}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Spellcasting ({availablePoints >= 2 ? '-2 Feature Points' : 'Not Enough Points'})
      </button>
    </div>
  );
}