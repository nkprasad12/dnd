import {Sheets} from '_common/character_sheets/utils';
import {ChatMessage} from '_common/chat/chat_model';
import {CommandHandler} from '_common/chat/chat_resolver';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';

const BAD_SHEET = ' was either not public, or was not in the expected format';

/** Loads a character sheet from URL. */
async function handleLoadCommand(
  query: string,
  cache: CharacterSheetCache
): Promise<ChatMessage> {
  const id = Sheets.idFromUrl(query);
  if (id === null) {
    return loadErrorMessage(query);
  }
  try {
    const data = await cache.load(id);
    return {body: 'Successfully loaded ' + data.loadedData.name};
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
