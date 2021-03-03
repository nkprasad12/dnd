
export function getElementById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element == null) {
    throw new Error('getElementById on invalid id: ' + id);
  }
  return element;
}
