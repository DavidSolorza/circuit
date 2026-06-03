# Estructura del proyecto

## Árbol actual (2026-06-02)

```
proyectoElectro+/
├── backend/                    # API FastAPI + motor MNA Python
│   ├── api/routes.py
│   ├── simulation/engine.py
│   ├── validators/circuit_validator.py
│   ├── models/
│   ├── spice/builder.py
│   └── main.py
├── src/                        # Frontend React
│   ├── App.tsx                 # Layout principal
│   ├── main.tsx
│   ├── index.css
│   ├── components/             # UI por dominio visual
│   │   ├── toolbar/
│   │   ├── properties/
│   │   ├── multimeter/
│   │   ├── graph/
│   │   ├── calculator/
│   │   ├── status/
│   │   └── symbols/
│   ├── features/editor/        # React Flow canvas
│   ├── engine/                 # Motor MNA TS (Luisa) — implementado
│   ├── hooks/
│   ├── store/circuitStore.ts
│   ├── services/api.ts
│   ├── services/localSimulation.ts
│   ├── core/constants.ts
│   ├── types/
│   └── utils/
├── docs/                       # Documentación del equipo
│   ├── TAREAS-POR-RAMA.md      # División de trabajo
│   ├── DOCUMENTACION_COMPLETA.md
│   └── …
├── test_backend.py
├── eslint.config.js
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Árbol objetivo (FSD + engine)

Migración **incremental** — no reescribir de golpe.

```
src/
├── app/
│   ├── providers/
│   ├── styles/
│   └── index.tsx               # entry re-export
├── pages/
│   └── circuit-simulator/
│       └── ui/CircuitSimulatorPage.tsx
├── widgets/
│   ├── top-bar/
│   ├── tool-sidebar/           ← Toolbar
│   ├── properties-panel/
│   ├── plot-bar/               ← GraphPanel
│   └── status-bar/             ← SimulationStatus
├── features/
│   ├── element-placement/
│   ├── wire-placement/
│   ├── selection/
│   ├── deletion/
│   ├── simulation-controls/    ← useSimulation + INICIAR
│   ├── plot-management/        ← probes, clear
│   └── circuit-persistence/    ← import/export/localStorage
├── entities/
│   ├── circuit/                ← types CircuitState, utils
│   ├── element/                ← symbols, templates
│   ├── wire/
│   ├── node/
│   └── plot/
├── shared/
│   ├── ui/                     ← botones, cards, tokens
│   ├── lib/                    ← formatElectrical, id, snapToGrid
│   ├── api/                    ← axios client
│   ├── config/                 ← constants, env
│   └── types/
└── engine/                     # SIN imports de React
    ├── core/
    │   ├── CircuitGraph.ts
    │   ├── SimulationEngine.ts
    │   └── ElementRegistry.ts
    ├── solvers/
    │   ├── BaseSolver.ts
    │   └── TransientMNASolver.ts
    ├── elements/
    │   ├── BaseElement.ts
    │   ├── Resistor.ts
    │   └── ...
    ├── math/
    │   ├── Matrix.ts
    │   └── GaussianElimination.ts
    ├── graph/
    │   ├── UnionFind.ts
    │   └── NodeResolver.ts
    └── rendering/              # Fase Canvas (futuro)
        ├── CanvasRenderer.ts
        └── ...
```

---

## Mapeo archivo actual → destino FSD

| Actual | Destino FSD | Capa |
|--------|-------------|------|
| `src/App.tsx` | `pages/circuit-simulator/ui/` + widgets | pages/widgets |
| `src/components/toolbar/Toolbar.tsx` | `widgets/tool-sidebar/ui/` | widgets |
| `src/components/properties/PropertiesPanel.tsx` | `widgets/properties-panel/ui/` | widgets |
| `src/components/graph/GraphPanel.tsx` | `widgets/plot-bar/ui/` | widgets |
| `src/components/status/SimulationStatus.tsx` | `widgets/status-bar/ui/` | widgets |
| `src/features/editor/*` | `features/element-placement` + `wire-placement` | features |
| `src/store/circuitStore.ts` | `entities/circuit/model/store.ts` | entities |
| `src/hooks/useSimulation.ts` | `features/simulation-controls/model/` | features |
| `src/hooks/useCircuitPersistence.ts` | `features/circuit-persistence/model/` | features |
| `src/services/api.ts` | `shared/api/` | shared |
| `src/core/constants.ts` | `shared/config/` | shared |
| `src/types/index.ts` | `shared/types/` + `entities/*/model` | shared/entities |
| `src/utils/circuit.ts` | `entities/circuit/lib/` | entities |
| `src/components/symbols/index.tsx` | `entities/element/ui/` | entities |

---

## Convenciones de nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes React | PascalCase | `PropertiesPanel.tsx` |
| Hooks | camelCase `use*` | `useSimulation.ts` |
| Store | `*Store` | `circuitStore.ts` |
| Tipos | PascalCase interfaces | `CircuitComponent` |
| Archivos FSD segment | kebab-case carpetas | `simulation-controls/` |
| Commits | Español descriptivo | `Corrige validador BFS` |

---

## Límites de tamaño (regla del proyecto)

- **Máximo ~400 líneas por archivo** (spec `acctulizacio.mkd`)
- Archivos actuales que exceden o están cerca:
  - `src/App.tsx` (~428)
  - `src/components/calculator/CalculatorPage.tsx` (~375+)
  - `src/store/circuitStore.ts` (~400)
  - `backend/simulation/engine.py` (~353)

---

## Backend

```
backend/
├── main.py              # FastAPI app + CORS
├── api/routes.py        # Endpoints REST
├── models/              # Pydantic DTOs
├── simulation/engine.py # MNA NumPy
├── validators/          # Reglas de circuito
└── spice/builder.py     # Netlist SPICE
```

Ejecutar desde raíz o desde `backend/`:

```bash
# Opción A (recomendada documentación)
cd backend && python main.py

# Opción B
python -m uvicorn backend.main:app --reload --port 8000
```

---

## Documentación relacionada

- `docs/arquitectura.md` — diagramas y flujos
- `docs/TEMA_UI.md` — tokens visuales actuales
- `docs/INFORME-AUDITORIA.md` — deuda técnica
