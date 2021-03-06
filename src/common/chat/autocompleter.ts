import {GraphNode} from '_common/graphs/primitives';
import {checkDefined} from '_common/preconditions';

/** Represents an autocompleter for partial inputs. */
export class Autocompleter {
  static create(initalOptions?: string[]): Autocompleter {
    const completer = new Autocompleter();
    if (initalOptions) {
      completer.addOptions(initalOptions);
    }
    return completer;
  }

  private readonly root = new GraphNode('');
  private tokenMap: Map<string, string[]> = new Map<string, string[]>();

  private constructor() {}

  /** Adds the option to the list of outputs to complete to. Ignores case. */
  addOption(option: string): void {
    let currentNode = this.root;
    const entry = option.toLowerCase().trim();
    for (let i = 0; i < entry.length; i++) {
      const char = entry.charAt(i);
      const maybeChild = currentNode.getChild(char);
      currentNode =
        maybeChild !== undefined
          ? maybeChild
          : currentNode.addValueAsNeighbor(char);
    }

    const tokens = option.split(' ');
    tokens.forEach((token) => {
      if (!this.tokenMap.has(token)) {
        this.tokenMap.set(token, [option]);
      } else {
        // Update the array held in the map by reference
        checkDefined(this.tokenMap.get(token)).push(option);
      }
    });
  }

  /** Adds the options to the list of outputs to complete to. Ignores case. */
  addOptions(options: string[]): void {
    for (const option of options) {
      this.addOption(option);
    }
  }

  /** Returns the autocomplete options for the given prefix string. */
  getOptions(input: string): string[] {
    const prefix = input.trim().toLowerCase();
    let foundPrefixMatch: boolean = true;
    let prefixRoot = this.root;

    for (let i = 0; i < prefix.length; i++) {
      const char = prefix.charAt(i);
      const next = prefixRoot.getChild(char);
      if (next === undefined) {
        foundPrefixMatch = false;
        break;
      }
      prefixRoot = next;
    }

    if (!foundPrefixMatch) {
      return this.tokenMap.has(input)
        ? checkDefined(this.tokenMap.get(input))
        : [];
    }

    const start = prefix.substr(0, prefix.length - 1);
    return completeFromNode(prefixRoot).map((suffix) => start + suffix);
  }
}

function completeFromNode(start: GraphNode<string>): string[] {
  if (start.neighbors.length === 0) {
    return [start.value];
  }
  return start.neighbors
    .map((node) => completeFromNode(node))
    .reduce((collected, current) => collected.concat(current), [])
    .map((suffix) => start.value + suffix);
}
