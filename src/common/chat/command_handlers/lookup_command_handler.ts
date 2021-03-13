import {Autocompleter} from '_common/chat/autocompleter';
import {ChatMessage} from '_common/chat/chat_model';
import {CommandHandler} from '_common/chat/chat_resolver';
import {LOOKUP_ORDER, Spell} from '_common/chat/command_handlers/types';
import {checkDefined} from '_common/preconditions';

const spellCompleter = Autocompleter.create(LOOKUP_ORDER);

/** Handles a lookup query. If the input was !r 1d20, '1d20' is the query. */
async function handleLookupCommand(
  query: string,
  spells: Spell[]
): Promise<ChatMessage> {
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
