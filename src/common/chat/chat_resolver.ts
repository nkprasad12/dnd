import {ChatMessage} from '_common/chat/chat_model';
import {checkDefined} from '_common/preconditions';
import {handleRollCommand} from '_common/chat/command_handlers/roll_command_handler';
import {CommandType, processCommand} from '_common/chat/command_parser';


const COMING_SOON = 'Not supported yet - coming soon!';

export type CommandHandler = (input: string) => Promise<ChatMessage>;
export type ResolvedCommand = Promise<ChatMessage|undefined>;

export class CommandResolver {
  private handlers: Map<CommandType, CommandHandler> = new Map();

  constructor() {}

  /** Overrides existing handling for the type, if any. */
  addCommandHandler(command: CommandType, handler: CommandHandler) {
    this.handlers.set(command, handler);
  }

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
    const override = this.handlers.get(command.command);
    if (override !== undefined) {
      return override(command.query);
    }
    return handleHelpCommand();
  }
}

async function handleHelpCommand(): Promise<ChatMessage> {
  const header = '!help - command reference';
  const body = [
    'Hint: anything can be abbreviated if unambiguous',
    'Command Guide (? indicates optional)',
    '!attack [weapon] [adv / dis]? [character name]',
    '!check [skill] [adv / dis]? [character name]',
    '!roll AdB (+ ... + XdY)? + number? [adv / dis]?',
    '!save [ability] [adv / dis]? [character name]',
    '!load [character sheet URL]',
  ];
  return {header: header, body: body.join('<br>')};
}

let cachedResolver: CommandResolver|undefined = undefined;

export function commandResolver(): CommandResolver {
  if (cachedResolver === undefined) {
    console.log('Creating new command resolver');
    cachedResolver = new CommandResolver();
    cachedResolver.addCommandHandler(CommandType.Roll, handleRollCommand);
    cachedResolver.addCommandHandler(CommandType.Help, handleHelpCommand);
    cachedResolver.addCommandHandler(
        CommandType.Attack,
        async () => {
          return {header: CommandType.Attack, body: COMING_SOON};
        });
    cachedResolver.addCommandHandler(
        CommandType.Check,
        async () => {
          return {header: CommandType.Check, body: COMING_SOON};
        });
    cachedResolver.addCommandHandler(
        CommandType.Save,
        async () => {
          return {header: CommandType.Save, body: COMING_SOON};
        });
  }
  return cachedResolver;
}
