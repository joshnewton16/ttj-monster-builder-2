export const CASTINGTIME = ['action', 'bonus action', 'reaction'];

export const ACTIONTYPE = ['spell attack', 'saving throw'];

export const SAVINGTHROWS = ['STR', 'DEX', 'CON', 'WIS', 'INT', 'CHA']

export const PRIMARYEFFECTTYPE = ['Spell Attack', 'Defense', 'Healing', 'Adjust Movement', 'Control']

export const DURATION = [
    { value: 'instantaneous', label: 'instantaneous', spellAttack: true, defense: true, mpCost: 0},
    { value: 'next-turn', label: 'Until end of next turn', spellAttack: false, defense: true, mpCost: 0 },
    { value: '1-round', label: '1 round', spellAttack: true, defense: true, mpCost: 1},
    { value: '1-minute', label: '1 minute', spellAttack: true, defense: false, mpCost: 2},
    { value: '2-rounds', label: '2 rounds', spellAttack: false, defense: true, mpCost: 2 },
    { value: '3-rounds', label: '3 rounds', spellAttack: false, defense: true, mpCost: 3 },
    { value: '4-rounds', label: '4 rounds', spellAttack: false, defense: true, mpCost: 4 },
    { value: '5-rounds', label: '5 rounds', spellAttack: false, defense: true, mpCost: 5 },
    { value: '6-rounds', label: '6 rounds', spellAttack: false, defense: true, mpCost: 6 },
    { value: '7-rounds', label: '7 rounds', spellAttack: false, defense: true, mpCost: 7 },
    { value: '8-rounds', label: '8 rounds', spellAttack: false, defense: true, mpCost: 8 },
    { value: '9-rounds', label: '9 rounds', spellAttack: false, defense: true, mpCost: 9 },
    { value: '10-rounds', label: '10 rounds', spellAttack: false, defense: true, mpCost: 10 }
  ];

  export const DAMAGETYPES = [
    'acid',
    'bludgeoning',
    'cold',
    'fire',
    'force',
    'lightning',
    'necrotic',
    'piercing',
    'poison',
    'psychic',
    'radiant',
    'slashing',
    'thunder'
  ];

  export const CONDITIONS = [
    'blinded',
    'charmed',
    'defeaned',
    'exhausted',
    'frightened',
    'grappled',
    'incapacitated',
    'invisible',
    'paralyzed',
    'petrified',
    'poisoned',
    'prone',
    'restrained',
    'stunned',
    'unconscious'   
  ];

  export const OTHEREFFECTS = [
    'the targeted area becomes difficult terrain'
  ]

  export const AREAOFEFFECT = [
    'sphere',
    'cube',
    'cone',
    'cylinder',
    'line'
  ];

// Damage calculation functions
export const getPrimaryDamageForCR = (cr, proficiencyBonus) => {
  // CR 0-5: 1/2 Proficiency x d8
  if (cr <= 5) {
    const diceCount = Math.max(1, Math.floor(proficiencyBonus / 2));
    return { 
      dice: `${diceCount}d8`, 
      average: Math.floor(diceCount * 4.5) // Average value of d8 is 4.5
    };
  }
  // CR 6-10: 1/2 Proficiency x d10
  else if (cr <= 10) {
    const diceCount = Math.max(1, Math.floor(proficiencyBonus / 2));
    return { 
      dice: `${diceCount}d10`, 
      average: Math.floor(diceCount * 5.5) // Average value of d10 is 5.5
    };
  }
  // CR 11-13: Proficiency x d8
  else if (cr <= 13) {
    const diceCount = proficiencyBonus;
    return { 
      dice: `${diceCount}d8`, 
      average: Math.floor(diceCount * 4.5)
    };
  }
  // CR 14-17: Proficiency x d10
  else if (cr <= 17) {
    const diceCount = proficiencyBonus;
    return { 
      dice: `${diceCount}d10`, 
      average: Math.floor(diceCount * 5.5)
    };
  }
  // CR 18+: Proficiency x d12
  else {
    const diceCount = proficiencyBonus;
    return { 
      dice: `${diceCount}d12`, 
      average: Math.floor(diceCount * 6.5) // Average value of d12 is 6.5
    };
  }
};

export const getSecondaryDamageForCR = (cr) => {
  if (cr <= 1) return { dice: "1d6", average: 3 };
  if (cr <= 5) return { dice: "3d6", average: 9 };
  if (cr <= 8) return { dice: "4d8", average: 16 };
  if (cr <= 12) return { dice: "8d8", average: 32 };
  if (cr <= 15) return { dice: "6d12", average: 39 };
  return { dice: "8d12", average: 52 };
};

export const RANGE_MULTIPLIERS = [
  { value: 0, label: 'Touch', mpCost: 0},
  { value: 1, label: 'Normal Range', mpCost: 0 },
  { value: 3, label: '3× Range', mpCost: 1 },
  { value: 5, label: '5× Range', mpCost: 2 },
  { value: 10, label: '10× Range', mpCost: 4 }
];
