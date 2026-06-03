# Technical Decisions — LabCircuitos

## ADR-001: Simulation on backend (NumPy)

**Status:** Active  
**Context:** Team split — Luisa owns Python MNA.  
**Decision:** Frontend sends circuit JSON; backend runs MNA.  
**Consequence:** Network latency per sim tick; future TS engine for offline.

## ADR-002: React Flow for editor MVP

**Status:** Active  
**Context:** Faster delivery than custom Canvas.  
**Decision:** Use reactflow with custom ComponentNode + SVG symbols.  
**Consequence:** Spec Canvas 2D deferred to v2.

## ADR-003: Zustand single store

**Status:** Active (to be split)  
**Decision:** One `circuitStore` for circuit, sim, probes, undo.  
**Consequence:** ~400 LOC file; refactor planned TASK-007.

## ADR-004: Light theme (crema/verde)

**Status:** Active  
**Context:** Josue UI branch; team preference over spec dark theme.  
**Decision:** Tokens in tailwind + docs/TEMA_UI.md.  
**Consequence:** Conflict with acctulizacio.mkd dark palette — needs team ADR.

## ADR-005: Plotly for oscilloscope

**Status:** Active  
**Decision:** react-plotly.js for multichannel plots.  
**Consequence:** Large bundle; mitigated with lazy import + manualChunks.

## ADR-006: ESLint flat config + Prettier

**Status:** Active (2026-06-02)  
**Decision:** eslint.config.js, zero warnings policy for errors.

## ADR-007: Git flow with 3-person approval

**Status:** Active  
**Decision:** feature/* → release/v1.0 → main with unanimous review.

## ADR-008: Backend entry via main.py

**Status:** Active (2026-06-02)  
**Decision:** sys.path bootstrap for `python main.py` from backend/.
