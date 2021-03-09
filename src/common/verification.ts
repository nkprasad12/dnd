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
