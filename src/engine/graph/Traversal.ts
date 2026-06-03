/** BFS and DFS graph traversal utilities. */

export function bfs(
  start: string,
  adjacency: Map<string, string[]>,
  visited?: Set<string>,
): string[] {
  const order: string[] = [];
  const seen = visited ?? new Set<string>();
  const queue: string[] = [start];
  seen.add(start);

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

export function bfsOnNumbers(
  start: number,
  adjacency: Map<number, Set<number>>,
): number[] {
  const order: number[] = [];
  const seen = new Set<number>([start]);
  const queue: number[] = [start];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

export function dfs(
  start: string,
  adjacency: Map<string, string[]>,
  visited?: Set<string>,
): string[] {
  const order: string[] = [];
  const seen = visited ?? new Set<string>();

  const visit = (node: string): void => {
    seen.add(node);
    order.push(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (!seen.has(neighbor)) visit(neighbor);
    }
  };

  visit(start);
  return order;
}

/** Find shortest path between two nodes using BFS */
export function findPath(
  from: string,
  to: string,
  adjacency: Map<string, string[]>,
): string[] | null {
  if (from === to) return [from];

  const queue: string[] = [from];
  const parent = new Map<string, string | null>([[from, null]]);

  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const neighbor of adjacency.get(node) ?? []) {
      if (parent.has(neighbor)) continue;
      parent.set(neighbor, node);
      if (neighbor === to) {
        const path: string[] = [];
        let current: string | null = to;
        while (current !== null) {
          path.unshift(current);
          current = parent.get(current) ?? null;
        }
        return path;
      }
      queue.push(neighbor);
    }
  }
  return null;
}

/** Detect cycles in undirected graph using DFS */
export function detectCycleUndirected(adjacency: Map<string, string[]>): boolean {
  const visited = new Set<string>();

  const dfsCycle = (node: string, parent: string | null): boolean => {
    visited.add(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (neighbor === parent) continue;
      if (visited.has(neighbor)) return true;
      if (dfsCycle(neighbor, node)) return true;
    }
    return false;
  };

  for (const node of adjacency.keys()) {
    if (!visited.has(node) && dfsCycle(node, null)) return true;
  }
  return false;
}

/** Get connected components as arrays of node ids */
export function getConnectedComponents(adjacency: Map<string, string[]>): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of adjacency.keys()) {
    if (visited.has(node)) continue;
    const component = bfs(node, adjacency, visited);
    components.push(component);
  }
  return components;
}

/** Get connected components on numeric adjacency */
export function getNumericConnectedComponents(
  adjacency: Map<number, Set<number>>,
): number[][] {
  const visited = new Set<number>();
  const components: number[][] = [];

  for (const node of adjacency.keys()) {
    if (visited.has(node)) continue;
    const component = bfsOnNumbers(node, adjacency);
    for (const n of component) visited.add(n);
    components.push(component);
  }
  return components;
}
