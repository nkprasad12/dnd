import {checkDefined} from '_common/preconditions';
import {Autocompleter} from '_common/chat/autocompleter';

export enum CommandType {
  Roll = '!roll',
  Save = '!save',
  Check = '!check',
  Attack = '!attack',
  Load = '!load',
  Help = '!help',
  Lookup = '!spell',
}

const COMMAND_TYPE_LOOKUP: Map<string, CommandType> = new Map();
COMMAND_TYPE_LOOKUP.set('!roll', CommandType.Roll);
COMMAND_TYPE_LOOKUP.set('!save', CommandType.Save);
COMMAND_TYPE_LOOKUP.set('!check', CommandType.Check);
COMMAND_TYPE_LOOKUP.set('!attack', CommandType.Attack);
COMMAND_TYPE_LOOKUP.set('!load', CommandType.Load);
COMMAND_TYPE_LOOKUP.set('!help', CommandType.Help);
COMMAND_TYPE_LOOKUP.set('!spell', CommandType.Lookup);

/** Represents a partially parsed command. */
export interface Command {
  /** The action to be taken. */
  readonly command: CommandType;
  /** The rest of the command query besides the action. */
  readonly query: string;
}

export interface ProcessCommandError {
  /** The command string on which we attempted completion. */
  readonly commandAttempt: string;
  /** The possible results of this command string. */
  readonly possibleTypes: CommandType[];
}

export interface ProcessCommandResult {
  command?: Command;
  error?: ProcessCommandError;
}

const commandCompleter = Autocompleter.create(Object.values(CommandType));

export function processCommand(inputString: string): ProcessCommandResult {
  // Trim and consolide repeated spaces.
  const input = inputString.trim().replace(/  +/g, ' ');
  const spaceIndex = input.indexOf(' ');
  const maybeCommand = spaceIndex === -1 ? input : input.substr(0, spaceIndex);
  const options = commandCompleter.getOptions(maybeCommand);
  if (options.length === 0) {
    return {error: {commandAttempt: maybeCommand, possibleTypes: []}};
  }
  const optionEnums = options.map((str) =>
    checkDefined(COMMAND_TYPE_LOOKUP.get(str))
  );
  if (optionEnums.length === 1) {
    const query = spaceIndex === -1 ? '' : input.substring(spaceIndex).trim();
    return {command: {command: optionEnums[0], query: query}};
  }
  return {
    error: {commandAttempt: maybeCommand, possibleTypes: optionEnums},
  };
}
