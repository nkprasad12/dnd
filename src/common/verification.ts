export function isStringArray(input: any): input is string[] {
  if (!Array.isArray(input)) {
    return false;
  }
  for (const item of input) {
    if (typeof item !== 'string') {
      return false;
    }
  }
  return true;
}

export function isGrid(
  input: any,
  cols: number,
  rows: number
): input is any[][] {
  if (!Array.isArray(input)) {
    return false;
  }
  if (input.length !== cols) {
    return false;
  }
  if (cols === 0) {
    return true;
  }
  for (const column of input) {
    if (!Array.isArray(column)) {
      return false;
    }
    if (column.length !== rows) {
      return false;
    }
  }
  return true;
}

/** Returns the first if it is defined, and otherwise the backup. */
export function prefer<T>(preferred: T | undefined | null, backup: T): T {
  if (preferred === undefined || preferred === null) {
    return backup;
  }
  return preferred;
}

/** Merged the input if both are defined, otherwise returns the base. */
export function maybeMerge<T, S>(
  base: T,
  diff: S | undefined | null,
  merger: (t: T, s: S) => T
): T {
  if (diff === undefined || diff === null) {
    return base;
  }
  return merger(base, diff);
}

export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

/** Returns whether the value is in the specified inclusive range. */
export function inRange(
  lower: number,
  upper: number
): (value: number) => boolean {
  return (value) => lower <= value && value <= upper;
}
