export function checkDefined(input: any): any {
  if (input === undefined || input === null) {
    throw new Error('Input was not defined!');
  }
  return input;
}

export function printFoo(): void {
  console.log('Ladedadee');
}
