export interface CharacterSheetData {
  readonly name: string;
  readonly proficiencyBonus: number;
  readonly checkBonuses: Map<string, number>;
  readonly saveBonuses: Map<string, number>;
  readonly abilityBonuses: Map<string, number>;
  readonly attackBonuses: Map<string, number>;
}

export const SKILL_ORDER = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
];

export const ABILITY_ORDER = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];

export const ADVANTAGE = 'advantage';
export const DISADVANTAGE = 'disadvantage';
