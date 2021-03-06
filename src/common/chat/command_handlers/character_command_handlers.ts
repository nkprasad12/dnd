import {Autocompleter} from '_common/chat/autocompleter';
import {ChatMessage} from '_common/chat/chat_model';
import {CommandHandler} from '_common/chat/chat_resolver';
import {CharacterResolver} from '_common/chat/command_handlers/character_resolver';
import {rollForString} from '_common/chat/command_handlers/roll_command_handler';
import {
  CharacterSheetData,
  StringIndexed,
} from '_common/character_sheets/types';
import {rollDice} from '_common/chat/dice_roller';
import {checkDefined} from '_common/preconditions';
import {ABILITY_ORDER, SKILL_ORDER} from '_common/character_sheets/constants';
import {ADVANTAGE, DISADVANTAGE} from '_common/chat/command_handlers/constants';

const AMBIGUOUS_CHARACTER = 'Multiple characters could match: ';
const AMBIGUOUS_WEAPON = 'Multiple weapons could match: ';
const AMBIGUOUS_SKILL = 'Multiple skills could match: ';
const AMBIGUOUS_ATTR = 'Multiple abilities could match: ';
const AMBIGUOUS_HEADER = ' request was ambiguous';

const advantageCompleter = Autocompleter.create([ADVANTAGE, DISADVANTAGE]);
const skillCompleter = Autocompleter.create(SKILL_ORDER.concat(ABILITY_ORDER));
const abilityCompleter = Autocompleter.create(ABILITY_ORDER);

interface ParseResult {
  queryBase: string;
  characters: CharacterSheetData[];
  advantage: number;
  error?: ChatMessage;
}

function getIgnoringCase<T>(
  map: StringIndexed<T>,
  target: string
): T | undefined {
  for (const key of Array.from(Object.keys(map))) {
    if (key.toLowerCase() === target.toLowerCase()) {
      return map[key];
    }
  }
  return undefined;
}

function parseQuery(query: string, resolver: CharacterResolver): ParseResult {
  const parts = query.split('@');
  if (parts.length !== 2 && parts.length !== 3) {
    return {
      advantage: 0,
      queryBase: query,
      characters: [],
      error: {header: 'Invalid query: check !help', body: query},
    };
  }
  const hasAdv = parts.length === 3;
  const nameIdx = hasAdv ? 2 : 1;
  const base = parts[0].trim();
  let advantage = 0;
  if (hasAdv) {
    const advOptions = advantageCompleter.getOptions(parts[1].trim());
    if (advOptions.length === 1) {
      advantage = advOptions[0] === ADVANTAGE ? 1 : -1;
    }
  }
  return {
    queryBase: base,
    advantage: advantage,
    characters: resolver.complete(parts[nameIdx].trim()),
  };
}

function checkAmbiguousCharacter(
  rollType: string,
  parsed: ParseResult
): ChatMessage | undefined {
  if (parsed.characters.length !== 1) {
    const body =
      AMBIGUOUS_CHARACTER +
      JSON.stringify(parsed.characters.map((c) => c.name));
    return {
      header: rollType + AMBIGUOUS_HEADER,
      body: body,
    };
  }
  return undefined;
}

async function handleSaveCommand(
  query: string,
  resolver: CharacterResolver
): Promise<ChatMessage> {
  const parsed = parseQuery(query, resolver);
  if (parsed.error) {
    return parsed.error;
  }
  const characterError = checkAmbiguousCharacter('Save', parsed);
  if (characterError) {
    return characterError;
  }
  const character = parsed.characters[0];

  const ability = abilityCompleter.getOptions(parsed.queryBase);
  if (ability.length !== 1) {
    return {
      header: 'Save' + AMBIGUOUS_HEADER,
      body: AMBIGUOUS_ATTR + JSON.stringify(ability),
    };
  }

  const rolls = rollDice(20, parsed.advantage === 0 ? 1 : 2);
  const modifier = getIgnoringCase(character.saveBonuses, ability[0]);
  if (modifier === undefined) {
    return {
      header: 'Could not resolve request',
      body: query,
    };
  }
  const result =
    modifier + (parsed.advantage > 0 ? Math.max(...rolls) : Math.min(...rolls));
  const header = `${character.name} ${ability[0]} save throw: ${result}`;
  const body = `${result} = ${JSON.stringify(rolls)} + ${modifier}`;
  return {
    body: body,
    header: header,
  };
}

async function handleCheckCommand(
  query: string,
  resolver: CharacterResolver
): Promise<ChatMessage> {
  const parsed = parseQuery(query, resolver);
  if (parsed.error) {
    return parsed.error;
  }
  const characterError = checkAmbiguousCharacter('Check', parsed);
  if (characterError) {
    return characterError;
  }
  const character = parsed.characters[0];

  let skill = skillCompleter.getOptions(parsed.queryBase);
  if (skill.length > 1) {
    return {
      header: 'Check' + AMBIGUOUS_HEADER,
      body: AMBIGUOUS_SKILL + JSON.stringify(skill),
    };
  } else if (skill.length === 0) {
    skill = abilityCompleter.getOptions(parsed.queryBase);
  }

  if (skill.length !== 1) {
    return {
      header: 'Check' + AMBIGUOUS_HEADER,
      body: AMBIGUOUS_SKILL + JSON.stringify(skill),
    };
  }

  const rolls = rollDice(20, parsed.advantage === 0 ? 1 : 2);
  const modifier = getIgnoringCase(character.checkBonuses, skill[0]);

  if (modifier === undefined) {
    return {
      header: 'Could not resolve request',
      body: query,
    };
  }
  const result =
    modifier + (parsed.advantage > 0 ? Math.max(...rolls) : Math.min(...rolls));
  const header = `${character.name} ${skill[0]} check: ${result}`;
  const body = `${result} = ${JSON.stringify(rolls)} + ${modifier}`;
  return {
    body: body,
    header: header,
  };
}

async function handleAttackCommand(
  query: string,
  resolver: CharacterResolver
): Promise<ChatMessage> {
  const parsed = parseQuery(query, resolver);
  if (parsed.error) {
    return parsed.error;
  }
  const characterError = checkAmbiguousCharacter('Attack', parsed);
  if (characterError) {
    return characterError;
  }
  const character = parsed.characters[0];

  const weaponCompleter = Autocompleter.create(
    Array.from(Object.keys(character.attackBonuses))
  );
  const weapon = weaponCompleter.getOptions(parsed.queryBase);
  if (weapon.length !== 1) {
    return {
      header: 'Attack' + AMBIGUOUS_HEADER,
      body: AMBIGUOUS_WEAPON + JSON.stringify(weapon),
    };
  }

  const rolls = rollDice(20, parsed.advantage === 0 ? 1 : 2);
  const attackData = getIgnoringCase(character.attackBonuses, weapon[0]);
  if (attackData === undefined) {
    return {
      header: 'Could not resolve request',
      body: query,
    };
  }
  const result =
    attackData.toHit +
    (parsed.advantage > 0 ? Math.max(...rolls) : Math.min(...rolls));
  const header = `${character.name} ${weapon[0]} attack roll: ${result}`;
  const damageRoll = rollForString(attackData.damageRoll);

  let body =
    `<b>To hit:</b> ` +
    `${result} = ${JSON.stringify(rolls)} + ${attackData.toHit}`;
  if (!damageRoll.error) {
    const damage = checkDefined(damageRoll.result);
    body += `<br><b>Damage:</b> `;
    body += `${damage.value} = ${damage.text}`;
  }
  return {
    body: body,
    header: header,
  };
}

async function handleInitiativeCommand(
  query: string,
  resolver: CharacterResolver
): Promise<ChatMessage> {
  let characters: CharacterSheetData[] = [];

  if (query !== '') {
    const parsed = parseQuery(query, resolver);

    if (parsed.error) {
      return parsed.error;
    }

    if (parsed.characters.length !== 0) {
      const characterError = checkAmbiguousCharacter('Initiative', parsed);
      if (characterError) {
        return characterError;
      }
    }

    characters = [parsed.characters[0]];
  } else {
    characters = resolver.complete('');
  }

  let results: string = '';

  for (const character of characters) {
    const dexterity = abilityCompleter.getOptions('dexterity');

    if (dexterity.length !== 1) {
      return {
        header: 'Initiative roll failed',
        body: 'Could not get dexterity',
      };
    }

    const rolls = rollDice(20, 1);
    const modifier = getIgnoringCase(character.abilityBonuses, dexterity[0]);

    if (modifier === undefined) {
      return {
        header: 'Could not resolve request',
        body: query,
      };
    }
    const result = modifier + Math.max(...rolls);
    results += `${character.name}: ${result} <br />`;
  }

  return {
    body: results,
    header: 'Initiative Check',
  };
}

export function saveCommandHandler(
  resolver: CharacterResolver
): CommandHandler {
  return (query) => handleSaveCommand(query, resolver);
}

export function checkCommandHandler(
  resolver: CharacterResolver
): CommandHandler {
  return (query) => handleCheckCommand(query, resolver);
}

export function attackCommandHandler(
  resolver: CharacterResolver
): CommandHandler {
  return (query) => handleAttackCommand(query, resolver);
}

export function initiativeCommandHandler(
  resolver: CharacterResolver
): CommandHandler {
  return (query) => handleInitiativeCommand(query, resolver);
}
