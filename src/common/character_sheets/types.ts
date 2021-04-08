export type StringIndexed<T> = {[key: string]: T};

export interface AttackData {
  readonly toHit: number;
  readonly damageRoll: string;
  readonly info?: string;
}

export interface CharacterSheetData {
  readonly sheetId: string;
  readonly name: string;
  readonly proficiencyBonus: number;
  readonly checkBonuses: StringIndexed<number>;
  readonly saveBonuses: StringIndexed<number>;
  readonly abilityBonuses: StringIndexed<number>;
  readonly attackBonuses: StringIndexed<AttackData>;
}

export interface Spell {
  readonly name: string;
  readonly desc: string;
  readonly page: string;
  readonly range: string;
  readonly components: string;
  readonly material?: string;
  readonly ritual: string;
  readonly duration: string;
  readonly concentration: string;
  readonly castingTime: string;
  readonly level: string;
  readonly school: string;
  readonly class: string;
  readonly higherLevel?: string;
  readonly archetype?: string;
  readonly domains?: string;
  readonly patrons?: string;
  readonly circles?: string;
  readonly oaths?: string;
}
