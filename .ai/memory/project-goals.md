# Project Goals — LabCircuitos

## Current Phase (v0.2)

- Complete technical audit and documentation (acctulizacio.mkd)
- ESLint + Prettier + quality scripts
- UI polish on light theme
- Prepare integration to release/v1.0 → main

## Short-term (Sprint 1–2)

- Lazy-load Plotly, reduce bundle
- FSD migration phase 1 (widgets/shared)
- Split circuitStore into modules
- React 19 upgrade
- Merge team branches to release/v1.0

## Medium-term (Sprint 3–4)

- TypeScript MNA engine (engine/ folder)
- Reduce HTTP polling during simulation
- Keyboard shortcuts (R,C,L,V,…)
- Automated tests (Vitest + backend)
- v1.0 release on main

## Long-term Vision

- Canvas 2D renderer (replace React Flow)
- Full element polymorphism (BaseElement.stamp)
- Offline simulation without backend
- Export CSV, simulation history
- Optional dark industrial theme (spec)

## Non-Goals

- Auth / multi-tenant
- Mobile native apps
- Payment features
