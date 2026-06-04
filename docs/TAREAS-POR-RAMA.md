# Tareas por rama — LabCircuitos

> **Actualizado:** Junio 2026 · Rama base de integración: `feature/josue-ui` (motor TS + UI + docs)

## División de responsabilidades (regla de oro)

| Persona | Rama | Se ocupa **solo** de… | Carpetas principales |
|---------|------|------------------------|----------------------|
| **Luisa** | `feature/luisa-backend` | **Funcionamiento de circuitos simulados** (MNA, validación, elementos, tests, paridad backend↔motor TS) | `backend/**`, `src/engine/**`, `src/services/localSimulation.ts` |
| **Miguel** | `feature/miguel-editor` | **Editor visual** (canvas, cables, componentes, store, atajos) | `src/features/editor/**`, `src/store/**`, `src/utils/circuit.ts` |
| **Josue** | `feature/josue-ui` | **UI, paneles, tema, docs y coordinación** | `src/components/**`, `src/App.tsx`, `docs/**`, `tailwind.config.js` |

> **Simulación:** Luisa es la dueña del comportamiento eléctrico. Josue integra resultados en paneles. Miguel no toca `src/engine/` salvo hooks mínimos acordados.

---

## Estado global (ya hecho en `feature/josue-ui`)

- [x] Motor TS desacoplado (`src/engine/`) — MNA, Union-Find, BFS/DFS, Backward Euler
- [x] Simulación local en cliente (`useSimulation` + `localSimulation.ts`)
- [x] Tema claro + documentación + ESLint/Prettier
- [x] Plotly lazy-load · `fmtV/fmtI` compartidos
- [x] pnpm como gestor oficial (`packageManager`, `pnpm-lock.yaml`)

---

## Luisa — `feature/luisa-backend` (SIMULACIÓN)

### Prioridad P0

| ID | Tarea | Archivos |
|----|-------|----------|
| L-01 | **Tomar ownership de `src/engine/`** — revisar, testear, extender elementos | `src/engine/**` |
| L-02 | Paridad validación Python ↔ TS (mismos errores para mismo circuito) | `backend/validators/`, `src/engine/validation/` |
| L-03 | Alinear `ComponentType` backend con frontend (diode, transistor, potentiometer…) | `backend/models/` |
| L-04 | Unificar resolución de nodos (eliminar duplicación en engine/validator/spice) | `backend/simulation/` |
| L-05 | Tests regresión ampliados | `backend/test_backend.py` |

### Prioridad P1

| ID | Tarea | Archivos |
|----|-------|----------|
| L-06 | Modelo real de **diodo** (no alias a fuente de voltaje) | `src/engine/elements/`, `backend/` |
| L-07 | Modelo **transistor** NPN básico | idem |
| L-08 | **Potenciómetro** como dos resistencias | idem |
| L-09 | Export netlist SPICE desde motor TS | `src/engine/` |
| L-10 | CORS configurable por `.env` | `backend/main.py` |
| L-11 | Documentar ecuaciones MNA en `docs/` | `docs/simulacion-mna.md` |

### Comandos diarios

```bash
git checkout feature/luisa-backend
git pull origin feature/luisa-backend
git merge origin/feature/josue-ui    # traer motor + docs
pnpm install
cd backend && python main.py
pnpm exec tsx src/engine/demo/smokeTest.ts
```

---

## Miguel — `feature/miguel-editor` (EDITOR)

### Prioridad P0

| ID | Tarea | Archivos |
|----|-------|----------|
| M-01 | **NO modificar `src/engine/`** — consumir API de `localSimulation` | `src/hooks/useSimulation.ts` (solo integración) |
| M-02 | Dividir `circuitStore.ts` en slices (circuit / sim / ui) | `src/store/` |
| M-03 | Reducir re-renders en `ComponentNode` durante simulación | `src/features/editor/ComponentNode.tsx` |
| M-04 | Conexión de cables robusta (preview, snap, cancel) | `CircuitEditor.tsx` |

### Prioridad P1

| ID | Tarea | Archivos |
|----|-------|----------|
| M-05 | Atajos teclado (R,C,L,V,I,S,G,W, Delete, Ctrl+Z/Y) | `src/features/editor/` |
| M-06 | Multi-selección con Shift | idem |
| M-07 | Undo/redo de cables | `circuitStore.ts` |
| M-08 | LED visual (brillo según corriente del motor) | `ComponentNode.tsx` + datos sim |
| M-09 | Arrastrar desde toolbar al canvas (drag & drop) | `Toolbar.tsx` + editor |

### Comandos diarios

```bash
git checkout feature/miguel-editor
git pull origin feature/miguel-editor
git merge origin/feature/josue-ui
pnpm install
pnpm dev
```

---

## Josue — `feature/josue-ui` (UI + COORDINACIÓN)

### Prioridad P0

| ID | Tarea | Estado | Archivos |
|----|-------|--------|----------|
| J-01 | Snackbar/toast errores de simulación (mensajes de Luisa/motor) | ✅ | `shared/store/toastStore.ts`, `shared/ui/ToastContainer.tsx`, `useSimulation.ts` |
| J-02 | Mostrar warnings (componentes no modelados aún) | ✅ | `PropertiesPanel.tsx`, `utils/circuitModelInfo.ts` |
| J-03 | Revisar PRs Luisa + Miguel antes de `release/v1.0` | Manual | GitHub |
| J-04 | Mantener `docs/TAREAS-POR-RAMA.md` actualizado | ✅ | `docs/` |

### Prioridad P1

| ID | Tarea | Estado | Archivos |
|----|-------|--------|----------|
| J-05 | Export CSV osciloscopio | ✅ | `GraphPanel.tsx`, `shared/lib/exportOscCsv.ts` |
| J-06 | Tooltips toolbar | ✅ | `Toolbar.tsx`, `core/tooltips.ts` |
| J-07 | FSD fase 1 (`shared/`, `widgets/`) | ✅ | `src/shared/`, `src/widgets/` |
| J-08 | Dividir `CalculatorPage` por tabs | ✅ | `calculator/tabs/` |

### Comandos diarios

```bash
git checkout feature/josue-ui
pnpm install
pnpm dev          # :5174
pnpm lint && pnpm build
```

---

## Integración → `release/v1.0` → `main`

1. Luisa mergea `feature/josue-ui` → trabaja L-01…L-05 → PR a `release/v1.0`
2. Miguel mergea `feature/josue-ui` → trabaja M-02…M-04 → PR a `release/v1.0`
3. Josue mantiene `feature/josue-ui` → J-01…J-04 → PR a `release/v1.0`
4. **Los 3 aprueban** cada PR · Josue hace merge final a `main`

---

## Referencias

- [RESPONSABILIDADES.md](RESPONSABILIDADES.md) — detalle Josue
- [roadmap.md](roadmap.md) — backlog numerado
- [flujo-trabajo.md](flujo-trabajo.md) — Git y PRs
- Motor: `src/engine/index.ts` · Smoke test: `pnpm exec tsx src/engine/demo/smokeTest.ts`
