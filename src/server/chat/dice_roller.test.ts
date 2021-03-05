import {rollDice} from '_server/chat/dice_roller';


test('rollDice rolls expected number of dice', () => {
  expect(rollDice(5, 22).length).toBe(22);
});

test('rollDice rolls one die by default', () => {
  expect(rollDice(6).length).toBe(1);
});

test('rollDice has expected range', () => {
  const rollResult = rollDice(20, 10000);
  // Technically, this will flake with probability .9^10000 but the universe
  // will likely end first.
  expect(Math.min(...rollResult)).toBe(1);
  expect(Math.max(...rollResult)).toBe(20);
});
