import {ChatMessage} from '_common/chat/chat_model';


export type ResolvedCommand = Promise<ChatMessage|undefined>;

export class CommandResolver {
  constructor() {}

  async handleCommand(inputCommand: string): ResolvedCommand {
    const body = inputCommand.trim();
    if (!body.startsWith('!roll ')) {
      return undefined;
    }
    const command = body.split(' ')[1];
    const diceParts = command.split('d');
    if (diceParts.length < 2) {
      return rollErrorMessage(body);
    }
    const numDice = parseInt(diceParts[0]);
    if (numDice === undefined || numDice < 1) {
      return rollErrorMessage(body);
    }
    const numSides = parseInt(diceParts[1]);
    if (numSides === undefined || numSides < 1) {
      return rollErrorMessage(body);
    }
    return rollMessage(numDice, numSides);
  }
}

function rollMessage(numDice: number, numSides: number): ChatMessage {
  const rolls = rollDice(numDice, numSides);
  const header = `Result of ${numDice} d${numSides} rolls:`;
  const sum = rolls.reduceRight((sumSoFar, current) => sumSoFar + current, 0);
  const body = `${sum} from ${JSON.stringify(rolls)}`;
  return {header: header, body: body};
}

function rollDice(numDice: number, numSides: number): number[] {
  return Array(numDice).fill(0).map(() => rollDie(numSides));
}

function rollDie(numSides: number): number {
  return getRandomIntInclusive(1, numSides);
}

function getRandomIntInclusive(min: number, max: number): number {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
}

function rollErrorMessage(input: string): ChatMessage {
  const header = `${input} is not a valid input.`;
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
