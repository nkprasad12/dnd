import {ChatMessage} from '_common/chat/chat_model';
import {checkDefined} from '_common/preconditions';
import {CommandType, processCommand} from '_server/chat/command_parser';
import {rollDice} from '_server/chat/dice_roller';


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
    if (command.command !== CommandType.Roll) {
      return {
        header: inputCommand,
        body: 'Not supported yet - coming soon!'};
    }

    const diceParts = command.query.split('d');
    if (diceParts.length < 2) {
      return rollErrorMessage(command.query);
    }
    const numDice = parseInt(diceParts[0]);
    if (numDice === undefined || numDice < 1) {
      return rollErrorMessage(command.query);
    }
    const numSides = parseInt(diceParts[1]);
    if (numSides === undefined || numSides < 1) {
      return rollErrorMessage(command.query);
    }
    return rollMessage(numDice, numSides);
  }
}

function rollMessage(numDice: number, numSides: number): ChatMessage {
  const rolls = rollDice(numSides, numDice);
  const header = `Result of ${numDice} d${numSides} rolls:`;
  const sum = rolls.reduceRight((sumSoFar, current) => sumSoFar + current, 0);
  const body = `${sum} from ${JSON.stringify(rolls)}`;
  return {header: header, body: body};
}

function rollErrorMessage(input: string): ChatMessage {
  const header = `${input} is not a valid roll input.`;
  const usage = 'Example: !roll 2d20 to roll 2 dice with 20 sides.';
  return {header: header, body: usage};
}

let cachedResolver: CommandResolver|undefined = undefined;

export function commandResolver(): CommandResolver {
  if (cachedResolver === undefined) {
    console.log('Creating new command resolver');
    cachedResolver = new CommandResolver();
  }
  return cachedResolver;
}
