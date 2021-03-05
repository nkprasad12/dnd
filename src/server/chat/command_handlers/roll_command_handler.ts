import {ChatMessage} from '_common/chat/chat_model';
import {rollDice} from '_server/chat/dice_roller';


/** Handles a roll query. If the input was !r 1d20, '1d20' is the query. */
export function handleRollCommand(query: string): ChatMessage {
  const diceParts = query.split('d');
  if (diceParts.length < 2) {
    return rollErrorMessage(query);
  }
  const numDice = parseInt(diceParts[0]);
  if (numDice === undefined || numDice < 1) {
    return rollErrorMessage(query);
  }
  const numSides = parseInt(diceParts[1]);
  if (numSides === undefined || numSides < 1) {
    return rollErrorMessage(query);
  }
  return rollMessage(numDice, numSides);
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
