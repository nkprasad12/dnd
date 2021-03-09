/** Represents a basic undirected graph node. */
export class GraphNode<T> {
  readonly value: T;
  readonly neighbors: Array<GraphNode<T>> = [];

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Returns the first neighbor with a value that matches the target value.
   * Returns undefined if no neighbors have the target value.
   */
  getChild(searchValue: T): GraphNode<T> | undefined {
    for (const neighbor of this.neighbors) {
      if (neighbor.value === searchValue) {
        return neighbor;
      }
    }
    return undefined;
  }

  /** Adds the input as a neighbor of this node. */
  addNeighbor(neighbor: GraphNode<T>): void {
    this.neighbors.push(neighbor);
  }

  /**
   * Creates a node with the given value, adds it as a neighbor, and returns it.
   */
  addValueAsNeighbor(value: T): GraphNode<T> {
    const result = new GraphNode(value);
    this.addNeighbor(result);
    return result;
  }
}
