// StatBlockUtils.js - Utility functions for stat block generation

import { getSkillAbility } from '../constants/srd-data';
import { getModifier } from '../functions/globalFunctions';
import { getActionString } from './PreviewPanel/utils';

/**
 * Get a unique identifier for a feature
 */
export const getFeatureId = (feature) => {
  return feature.imageDisplayName || feature.name || 'unnamed';
};

/**
 * Format speeds for display
 */
export const formatSpeeds = (monster) => {
  return monster.speed
    .filter(s => s.value > 0)
    .map(s => `${s.value} ft.${s.type.toLowerCase() !== 'walk' ? ` (${s.type.toLowerCase()})` : ''}`)
    .join(', ');
};

/**
 * Calculate the bonus for a skill
 */
export const getSkillBonus = (skill, monster) => {
  let skillName = '';
  let ability = '';
  
  // Handle both string and object formats for skills
  if (typeof skill === 'string') {
    skillName = skill;
    ability = getSkillAbility(skillName);
  } else if (typeof skill === 'object') {
    skillName = skill.name || '';
    ability = skill.ability ? skill.ability.toLowerCase() : getSkillAbility(skillName);
  }
  
  // Calculate the base ability modifier
  const abilityMod = parseInt(getModifier(monster.attributes[ability]));
  let intExpertise = 0;
  
  // Add Expertise
  if (monster.expertise && monster.expertise.length > 0) { 
    monster.expertise.map(expertise => {
      if (expertise === skill) {
        intExpertise = monster.proficiencyBonus;
      }
    })
  }

  // Add proficiency bonus
  return abilityMod + intExpertise + monster.proficiencyBonus;
};

/**
 * Distribution function for automatic balancing
 */
export const distributeFeaturesByLength = (features, monster) => {
  if (!features || features.length === 0) return [[], []];
  if (features.length === 1) return [features, []];
  
  // For exactly 2 features, always put one in each column
  if (features.length === 2) {
    const multiattack = features.find(f => f.isMultiattack === true);
    const other = features.find(f => f.isMultiattack !== true);
    
    if (multiattack) {
      return [[multiattack], [other]];
    } else {
      return [[features[0]], [features[1]]];
    }
  }

  // Calculate text length for each feature
  const featuresWithLength = features.map(feature => {
    const name = feature.imageDisplayName || feature.name || '';
    const description = getActionString(feature, monster) || '';
    const totalLength = name.length + description.length;
    
    return {
      ...feature,
      textLength: totalLength
    };
  });

  // Separate Multiattack from other features
  const multiattack = featuresWithLength.find(f => f.isMultiattack === true);
  const otherFeatures = featuresWithLength.filter(f => f.isMultiattack !== true);

  // Start with even distribution of non-Multiattack features
  const half = Math.ceil(otherFeatures.length / 2);
  let leftColumn = otherFeatures.slice(0, half);
  let rightColumn = otherFeatures.slice(half);

  // Always put Multiattack at the top of left column if it exists
  if (multiattack) {
    leftColumn.unshift(multiattack);
  }

  // Calculate initial weights
  let leftLength = leftColumn.reduce((sum, f) => sum + f.textLength, 0);
  let rightLength = rightColumn.reduce((sum, f) => sum + f.textLength, 0);

  // Balance by moving items between columns
  const movableFromRight = rightColumn.filter(f => f.isMultiattack !== true);
  const movableFromLeft = leftColumn.filter(f => f.isMultiattack !== true);

  movableFromRight.sort((a, b) => a.textLength - b.textLength);
  movableFromLeft.sort((a, b) => b.textLength - a.textLength);

  const isLeftMuchHeavier = leftLength > rightLength * 1.5;

  if (isLeftMuchHeavier) {
    for (let feature of movableFromLeft.slice()) {
      const newLeftLength = leftLength - feature.textLength;
      const newRightLength = rightLength + feature.textLength;
      const currentImbalance = Math.abs(leftLength - rightLength);
      const newImbalance = Math.abs(newLeftLength - newRightLength);
      
      if (newImbalance < currentImbalance) {
        leftColumn = leftColumn.filter(f => f !== feature);
        rightColumn.push(feature);
        leftLength = newLeftLength;
        rightLength = newRightLength;
      }
    }
  }
  
  // Try moving short items from right to left to balance
  for (let feature of movableFromRight.slice()) {
    const newLeftLength = leftLength + feature.textLength;
    const newRightLength = rightLength - feature.textLength;
    const currentImbalance = Math.abs(leftLength - rightLength);
    const newImbalance = Math.abs(newLeftLength - newRightLength);
    
    if (newImbalance < currentImbalance) {
      rightColumn = rightColumn.filter(f => f !== feature);
      if (multiattack) {
        leftColumn.splice(1, 0, feature);
      } else {
        leftColumn.unshift(feature);
      }
      leftLength = newLeftLength;
      rightLength = newRightLength;
    }
  }

  return [leftColumn, rightColumn];
};

/**
 * Distribute features with manual overrides
 */
export const distributeFeatures = (features, categoryKey, monster, manualAssignments) => {
  if (!features || features.length === 0) return [[], []];
  
  const assignments = manualAssignments[categoryKey];
  
  // If we have manual assignments, use them
  if (assignments.left.length > 0 || assignments.right.length > 0) {
    // Create ordered arrays based on manual assignments
    const leftFeatures = assignments.left
      .map(id => features.find(f => getFeatureId(f) === id))
      .filter(f => f); // Remove any null/undefined
    
    const rightFeatures = assignments.right
      .map(id => features.find(f => getFeatureId(f) === id))
      .filter(f => f); // Remove any null/undefined
    
    const unassignedFeatures = features.filter(f => 
      !assignments.left.includes(getFeatureId(f)) && 
      !assignments.right.includes(getFeatureId(f))
    );
    
    // Add unassigned features to the shorter column
    unassignedFeatures.forEach(feature => {
      if (leftFeatures.length <= rightFeatures.length) {
        leftFeatures.push(feature);
      } else {
        rightFeatures.push(feature);
      }
    });
    
    return [leftFeatures, rightFeatures];
  }
  
  // Fall back to automatic distribution
  return distributeFeaturesByLength(features, monster);
};