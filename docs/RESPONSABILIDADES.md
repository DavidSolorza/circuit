# Miguel — Editor de circuitos

**Rama:** `feature/miguel-editor`

> **Tareas detalladas:** [TAREAS-MIGUEL.md](TAREAS-MIGUEL.md) · [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md)

---

## ¿Qué hago yo?

Eres el responsable del **editor visual**: canvas React Flow, componentes, cables, store Zustand y UX de edición.

**No tocas la simulación eléctrica** — eso es de Luisa (`src/engine/`).

## Tecnologías que usas

- **React 18 + TypeScript**
- **React Flow** — nodos, edges, handles
- **Zustand** — estado del circuito

## Archivos que te corresponden

```
src/features/editor/
├── CircuitEditor.tsx
└── ComponentNode.tsx

src/store/circuitStore.ts
src/utils/circuit.ts
src/utils/componentHandles.ts
src/hooks/useCircuit.ts
```

## NO tocar

- `src/engine/**` → Luisa
- `backend/**` → Luisa
- `src/components/**` → Josue (salvo Handles acordados en ComponentNode)

## Simulación

La simulación corre en el cliente. Solo consume:

```typescript
import { runLocalSimulationStep } from '../services/localSimulation';
```

No reimplementes MNA.

## Cómo empezar

```bash
git checkout feature/miguel-editor
git pull origin feature/miguel-editor
pnpm install
pnpm dev          # http://localhost:5174
```

## Prioridades (P0)

| ID | Tarea |
|----|-------|
| M-02 | Dividir `circuitStore.ts` en slices |
| M-03 | Reducir re-renders en `ComponentNode` |
| M-04 | Conexión de cables robusta |
| M-05 | Atajos teclado (R,C,L,V,I,S,G,W…) |

## Reglas

1. Trabaja SOLO en `feature/miguel-editor`
2. NUNCA push directo a `main`
3. PR a `release/v1.0` con aprobación de los 3

## Dependencias

- **Luisa** — resultados de simulación correctos
- **Josue** — SVGs en `symbols/`; coordina cambios visuales
