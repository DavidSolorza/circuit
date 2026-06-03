import type { EngineElementType } from '../types';

export interface SimulationTreeNode {
  id: string;
  label: string;
  type: 'circuit' | 'branch' | EngineElementType | 'source';
  children: SimulationTreeNode[];
  elementId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * SimulationTree — hierarchical circuit representation for navigation,
 * grouping, serialization and future export.
 */
export class SimulationTree {
  root: SimulationTreeNode;

  constructor(label = 'Circuito') {
    this.root = {
      id: 'root',
      label,
      type: 'circuit',
      children: [],
    };
  }

  addBranch(id: string, label: string): SimulationTreeNode {
    const branch: SimulationTreeNode = {
      id,
      label,
      type: 'branch',
      children: [],
    };
    this.root.children.push(branch);
    return branch;
  }

  addElement(
    parent: SimulationTreeNode,
    elementId: string,
    type: EngineElementType,
    label: string,
  ): SimulationTreeNode {
    const node: SimulationTreeNode = {
      id: elementId,
      label,
      type,
      elementId,
      children: [],
    };
    parent.children.push(node);
    return node;
  }

  findById(id: string, node: SimulationTreeNode = this.root): SimulationTreeNode | null {
    if (node.id === id || node.elementId === id) return node;
    for (const child of node.children) {
      const found = this.findById(id, child);
      if (found) return found;
    }
    return null;
  }

  traverse(callback: (node: SimulationTreeNode, depth: number) => void, node = this.root, depth = 0): void {
    callback(node, depth);
    for (const child of node.children) {
      this.traverse(callback, child, depth + 1);
    }
  }

  serialize(): string {
    return JSON.stringify(this.root, null, 2);
  }

  static deserialize(json: string): SimulationTree {
    const tree = new SimulationTree();
    tree.root = JSON.parse(json) as SimulationTreeNode;
    return tree;
  }

  toAscii(): string {
    const lines: string[] = [];
    const render = (node: SimulationTreeNode, prefix: string, isLast: boolean): void => {
      const connector = prefix.length === 0 ? '' : isLast ? '└─ ' : '├─ ';
      lines.push(`${prefix}${connector}${node.label} (${node.type})`);
      const childPrefix = prefix.length === 0 ? '' : prefix + (isLast ? '   ' : '│  ');
      node.children.forEach((child, i) => {
        render(child, childPrefix, i === node.children.length - 1);
      });
    };
    render(this.root, '', true);
    return lines.join('\n');
  }
}
