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

export function addParagraph(
  parent: HTMLElement,
  content: string,
  className?: string
): HTMLParagraphElement {
  const paragraph = document.createElement('p');
  if (className) {
    paragraph.className = className;
  }
  paragraph.innerHTML = content;
  parent.appendChild(paragraph);
  return paragraph;
}

export function addDiv(
  parent: HTMLElement,
  className?: string
): HTMLDivElement {
  const element = document.createElement('div');
  if (className) {
    element.className = className;
  }
  parent.appendChild(element);
  return element;
}

export function prependDiv(
  parent: HTMLElement,
  className?: string
): HTMLDivElement {
  const element = document.createElement('div');
  if (className) {
    element.className = className;
  }
  parent.prepend(element);
  return element;
}

export function addTextArea(
  parent: HTMLElement,
  className?: string,
  placeholder?: string,
  rows?: number
): HTMLTextAreaElement {
  const element = document.createElement('textarea');
  if (className) {
    element.className = className;
  }
  if (placeholder) {
    element.placeholder = placeholder;
  }
  if (rows !== undefined) {
    element.rows = rows;
  }
  parent.appendChild(element);
  return element;
}

export function removeChildrenOf(id: string, root?: HTMLElement) {
  const item = getElementById(id, root);
  while (item.firstChild) {
    item.removeChild(item.firstChild);
  }
}
