// components/FeaturePointActions/ActionEconomySpellForm/utils/helpers.js

import { DAMAGETYPES, CONDITIONS } from '../../../../constants/spell-parameters';

// Get the appropriate category based on casting time
export const getCategoryFromCastingTime = (castingTime) => {
  switch(castingTime) {
    case 'bonus action':
      return 'Bonus Actions';
    case 'reaction':
      return 'Reactions';
    case 'action':
    default:
      return 'Actions';
  }
};

// Find base range from monster's movement speeds
export const getBaseRange = (monster) => {
  return Math.max(
    ...monster.speed.map(s => s.value || 0),
    30 // Default to 30 if no movement values
  );
};

// Get a recharge option by its ID
export const getRechargeById = (rechargeOptions, rechargeId) => {
  return rechargeOptions.find(option => option.value === rechargeId) || rechargeOptions[0];
};

// Check if a value exists in a specific array
export const isInArray = (array, value) => array.includes(value);

// Check if secondary effect is a condition
export const isSecondaryCondition = (effect) => CONDITIONS.includes(effect);

// Check if secondary effect is damage type
export const isSecondaryDamage = (effect) => DAMAGETYPES.includes(effect);

// Format text with capitalized first letter
export const capitalizeFirstLetter = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Get a formatted recharge text
export const getRechargeText = (rechargeOption) => {
  if (rechargeOption === 'none') return '';
  
  return rechargeOption === 'recharge4-6' 
    ? '(Recharge 4-6) ' 
    : rechargeOption === 'recharge5-6' 
      ? '(Recharge 5-6) ' 
      : '(Recharge 6) ';
};

// Get formatted casting time text
export const getCastingTimeText = (castingTime) => {
  return castingTime === 'action' 
    ? 'Action' 
    : castingTime === 'bonus action' 
      ? 'Bonus Action' 
      : 'Reaction';
};