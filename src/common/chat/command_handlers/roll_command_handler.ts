import {Autocompleter} from '_common/chat/autocompleter';
import {ChatMessage} from '_common/chat/chat_model';
import {ADVANTAGE, DISADVANTAGE} from '_common/chat/command_handlers/types';
import {rollDice} from '_common/chat/dice_roller';
import {checkDefined} from '_common/preconditions';


const advantageCompleter = Autocompleter.create([ADVANTAGE, DISADVANTAGE]);

interface DiceResolution {
  result?: DiceResult,
  error?: ChatMessage,
}

interface DiceResult {
  value: number;
  text: string;
}

function plus(a: DiceResult, b: DiceResult) {
  return {
    value: a.value + b.value,
    text: a.text + ' + ' + b.text,
  };
}

function combine(rolls: DiceResult[]): DiceResult {
  if (rolls.length <= 0) {
    throw new Error('Got an invalid number of rolls.');
  } else if (rolls.length === 1) {
    return rolls[0];
  } else {
    const first = rolls[0];
    const tail = rolls.slice(1);
    tail[0] = plus(first, tail[0]);
    return combine(tail);
  }
}

function rollErrorMessage(input: string): ChatMessage {
  const header = `${input} is not a valid roll input.`;
  const usage = 'Example: !roll 2d20 to roll 2 dice with 20 sides.';
  return {header: header, body: usage};
}

function resolveConstant(input: string): number|undefined {
  if (isNaN(+input)) {
    return undefined;
  }
  try {
    const result = parseInt(input);
    return result;
  } catch {
    return undefined;
  }
}

function resolveRollPart(input: string): DiceResolution {
  const constant = resolveConstant(input);
  if (constant !== undefined) {
    return {result: {value: constant, text: input}};
  }
  const parts = input.split('d');
  if (parts.length !== 2) {
    return {error: rollErrorMessage(input)};
  }
  const numDice = resolveConstant(parts[0]);
  const numSides = resolveConstant(parts[1]);
  if (!numDice || !numSides) {
    return {error: rollErrorMessage(input)};
  }
  const rolls = rollDice(numSides, numDice);
  const sum = rolls.reduceRight((sumSoFar, current) => sumSoFar + current, 0);
  return {result: {value: sum, text: JSON.stringify(rolls)}};
}

function rollForString(query: string): DiceResolution {
  let parts = query.split('+');
  parts = parts.map((part) => part.trim());
  const resolution = parts.map((part) => resolveRollPart(part));
  const diceResults: DiceResult[] = [];
  for (const result of resolution) {
    if (result.error) {
      return result;
    }
    diceResults.push(checkDefined(result.result));
  }
  return {result: combine(diceResults)};
}

function processQuery(query: string): DiceResolution {
  const parts = query.split('@');
  if (parts.length === 1) {
    return rollForString(query);
  } else {
    const adv = advantageCompleter.getOptions(parts[1].trim());
    if (adv.length !== 1) {
      return {
        error: {
          header: 'Could not parse (dis)advantage part - see !help',
          body: `Query: ${query}`,
        }};
    }
    const firstResolution = rollForString(parts[0]);
    const secondResolution = rollForString(parts[0]);
    if (firstResolution.error || secondResolution.error) {
      return firstResolution;
    }
    const first = checkDefined(firstResolution.result);
    const second = checkDefined(secondResolution.result);
    const values = [first.value, second.value];
    const finalValue =
        adv[0] === ADVANTAGE ? Math.max(...values) : Math.min(...values);
    const advStr = adv[0] === ADVANTAGE ? 'max' : 'min';
    const finalText =
        `${finalValue} = ${advStr}${JSON.stringify(values)} ` +
            `(${first.text}, ${second.text})`;
    return {result: {value: finalValue, text: finalText}};
  }
}

/** Handles a roll query. If the input was !r 1d20, '1d20' is the query. */
export async function handleRollCommand(query: string): Promise<ChatMessage> {
  const result = processQuery(query);
  if (result.error) {
    return result.error;
  }
  const roll: DiceResult = checkDefined(result.result);
  return {
    header: `Roll ${query} result: ${roll.value}`,
    body: roll.text,
  };
}
