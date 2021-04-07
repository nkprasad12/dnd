export interface AttackData {
  toHit: number;
  damageRoll: string;
  info?: string;
}

export interface CharacterSheetData {
  readonly sheetId: string;
  readonly name: string;
  readonly proficiencyBonus: number;
  readonly checkBonuses: Map<string, number>;
  readonly saveBonuses: Map<string, number>;
  readonly abilityBonuses: Map<string, number>;
  readonly attackBonuses: Map<string, AttackData>;
}

export interface Spell {
  name: string;
  desc: string;
  page: string;
  range: string;
  components: string;
  material?: string;
  ritual: string;
  duration: string;
  concentration: string;
  castingTime: string;
  level: string;
  school: string;
  class: string;
  higherLevel?: string;
  archetype?: string;
  domains?: string;
  patrons?: string;
  circles?: string;
  oaths?: string;
}
