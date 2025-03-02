// constants.js
export const SIZES = ['Small', 'Medium', 'Large', 'Huge'];

export const SRD_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 
  'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 
  'Primordial', 'Sylvan', 'Undercommon'
];

export const SRD_SKILLS = [
  { name: 'Acrobatics', ability: 'dex' },
  { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana', ability: 'int' },
  { name: 'Athletics', ability: 'str' },
  { name: 'Deception', ability: 'cha' },
  { name: 'History', ability: 'int' },
  { name: 'Insight', ability: 'wis' },
  { name: 'Intimidation', ability: 'cha' },
  { name: 'Investigation', ability: 'int' },
  { name: 'Medicine', ability: 'wis' },
  { name: 'Nature', ability: 'int' },
  { name: 'Perception', ability: 'wis' },
  { name: 'Performance', ability: 'cha' },
  { name: 'Persuasion', ability: 'cha' },
  { name: 'Religion', ability: 'int' },
  { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth', ability: 'dex' },
  { name: 'Survival', ability: 'wis' }
];

export const SRD_ACTIONS = [
  { name: 'Bite', type: 'Natural Weapon', damage: '1d6 piercing', useStr: true },
  { name: 'Claw', type: 'Natural Weapon', damage: '1d4 slashing', useStr: true },
  { name: 'Gore', type: 'Natural Weapon', damage: '1d8 piercing', useStr: true },
  { name: 'Greataxe', type: 'Melee Weapon Attack', damage: '1d12 slashing', useStr: true },
  { name: 'Greatsword', type: 'Melee Weapon Attack', damage: '2d6 slashing', useStr: true },
  { name: 'Heavy Crossbow', type: 'Ranged Weapon Attack', damage: '1d10 piercing', useDex: true },
  { name: 'Light Crossbow', type: 'Ranged Weapon Attack', damage: '1d8 piercing', useDex: true },
  { name: 'Longbow', type: 'Ranged Weapon Attack', damage: '1d8 piercing', useDex: true },
  { name: 'Longsword', type: 'Melee Weapon Attack', damage: '1d8 slashing', useStr: true },
  { name: 'Shortsword', type: 'Melee Weapon Attack', damage: '1d6 piercing', useDex: true },
  { name: 'Shortbow', type: 'Ranged Weapon Attack', damage: '1d6 piercing', useDex: true },
  { name: 'Slam', type: 'Natural Weapon', damage: '1d6 bludgeoning', useStr: true },
  { name: 'Sting', type: 'Natural Weapon', damage: '1d4 piercing', useDex: true },
  { name: 'Tail', type: 'Natural Weapon', damage: '1d6 bludgeoning', useStr: true },
  { name: 'Tentacle', type: 'Natural Weapon', damage: '1d6 bludgeoning', useStr: true }
].sort((a, b) => a.name.localeCompare(b.name));

export const SRD_FEATURES = [
  { name: 'Amphibious', description: 'Can breathe air and water.' },
  { name: 'Blindsight', description: 'Can perceive its surroundings without relying on sight, within a specific radius.' },
  { name: 'Darkvision', description: 'Can see in darkness up to 60 feet.' },
  { name: 'Damage Transfer', description: 'When damaged, can transfer half the damage to a willing creature within range.' },
  { name: 'False Appearance', description: 'While motionless, is indistinguishable from a natural object.' },
  { name: 'Keen Senses', description: 'Has advantage on Wisdom (Perception) checks.' },
  { name: 'Light Sensitivity', description: 'Disadvantage on attack rolls and Wisdom (Perception) checks in bright light.' },
  { name: 'Magic Resistance', description: 'Advantage on saving throws against spells and magical effects.' },
  { name: 'Pack Tactics', description: 'Advantage on attack rolls against creatures if at least one ally is within 5 feet.' },
  { name: 'Regeneration', description: 'Regains hit points at the start of its turn.' },
  { name: 'Spider Climb', description: 'Can climb difficult surfaces, including upside down, without making an ability check.' },
  { name: 'Spellcasting', description: 'The creature is a spellcaster.' },
  { name: 'Standing Leap', description: 'Its long jump is up to 30 feet and its high jump is up to 15 feet, with or without a running start.' },
  { name: 'Telekinetic', description: 'YOu can cast mage hand freely as a cantrip without verbal or material components.' },
  { name: 'Undead Fortitude', description: 'If damage reduces it to 0 hit points, must make a Constitution saving throw to drop to 1 hit point instead.' }
].sort((a, b) => a.name.localeCompare(b.name));

export const FEATURE_POINT_OPTIONS = [
  {
    id: 'action',
    name: 'Additional Action/Reaction/Bonus Action',
    cost: 1,
    type: 'action',
    description: 'Add one ability, action, reaction, or bonus action'
  },
  {
    id: 'damage',
    name: 'Secondary Damage Type or Double Damage',
    cost: 1,
    type: 'damage',
    description: 'Add a secondary damage type or ability to an existing attack; or double the damage of an existing attack'
  },
  {
    id: 'movement',
    name: 'Additional Movement',
    cost: 1,
    type: 'movement',
    description: 'Add Burrow, Swim, Climb, or Fly Speed equal to movement; or add ten feet of additional speed',
    options: ['Burrow', 'Swim', 'Climb', 'Fly', '+10 ft to existing']
  }
].sort((a, b) => {
  // Sort by cost first
  if (a.cost !== b.cost) {
    return a.cost - b.cost;
  }
  // Then alphabetically by name
  return a.name.localeCompare(b.name);
});

export const SRD_ARMOR = [
  { name: 'Natural Armor', ac: 10 },
  { name: 'Leather', ac: 11 },
  { name: 'Studded Leather', ac: 12 },
  { name: 'Hide', ac: 12 },
  { name: 'Chain Shirt', ac: 13 },
  { name: 'Scale Mail', ac: 14 },
  { name: 'Breastplate', ac: 14 },
  { name: 'Half Plate', ac: 15 },
  { name: 'Ring Mail', ac: 14 },
  { name: 'Chain Mail', ac: 16 },
  { name: 'Splint', ac: 17 },
  { name: 'Plate', ac: 18 }
].sort((a, b) => a.name.localeCompare(b.name));

export const MOVEMENT_TYPES = ['Walk', 'Fly', 'Swim', 'Burrow', 'Climb'];

export const SIZE_MOVEMENT = {
  Small: 20,
  Medium: 30,
  Large: 40,
  Huge: 50
};

export const CR_TABLE = [
  { minAC: 13, minHP: 71, maxHP: 85, cr: 1 },
  { minAC: 13, minHP: 86, maxHP: 100, cr: 2 },
  { minAC: 13, minHP: 101, maxHP: 115, cr: 3 },
  { minAC: 14, minHP: 116, maxHP: 130, cr: 4 },
  { minAC: 15, minHP: 131, maxHP: 145, cr: 5 },
  { minAC: 15, minHP: 146, maxHP: 160, cr: 6 },
  { minAC: 15, minHP: 161, maxHP: 175, cr: 7 },
  { minAC: 16, minHP: 176, maxHP: 190, cr: 8 },
  { minAC: 16, minHP: 191, maxHP: 205, cr: 9 },
  { minAC: 17, minHP: 206, maxHP: 220, cr: 10 },
  { minAC: 17, minHP: 221, maxHP: 235, cr: 11 },
  { minAC: 17, minHP: 236, maxHP: 250, cr: 12 },
  { minAC: 18, minHP: 251, maxHP: 265, cr: 13 },
  { minAC: 18, minHP: 266, maxHP: 280, cr: 14 },
  { minAC: 18, minHP: 281, maxHP: 295, cr: 15 },
  { minAC: 18, minHP: 296, maxHP: 310, cr: 16 },
  { minAC: 19, minHP: 311, maxHP: 325, cr: 17 },
  { minAC: 19, minHP: 326, maxHP: 340, cr: 18 },
  { minAC: 19, minHP: 341, maxHP: 355, cr: 19 },
  { minAC: 19, minHP: 356, maxHP: 400, cr: 20 },
  { minAC: 19, minHP: 401, maxHP: 445, cr: 21 },
  { minAC: 19, minHP: 446, maxHP: 490, cr: 22 },
  { minAC: 19, minHP: 491, maxHP: 535, cr: 23 },
  { minAC: 19, minHP: 536, maxHP: 580, cr: 24 },
  { minAC: 19, minHP: 581, maxHP: 625, cr: 25 },
  { minAC: 19, minHP: 626, maxHP: 670, cr: 26 },
  { minAC: 19, minHP: 671, maxHP: 715, cr: 27 },
  { minAC: 19, minHP: 716, maxHP: 760, cr: 28 },
  { minAC: 19, minHP: 760, maxHP: 805, cr: 29 },
  { minAC: 19, minHP: 805, maxHP: 850, cr: 30 }
];

// constants/effect-types.js
export const DAMAGE_TYPES = [
  'acid',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'poison',
  'psychic',
  'radiant',
  'thunder',
  'nonmagical bludgeoing/slashing/piercing'
];

export const CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'frightened',
  'grappled',
  'incapacitated',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious'
];

  export const LEGENDARYACTIONS = []

  export const SPELLCASTERLEVELS = [
    {"cr": 1, "level": 3},
    {"cr": 2, "level": 4},
    {"cr": 3, "level": 5},
    {"cr": 4, "level": 5},
    {"cr": 5, "level": 6},
    {"cr": 6, "level": 7},
    {"cr": 7, "level": 7},
    {"cr": 8, "level": 8},
    {"cr": 9, "level": 9},
    {"cr": 10, "level": 9},
    {"cr": 11, "level": 10},
    {"cr": 12, "level": 11},
    {"cr": 13, "level": 11},
    {"cr": 14, "level": 12},
    {"cr": 15, "level": 13},
    {"cr": 16, "level": 13},
    {"cr": 17, "level": 14},
    {"cr": 18, "level": 15},
    {"cr": 19, "level": 15},
    {"cr": 20, "level": 16},
    {"cr": 21, "level": 17},
    {"cr": 22, "level": 17},
    {"cr": 23, "level": 18},
    {"cr": 24, "level": 19},
    {"cr": 25, "level": 19},
    {"cr": 26, "level": 20}
  ]

  // Helper function to find ability score for a skill
export const getSkillAbility = (skillName) => {
  if (!skillName) return 'wis'; // Default to wisdom if no skill name provided
  
  const normalized = skillName.toLowerCase().trim();
  const skill = SRD_SKILLS.find(s => 
    s.name.toLowerCase() === normalized || 
    s.name.toLowerCase().replace(/\s+/g, '') === normalized.replace(/\s+/g, '')
  );
  
  return skill ? skill.ability : 'wis'; // Default to wisdom if skill not found
};

// Get array of just skill names (for backward compatibility)
export const SRD_SKILL_NAMES = SRD_SKILLS.map(skill => skill.name);