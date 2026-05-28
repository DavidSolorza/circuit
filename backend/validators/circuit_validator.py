from __future__ import annotations
from ..models.circuit import SimulationRequest, ComponentType


def validate_circuit(req: SimulationRequest) -> tuple[bool, list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    comps = req.components
    terms = req.terminals
    wires = req.wires

    if not comps:
        errors.append("Circuit has no components.")
        return False, errors, warnings

    # 1. Check for ground
    has_ground = any(c.type == ComponentType.ground for c in comps.values())
    if not has_ground:
        errors.append("Circuit must have a ground (GND) component.")

    # 2. Check each component has both terminals in the wire map
    merged_nodes: dict[int, int] = {}
    for t in terms.values():
        merged_nodes[t.nodeId] = t.nodeId

    for w in wires:
        ft = terms.get(w.fromTerminalId)
        tt = terms.get(w.toTerminalId)
        if ft is None or tt is None:
            continue
        a, b = ft.nodeId, tt.nodeId
        if a != b:
            old = max(a, b)
            new = min(a, b)
            for k in list(merged_nodes.keys()):
                if merged_nodes[k] == old:
                    merged_nodes[k] = new

    def resolve(n: int) -> int:
        while merged_nodes[n] != n:
            merged_nodes[n] = merged_nodes[merged_nodes[n]]
            n = merged_nodes[n]
        return n

    terminal_node_map: dict[str, int] = {}
    for tid, t in terms.items():
        terminal_node_map[tid] = resolve(t.nodeId)

    # 3. Check for dangling terminals (not connected to any wire)
    connected_terminals: set[str] = set()
    for w in wires:
        connected_terminals.add(w.fromTerminalId)
        connected_terminals.add(w.toTerminalId)

    for cid, comp in comps.items():
        for t in terms.values():
            if t.componentId == cid:
                if t.id not in connected_terminals:
                    if comp.type != ComponentType.ground:
                        warnings.append(
                            f"Component '{comp.label or cid}' has an unconnected terminal."
                        )

    # 4. Check that all non-ground components reach ground via the circuit graph.
    #    Build an adjacency list of nodes via components (each component connects
    #    its two terminal nodes), then BFS from ground nodes.
    comp_nodes: dict[str, set[int]] = {}
    for cid in comps:
        comp_nodes[cid] = set()
        for t in terms.values():
            if t.componentId == cid:
                comp_nodes[cid].add(terminal_node_map.get(t.id, t.nodeId))

    ground_cid = next((cid for cid, c in comps.items() if c.type == ComponentType.ground), "")
    ground_nodes = comp_nodes.get(ground_cid, set())

    if has_ground and ground_nodes:
        node_adj: dict[int, set[int]] = {}
        all_nodes: set[int] = set()
        for nodes in comp_nodes.values():
            all_nodes.update(nodes)
        for n in all_nodes:
            node_adj[n] = set()
        for cid, nodes in comp_nodes.items():
            if len(nodes) < 2:
                continue
            ns = list(nodes)
            for i in range(len(ns)):
                for j in range(i + 1, len(ns)):
                    node_adj[ns[i]].add(ns[j])
                    node_adj[ns[j]].add(ns[i])

        visited: set[int] = set()
        stack = list(ground_nodes)
        while stack:
            n = stack.pop()
            if n in visited:
                continue
            visited.add(n)
            for nb in node_adj.get(n, []):
                if nb not in visited:
                    stack.append(nb)

        for cid, nodes in comp_nodes.items():
            if comps[cid].type == ComponentType.ground:
                continue
            has_path_to_ground = any(n in visited for n in nodes)
            if not has_path_to_ground:
                errors.append(
                    f"Component '{comps[cid].label or cid}' is not connected to ground."
                )

    # 5. Detect duplicate wires
    wire_pairs: set[tuple[str, str]] = set()
    for w in wires:
        pair = tuple(sorted([w.fromTerminalId, w.toTerminalId]))
        if pair in wire_pairs:
            errors.append(f"Duplicate wire between terminals {pair[0]} and {pair[1]}.")
        wire_pairs.add(pair)

    # 6. Switch validation
    for cid, comp in comps.items():
        if comp.type == ComponentType.switch:
            closed = comp.params.get("isClosed", 0)
            if closed not in (0, 1):
                warnings.append(f"Switch '{comp.label or cid}' has invalid state.")

    return len(errors) == 0, errors, warnings
