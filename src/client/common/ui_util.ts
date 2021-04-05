export function getElementById(id: string, root?: HTMLElement): HTMLElement {
  const element =
    root === undefined
      ? document.getElementById(id)
      : (root.querySelector(`#${id}`) as HTMLElement);
  if (element == null) {
    throw new Error('getElementById on invalid id: ' + id);
  }
  return element;
}

export function removeChildrenOf(id: string, root?: HTMLElement) {
  const item = getElementById(id, root);
  while (item.firstChild) {
    item.removeChild(item.firstChild);
  }
}
