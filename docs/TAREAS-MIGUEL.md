# Miguel — Editor de circuitos

**Rama:** `feature/miguel-editor`  
**Enfoque exclusivo:** canvas, componentes, cables, store y UX de edición.

## Tu territorio

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

- `src/engine/**` → **Luisa** (simulación)
- `backend/**` → Luisa
- `src/components/**` → Josue (salvo Handles en ComponentNode acordado)

## Integración con simulación

La simulación ya corre en el cliente. Solo consume:

```typescript
import { runLocalSimulationStep } from '../services/localSimulation';
```

No reimplementes MNA ni modifiques matrices.

## Checklist semanal

- [ ] Drag, rotate, wire, undo funcionan
- [ ] Sin regresiones al mergear `feature/josue-ui`
- [ ] `pnpm dev` + simular circuito RC simple
- [ ] Push diario a `feature/miguel-editor`

## Tareas detalladas

Ver [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md) sección **Miguel** (M-01 … M-09).

## Sincronizar

```bash
git checkout feature/miguel-editor
git fetch origin
git merge origin/feature/josue-ui
pnpm install
pnpm dev
```
