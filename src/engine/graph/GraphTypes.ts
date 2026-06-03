export interface GraphNode {
  id: string;
  /** Raw electrical node id before reindexing */
  rawNodeId: number;
  /** Resolved electrical node id after Union-Find */
  electricalNodeId: number;
  terminalId?: string;
  componentId?: string;
}

export interface GraphEdge {
  id: string;
  kind: 'wire' | 'element';
  nodeAId: string;
  nodeBId: string;
  elementId?: string;
  elementType?: string;
}

export function createGraphNode(
  id: string,
  rawNodeId: number,
  opts?: Partial<Pick<GraphNode, 'terminalId' | 'componentId' | 'electricalNodeId'>>,
): GraphNode {
  return {
    id,
    rawNodeId,
    electricalNodeId: opts?.electricalNodeId ?? rawNodeId,
    terminalId: opts?.terminalId,
    componentId: opts?.componentId,
  };
}

export function createGraphEdge(
  id: string,
  nodeAId: string,
  nodeBId: string,
  kind: GraphEdge['kind'],
  opts?: Partial<Pick<GraphEdge, 'elementId' | 'elementType'>>,
): GraphEdge {
  return {
    id,
    kind,
    nodeAId,
    nodeBId,
    elementId: opts?.elementId,
    elementType: opts?.elementType,
  };
}
