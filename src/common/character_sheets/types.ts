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

export namespace CharacterSheetData {
  export function isValid(input: any): input is CharacterSheetData {
    const data = input as CharacterSheetData;
    const hasAllFields =
      data.sheetId !== undefined &&
      data.name !== undefined &&
      data.proficiencyBonus !== undefined &&
      data.checkBonuses !== undefined &&
      data.saveBonuses !== undefined &&
      data.abilityBonuses !== undefined &&
      data.attackBonuses !== undefined;
    // TODO: We should probably validate some fields...
    return hasAllFields;
  }
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
