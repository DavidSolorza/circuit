# Current Architecture — LabCircuitos

## Pattern

Client-server SPA:

- **Frontend:** React monolith in `src/` with Zustand store
- **Backend:** FastAPI service with NumPy MNA

## Key modules

| Module | Path | Role |
|--------|------|------|
| Layout | `src/App.tsx` | Shell, panels, demo loader |
| Editor | `src/features/editor/` | React Flow canvas |
| Store | `src/store/circuitStore.ts` | Circuit + sim state |
| Simulation hook | `src/hooks/useSimulation.ts` | HTTP loop to backend |
| API | `src/services/api.ts` | Axios client |
| MNA engine | `backend/simulation/engine.py` | Matrix build + solve |
| Validator | `backend/validators/circuit_validator.py` | Ground, wires |

## Data flow

User action → Zustand → (on simulate) → POST /api/simulate → engine → results → UI

## Migration target

Feature-Sliced Design + `src/engine/` independent of React. See docs/arquitectura.md.

## Branch ownership

- Luisa: backend/
- Miguel: editor + store + future engine/
- Josue: components/ + docs/ + App layout
