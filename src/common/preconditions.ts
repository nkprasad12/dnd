export function checkState(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * @deprecated prefer the `!` operator instead.
 *
 * `checkDefined(foo)` is exactly equivalent to `foo!`, the only exception is
 * when there's a strong reason to want to keep the custom error message.
 */
export function checkDefined<T>(input: T | undefined | null, name?: string): T {
  if (input === undefined || input === null) {
    if (name === undefined) {
      name = 'Input';
    }
    throw new Error(`${name} was not defined!`);
  }
  return input;
}
