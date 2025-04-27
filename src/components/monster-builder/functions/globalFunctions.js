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
    //console.log('ac & hp:', ac, hp);
    // Filter for both criteria
    const crMatches = CR_TABLE.filter(entry => (ac === entry.minAC && hp >= entry.minHP && hp <= entry.maxHP) );
    //console.log('ac matches', CR_TABLE.filter(acmatch => (ac === acmatch.minAC)));
    //console.log('crMatches: ', crMatches);
    if (!crMatches.length) {
      const acMatches = CR_TABLE.filter(entry => ac === entry.minAC);
      const acCR = Math.max(...acMatches.map(entry => entry.cr));
      const hpMatches = CR_TABLE.filter(entry => 
        hp >= entry.minHP && hp <= entry.maxHP
      );
      const hpCR = hpMatches.length > 0 ? hpMatches[0].cr : 0;
      //console.log('acCR & hpCR:', acCR, hpCR);
      return Math.round((acCR + hpCR) / 2);
    } else
    {
      return crMatches.cr;
    }
  }
