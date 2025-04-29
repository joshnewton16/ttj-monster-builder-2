// components/FeaturePointActions/ActionEconomySpellForm/utils/descriptionGenerators.js

import { 
  isSecondaryCondition, 
  isSecondaryDamage,
  isSecondaryOther,
  getRechargeText,
  getCastingTimeText
} from './helpers';

import {
  getPrimaryDamageForCR,
  getSecondaryDamageForCR
} from '../../../../constants/spell-parameters';

// Define DEFENSE_DURATIONS constant
const DEFENSE_DURATIONS = [
  { value: 'next-turn', label: 'Until End of Next Turn' },
  { value: '1-round', label: '1 Round' },
  { value: '2-rounds', label: '2 Rounds' },
  // Add more duration options as needed
];

// Generate a complete spell description based on all parameters
export const generateSpellDescription = ({
  spellName,
  rechargeOption,
  castingTime,
  primaryEffectType,
  actionType,
  savingThrow,
  areaOfEffect,
  areaSize,
  primaryDamageType,
  secondaryEffect,
  duration,
  actualRange,
  defenseType,
  acBonus,
  immunityCondition,
  healingDice,
  movementAction,
  movementType,
  controlSavingThrow,
  controlCondition,
  description,
  monster,
  defenseDuration // Added to match the options usage
}) => {
  // Get damage values based on CR and proficiency
  const primaryDamage = getPrimaryDamageForCR(monster.cr, monster.proficiencyBonus);
  const secondaryDamage = getSecondaryDamageForCR(monster.cr);

  // Start with name and optional recharge
  let desc = ``; //Spell. 
  
  // Effect based on primary effect type
  switch (primaryEffectType) {
    case 'Spell Attack':
      if (actionType === 'spell attack') {
        if (actualRange === 0) {
          desc += `The creature makes a spell attack against a target it can reach. On a hit, `;
        } else {
          desc += `The creature makes a spell attack against a target within ${actualRange} feet. On a hit, `;
        }
      } else {
        desc += `The target must make a ${savingThrow} saving throw. `;
        
        if (areaOfEffect) {
          desc += `Each creature in a ${areaOfEffect} with a ${areaSize}-foot radius within ${actualRange} feet must make the save. `;
        }
        
        desc += `On a failed save, `;
      }

      if (!areaOfEffect) {
        desc += `the target takes ${primaryDamage.dice} ${primaryDamageType} damage`;
      } else {
        desc += `a creature takes ${primaryDamage.dice} ${primaryDamageType} damage`;
      }
      
      if (actionType === 'saving throw') {
        desc += ` or half as much on a successful save`;
      }
      
      if (isSecondaryCondition(secondaryEffect)) {
        desc += ` and is ${secondaryEffect}`;
        
        if (duration !== 'instantaneous') {
          desc += ` for the duration`;
        }
      } else if (isSecondaryDamage(secondaryEffect)) {
        desc += ` plus ${secondaryDamage.dice} ${secondaryEffect} damage`;
      } else if (isSecondaryOther(secondaryEffect)) {
        desc += ` and ${secondaryEffect}`;
      }
      break;
      
    case 'Defense':
      if (defenseType === 'ac') {
        desc += `The creature gains a +${acBonus} bonus to its AC`;
      } else {
        desc += `The creature becomes immune to the ${immunityCondition} condition`;
      }
      
      // Custom duration text for Defense spells
      const selectedDefenseDuration = DEFENSE_DURATIONS.find(d => d.value === defenseDuration);
      if (selectedDefenseDuration) {
        if (defenseDuration === 'next-turn') {
          desc += ` until the end of its next turn`;
        } else if (defenseDuration.includes('round')) {
          const rounds = parseInt(defenseDuration);
          desc += ` for ${rounds} ${rounds === 1 ? 'round' : 'rounds'}`;
        }
      } else {
        // Fallback to standard duration if defense duration not specified
        if (duration !== 'instantaneous') {
          desc += ` for the duration`;
        }
      }
      break;
      
    case 'Healing':
      desc += `The creature regains ${healingDice}d8 hit points`;
      break;
      
    case 'Adjust Movement':
      if (movementAction === 'double') {
        desc += `The creature's ${movementType} speed is doubled`;
      } else {
        desc += `The creature gains a ${movementType} speed of 30 feet`;
      }
      
      if (duration !== 'instantaneous') {
        desc += ` for the duration`;
      }
      break;
      
    case 'Control':
      desc += `One creature within ${actualRange} feet must succeed on a ${controlSavingThrow} saving throw or be ${controlCondition}`;
      
      if (duration !== 'instantaneous') {
        desc += ` for the duration`;
      }
      break;
      
    default:
      break;
  }
  
  desc += `.`;
  
  // Add duration if not instantaneous and not already added
  if (duration !== 'instantaneous' && !desc.includes('for the duration')) {
    desc += ` Duration: ${duration}.`;
  }
  
  // Add any additional description
  if (description) {
    desc += ` ${description}`;
  }
  
  return desc;
};