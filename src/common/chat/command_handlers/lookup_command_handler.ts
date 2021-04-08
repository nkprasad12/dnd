import {Autocompleter} from '_common/chat/autocompleter';
import {ChatMessage} from '_common/chat/chat_model';
import {CommandHandler} from '_common/chat/chat_resolver';
import {Spell} from '_common/character_sheets/types';
import {checkDefined} from '_common/preconditions';

let spellCompleter: Autocompleter | undefined = undefined;

/** Handles a lookup query. If the input was !r 1d20, '1d20' is the query. */
async function handleLookupCommand(
  query: string,
  spells: Spell[]
): Promise<ChatMessage> {
  if (!spellCompleter) {
    const lookupNames: string[] = [];

    spells.forEach((spell: Spell) => {
      lookupNames.push(spell['name']);
    });

    spellCompleter = Autocompleter.create(lookupNames);
  }
  const spell = spellCompleter.getOptions(query);
  if (spell.length !== 1) {
    return {
      header: 'Spell not found',
      body: `Returned result: ${JSON.stringify(spell)}`,
    };
  }

  const spellObj = checkDefined(getSpell(spell[0], spells));

  return {
    header: `Spell found: ${JSON.stringify(spellObj['name'])}`,
    body: getFormattedResult(spellObj),
  };
}

function getFormattedResult(spell: Spell): string {
  const result: string = `
    <strong>Name</strong>: ${spell['name']} <br/>
    <strong>Range</strong>: ${spell['range']} <br/>
    <strong>Duration</strong>: ${spell['duration']} <br/>
    <strong>Concentration</strong>: ${spell['concentration']} <br/>
    <strong>Casting Time</strong>: ${spell['castingTime']} <br/>
    <strong>Level</strong>: ${spell['level']} <br/>
    <strong>School</strong>: ${spell['school']} <br/>
    <strong>Material</strong>: ${spell['material']} <br/><br/>
    <strong>Description</strong>: ${spell['desc']} <br/>
    <strong>Higher Level</strong>: ${spell['higherLevel']} <br/><br/>
    `;

  return result;
}

function getSpell(spell: string, spells: Spell[]): Spell | undefined {
  let result: Spell | undefined = undefined;
  spells.forEach((spellObj) => {
    if (spellObj['name'].toLocaleLowerCase() == spell.toLocaleLowerCase()) {
      result = spellObj;
    }
  });

  return result;
}

export function lookupCommandHandler(spells: Spell[]): CommandHandler {
  return (query) => handleLookupCommand(query, spells);
}
