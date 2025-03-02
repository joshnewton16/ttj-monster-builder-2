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
    return {
      magicPoints: Math.floor(baseStat) * 2, // Magic points based on caster level
      casterLevel: Math.max(2, Math.floor(baseStat))
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
  }, [levelFilter, spellcastingStats.casterLevel, selectedBasicSpells]);

  const handleBasicSpellSelect = (e) => {
    const selectedSpellName = e.target.value;
    if (!selectedSpellName) return;
    
    const selectedSpell = FULL_SPELL_LIST.find(spell => spell.name === selectedSpellName);
    
    if (selectedSpell && availableMagicPoints > 0) {
      setSelectedBasicSpells([...selectedBasicSpells, selectedSpell]);
    }
  };

  const removeBasicSpell = (spellToRemove) => {
    setSelectedBasicSpells(selectedBasicSpells.filter(spell => spell !== spellToRemove));
  };

  const handleSubmit = () => {
    if (!spellcastingAbility) return;

    // Format the at-will spells list for display
    const atWillSpellNames = selectedBasicSpells.map(spell => spell.name);
    
    // Create the main spellcasting feature that includes all basic spells directly
    const mainFeature = {
      name: 'Spellcasting',
      category: 'Abilities',
      description: `The creature is a ${spellcastingStats.casterLevel}th-level spellcaster. Its spellcasting ability is ${spellcastingAbility}. ${
        atWillSpellNames.length > 0 ? `At will: ${atWillSpellNames.join(', ')}` : ''
      }`,
      costFeaturePoint: true,
      featurePointCost: 2,
      magicPointsTotal: spellcastingStats.magicPoints,
      magicPointsUsed: 0, // The individual spell features track this instead
      spellcasting: {
        ability: spellcastingAbility,
        level: spellcastingStats.casterLevel,
        atWillSpells: atWillSpellNames
      }
    };
    
    // Submit main spellcasting feature first
    onSubmit(mainFeature);
    
    // Then submit one consolidated feature for all basic spells to track magic point usage
    if (selectedBasicSpells.length > 0) {
      const basicSpellsFeature = {
        name: 'Basic Spells',
        description: `The creature can cast these basic spells at will: ${atWillSpellNames.join(', ')}.`,
        category: 'Abilities',
        costMagicPoint: true, // This flag is used in ActionsFeatures to identify magic point features
        magicPointCost: selectedBasicSpells.length, // Total cost for all basic spells
        isHidden: true // Don't show this as a separate feature in the UI
      };
      
      onSubmit(basicSpellsFeature);
    }
  };

  return (
    <div className="space-y-4 mt-4">
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

      {/* Filters for Basic Spells */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Spell Level Filter
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

      {/* Basic Spell Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Basic Spells (At Will)
        </label>
        <select
          className="w-full p-2 border rounded"
          onChange={handleBasicSpellSelect}
          value=""
          disabled={availableMagicPoints <= 0}
        >
          <option value="">Select a Basic Spell...</option>
          {availableBasicSpells.map((spell) => (
            <option key={spell.name} value={spell.name}>
              {spell.name} (Level {spell.level})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Basic spells are utility spells with no combat effects. Each costs 1 magic point.
        </p>
      </div>

      {/* Selected Basic Spells List */}
      {selectedBasicSpells.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Selected Basic Spells (At Will):</label>
          {selectedBasicSpells.map((spell, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span>{spell.name} (Level {spell.level})</span>
              <button
                onClick={() => removeBasicSpell(spell)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
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