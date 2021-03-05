import {ChatMessage} from '_common/chat/chat_model';
import {checkDefined} from '_common/preconditions';
import {handleRollCommand} from '_common/chat/command_handlers/roll_command_handler';
import {CommandType, processCommand} from '_common/chat/command_parser';


export type ResolvedCommand = Promise<ChatMessage|undefined>;

export class CommandResolver {
  constructor() {}

  async handleCommand(inputCommand: string): ResolvedCommand {
    const result = processCommand(inputCommand);
    if (result.error) {
      if (result.error.possibleTypes.length === 0) {
        // If it's not parsable as a command, it's probably a regular chat.
        return undefined;
      }
      const header = 'Got ambiguous command ' + result.error.commandAttempt;
      const body =
          'Could be either ' + JSON.stringify(result.error.possibleTypes);
      return {header: header, body: body};
    }

    const command = checkDefined(result.command);
    if (command.command === CommandType.Roll) {
      return handleRollCommand(command.query);
    } else if (command.command === CommandType.Attack) {
      // TODO: Handle attack rolls
    } else if (command.command === CommandType.Check) {
      // TODO: Handle ability checks
    } else if (command.command === CommandType.Help) {
      // TODO: Handle
    } else if (command.command === CommandType.Save) {
      // TODO: Handle saving throws
    } else if (command.command === CommandType.SetCharacter) {
      // TODO: Handle setting character
    }
    return {
      header: inputCommand,
      body: 'Not supported yet - coming soon!'};
  }
}

let cachedResolver: CommandResolver|undefined = undefined;

export function commandResolver(): CommandResolver {
  if (cachedResolver === undefined) {
    console.log('Creating new command resolver');
    cachedResolver = new CommandResolver();
  }
  return cachedResolver;
}
