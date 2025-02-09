// constants.js
export const SIZES = ['Small', 'Medium', 'Large', 'Huge'];

export const SRD_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 
  'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 
  'Primordial', 'Sylvan', 'Undercommon'
];

export const SRD_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 
  'Sleight of Hand', 'Stealth', 'Survival'
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
  { name: 'Sunlight Sensitivity', description: 'Disadvantage on attack rolls and Wisdom (Perception) checks in sunlight.' },
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