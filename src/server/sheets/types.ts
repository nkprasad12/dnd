export interface CharacterSheetData {
  readonly name: string;
  readonly proficiencyBonus: number;
  readonly checkBonuses: Map<string, number>;
  readonly saveBonuses: Map<string, number>;
  readonly abilityBonuses: Map<string, number>;
  readonly attackBonuses: Map<string, number>;
}
