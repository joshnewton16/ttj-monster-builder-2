import { SIZES, CR_TABLE, SIZE_MOVEMENT, CREATURETYPES } from '../constants/srd-data';

export const getModifier = (score) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

export function calculateAverageHP(notation) {
    if (!notation) return 0;
    
    const match = notation.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (!match) return 0;
    
    const [, numDice, diceSize, bonus] = match;
    const average = (parseInt(numDice) * (parseInt(diceSize) + 1) / 2) + (parseInt(bonus) || 0);
    return Math.floor(average);
  }

export  function calculateCR(ac, hp) {
    // Find all possible CRs based on AC
    const acMatches = CR_TABLE.filter(entry => ac >= entry.minAC);
    
    // Find all possible CRs based on HP
    const hpMatches = CR_TABLE.filter(entry => 
      hp >= entry.minHP && hp <= entry.maxHP
    );
    
    if (!acMatches.length) {
      return 0; // Default to 0 if no AC matches
    }
    
    // Get the highest CR from AC matches
    const acCR = Math.max(...acMatches.map(entry => entry.cr));
    
    // Get the CR from HP range (default to 0 if no matches)
    const hpCR = hpMatches.length > 0 ? hpMatches[0].cr : 0;
    
    // Always average the two values, even if hpCR is 0
    if (acCR !== hpCR) {
      return Math.round((acCR + hpCR) / 2);
    }
    
    // If results are the same, return either one
    return acCR;
  }
