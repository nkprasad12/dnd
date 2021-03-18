import {checkState} from '_common/preconditions';

/** Returns the mathematical n modulo m. */
export function modulo(n: number, m: number) {
  checkState(m >= 1, 'Modulus m must be greater than 0');
  return ((n % m) + m) % m;
}
