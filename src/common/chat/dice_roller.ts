export function rollDice(numSides: number, numDice: number = 1): number[] {
  return Array(numDice)
    .fill(0)
    .map(() => rollDie(numSides));
}

function rollDie(numSides: number): number {
  return getRandomIntInclusive(1, numSides);
}

function getRandomIntInclusive(min: number, max: number): number {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
}
