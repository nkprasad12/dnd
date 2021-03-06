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
