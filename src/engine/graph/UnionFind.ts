/** Disjoint Set Union with path compression and union by rank. */

export class UnionFind {
  private parent: Map<number, number> = new Map();
  private rank: Map<number, number> = new Map();

  makeSet(x: number): void {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
    }
  }

  find(x: number): number {
    this.makeSet(x);
    let root = x;
    while (this.parent.get(root)! !== root) {
      root = this.parent.get(root)!;
    }
    // Path compression
    let current = x;
    while (current !== root) {
      const next = this.parent.get(current)!;
      this.parent.set(current, root);
      current = next;
    }
    return root;
  }

  union(a: number, b: number): number {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return rootA;

    const rankA = this.rank.get(rootA)!;
    const rankB = this.rank.get(rootB)!;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
      return rootB;
    }
    if (rankA > rankB) {
      this.parent.set(rootB, rootA);
      return rootA;
    }
    this.parent.set(rootB, rootA);
    this.rank.set(rootA, rankA + 1);
    return rootA;
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }

  /** Returns canonical representative for each member */
  getComponents(): Map<number, number[]> {
    const groups = new Map<number, number[]>();
    for (const key of this.parent.keys()) {
      const root = this.find(key);
      const list = groups.get(root) ?? [];
      list.push(key);
      groups.set(root, list);
    }
    return groups;
  }

  reset(): void {
    this.parent.clear();
    this.rank.clear();
  }
}
