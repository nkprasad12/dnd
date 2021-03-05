import {ChatMessage} from '_common/chat/chat_model';
import {CommandHandler} from '_common/chat/chat_resolver';
import {CharacterSheetCache} from '_server/sheets/sheet_cache';


const SHEET_ID_PREFIX = 'spreadsheets/d/';
const BAD_SHEET = ' was either not public, or was not in the expected format';

/** Loads a character sheet from URL. */
async function handleLoadCommand(
    query: string, cache: CharacterSheetCache): Promise<ChatMessage> {
  if (query.indexOf(SHEET_ID_PREFIX) === -1) {
    return loadErrorMessage(query);
  }
  const id = query.split(SHEET_ID_PREFIX)[1].split('/')[0];
  try {
    const data = await cache.load(id);
    return {body: 'Successfully loaded ' + data.loadedName};
  } catch (e) {
    return {
      header: 'Load Error: Invalid content',
      body: query + BAD_SHEET,
    };
  }
}

function loadErrorMessage(query: string): ChatMessage {
  return {
    header: 'Load Error: Invalid link',
    body: query + ' is not a valid sheets link',
  };
}

export function loadCommandHandler(cache: CharacterSheetCache): CommandHandler {
  return (query) => handleLoadCommand(query, cache);
}
