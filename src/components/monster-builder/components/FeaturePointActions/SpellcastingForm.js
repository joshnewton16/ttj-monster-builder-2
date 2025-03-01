// components/FeaturePointActions/SpellcastingForm.js
import React, { useState, useMemo } from 'react';
import { FULL_SPELL_LIST } from '../../constants/spell-list';
import { SPELLCASTERLEVELS } from '../../constants/srd-data';

export function SpellcastingForm({ onSubmit, availablePoints, monster }) {
  const [spellcastingAbility, setSpellcastingAbility] = useState('');
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [levelFilter, setLevelFilter] = useState('all');
  const [flagFilter, setFlagFilter] = useState('all');

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
    console.log(baseStat);
    return {
      maxSpells: Math.floor(baseStat),
      casterLevel: Math.max(2, Math.floor(baseStat))
    };
  }, [monster.cr]);

  // Filter spells based on selected filters and caster level
  const filteredSpells = useMemo(() => {
    const maxSpellLevel = Math.floor(spellcastingStats.casterLevel / 2);
    
    return FULL_SPELL_LIST.filter(spell => {
      // Check spell level against caster level first
      if (spell.level > maxSpellLevel) {
        return false;
      }

      // Level filter
      if (levelFilter !== 'all' && spell.level !== parseInt(levelFilter)) {
        return false;
      }

      // Flag filters
      switch (flagFilter) {
        case 'no_flags':
          return !spell.causes_damage && 
                 !spell.prevents_damage && 
                 !spell.provides_healing && 
                 !spell.controls_creatures && 
                 !spell.movement_enhancement;
        case 'damage':
          return spell.causes_damage;
        case 'prevention':
          return spell.prevents_damage;
        case 'healing':
          return spell.provides_healing;
        case 'control':
          return spell.controls_creatures;
        case 'movement':
          return spell.movement_enhancement;
        default:
          return true;
      }
    });
  }, [levelFilter, flagFilter, spellcastingStats.casterLevel]);

  const handleSpellSelect = (e) => {
    const selectedSpellName = e.target.value;
    const selectedSpell = FULL_SPELL_LIST.find(spell => spell.name === selectedSpellName);
    
    if (selectedSpell && selectedSpells.length < spellcastingStats.maxSpells) {
      setSelectedSpells([...selectedSpells, selectedSpell]);
    }
  };

  const removeSpell = (spellToRemove) => {
    setSelectedSpells(selectedSpells.filter(spell => spell !== spellToRemove));
  };

// In the handleSubmit function, modify the ability score access and description building
  const handleSubmit = () => {
    if (!spellcastingAbility || selectedSpells.length === 0) return;

    // Filter for at-will spells
    const atWillSpells = selectedSpells.filter(spell => 
      !spell.causes_damage && 
      !spell.prevents_damage && 
      !spell.provides_healing && 
      !spell.controls_creatures && 
      !spell.movement_enhancement
    );

    const newFeature = {
      name: 'Spellcasting',
      category: 'Abilities',
      // Don't include calculated values in the description
      description: 'spellcasting',  // This will be a marker for the preview panel
      costFeaturePoint: true,
      featurePointCost: 2,
      spellcasting: {
        ability: spellcastingAbility,
        level: spellcastingStats.casterLevel,
        spells: selectedSpells,
        atWillSpells: atWillSpells.map(spell => spell.name)  // Store just the names
      }
    };

    onSubmit(newFeature);
    setSpellcastingAbility('');
    setSelectedSpells([]);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Spellcasting</h3>
      
      {/* Ability Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spellcasting Ability
        </label>
        <select
          className="w-full p-2 border rounded"
          value={spellcastingAbility}
          onChange={(e) => setSpellcastingAbility(e.target.value)}
        >
          <option value="">Select Ability...</option>
          <option value="Intelligence">Intelligence</option>
          <option value="Wisdom">Wisdom</option>
          <option value="Charisma">Charisma</option>
        </select>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Spell Level
          </label>
          <select
            className="w-full p-2 border rounded"
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

        <div>
          <label className="block text-sm font-medium mb-1">
            Spell Type
          </label>
          <select
            className="w-full p-2 border rounded"
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="no_flags">Basic Spells</option>
            <option value="damage">Damage Dealing</option>
            <option value="prevention">Damage Prevention</option>
            <option value="healing">Healing</option>
            <option value="control">Creature Control</option>
            <option value="movement">Movement Enhancement</option>
          </select>
        </div>
      </div>

      {/* Spell Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Spells ({selectedSpells.length}/{spellcastingStats.maxSpells})
        </label>
        <select
          className="w-full p-2 border rounded"
          onChange={handleSpellSelect}
          value=""
          disabled={selectedSpells.length >= spellcastingStats.maxSpells}
        >
          <option value="">Select a Spell...</option>
          {filteredSpells.map((spell) => (
            <option key={spell.name} value={spell.name}>
              {spell.name} (Level {spell.level})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Spells List */}
      {selectedSpells.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Selected Spells:</label>
          {selectedSpells.map((spell, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span>{spell.name} (Level {spell.level})</span>
              <button
                onClick={() => removeSpell(spell)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-600">
        This creature will be a {spellcastingStats.casterLevel}th-level spellcaster,
        can know up to {spellcastingStats.maxSpells} spells, and can learn spells of 
        level {Math.floor(spellcastingStats.casterLevel / 2)} or lower.
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!spellcastingAbility || selectedSpells.length === 0 || availablePoints < 2}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Add Spellcasting
      </button>
    </div>
  );
}