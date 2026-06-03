# Documentación Completa — LabCircuitos

Simulador de circuitos eléctricos interactivo con **tema claro profesional** (crema, verde bosque y dorado). Ver `docs/TEMA_UI.md`.

---

## 1. Información del Proyecto

| Campo           | Valor                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------- |
| Nombre          | LabCircuitos                                                                                |
| Stack Frontend  | React 18 + TypeScript + Vite + Tailwind CSS + React Flow + Zustand + Framer Motion + Plotly |
| Stack Backend   | Python + FastAPI + Numpy + PySpice/Ngspice                                                  |
| Puerto Frontend | `localhost:5174`                                                                            |
| Puerto Backend  | `localhost:8000` (opcional; simulación principal en cliente)                                |
| Package Manager | **pnpm** (no usar npm)                                                                      |
| Build           | 274 módulos, 0 errores TS, 0 errores Vite                                                   |
| Tareas equipo   | Ver `docs/TAREAS-POR-RAMA.md`                                                               |

---

## 2. Integrantes del Equipo

| Persona    | Rama                    | Rol Principal                                                                 |
| ---------- | ----------------------- | ----------------------------------------------------------------------------- |
| **Luisa**  | `feature/luisa-backend` | **Simulación eléctrica** — `src/engine/`, backend MNA, validación, tests      |
| **Miguel** | `feature/miguel-editor` | **Editor** — React Flow, store, cables, atajos (no toca `src/engine/`)        |
| **Josue**  | `feature/josue-ui`      | **UI/UX**, paneles, calculadora, docs, coordinación del equipo                |

> **Documentación de tareas por persona:** [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md) · [TAREAS-LUISA.md](TAREAS-LUISA.md) · [TAREAS-MIGUEL.md](TAREAS-MIGUEL.md) · [TAREAS-JOSUE.md](TAREAS-JOSUE.md)

> Josue coordina la calidad del proyecto: revisa PRs, mantiene docs y propone mejoras. Las decisiones de merge se toman entre los 3.

---

## 3. REGLAS OBLIGATORIAS — LEER ANTES DE EMPEZAR

### 3.1 Regla de Oro: NADA a `main` sin acuerdo unánime

```
┌─────────────────────────────────────────────────────────┐
│  NINGÚN merge a main sin que las 3 personas            │
│  hayan revisado y aprobado explícitamente.             │
│                                                         │
│  Flujo correcto:                                        │
│  1. Cada uno trabaja en SU rama                         │
│  2. Al terminar una funcionalidad → PR a release/v1.0   │
│  3. El equipo revisa entre todos, Josue coordina        │
│  4. Solo cuando los 3 dicen "OK" → merge a main         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Reglas de Git

1. Cada integrante trabaja **SOLO en su rama**. Nunca commitees en otra rama.
2. **Nunca hacer `git push origin main`** directamente. Solo se mergea vía Pull Request con aprobación de los 3.
3. Mensajes de commit en **español**, descriptivos. Ejemplo bueno: `"Corrige validador BFS para detectar tierra en circuitos paralelos"`.
4. Pull Request obligatorio para mergear a `release/v1.0` o `main`.
5. Antes del Día 4, todas las ramas se mergean a `release/v1.0` para pruebas de integración.

### 3.3 Flujo de Trabajo Diario

```bash
# INICIO DEL DÍA — actualizar rama propia
git checkout feature/josue-ui        # (o luisa-backend / miguel-editor)
git pull origin main                 # Traer últimos cambios estables

# TRABAJAR — commits frecuentes y pequeños
git add .
git commit -m "Descripción clara del cambio en español"
git push origin feature/josue-ui

# FIN DEL DÍA — avisar al equipo en el grupo

# CUANDO TERMINAS UNA FUNCIONALIDAD — crear PR a release/v1.0
# (esto lo hace desde GitHub web o cli)
```

### 3.4 Josue — Coordinación del equipo

Josue tiene estas responsabilidades adicionales:

- Revisar que la lógica del backend (Luisa) tenga coherencia con el frontend
- Verificar que las nuevas implementaciones no rompan funcionalidad existente
- Coordinar las revisiones de Pull Requests hacia `release/v1.0` y `main`
- Detectar bugs y asignarlos a `fix/critical-bugs`
- Proponer mejoras de funcionalidad y usabilidad
- Mantener la documentación actualizada
- Asegurar que el build (`pnpm build`) pase sin errores antes de cualquier merge

### 3.5 Ejemplo Concreto: Ciclo Completo de una Funcionalidad

Este ejemplo muestra cómo una tarea viaja desde que se empieza hasta que llega a `main`:

**Ejemplo: Luisa agrega un nuevo componente "Transformador" al backend**

```
DÍA 1 — Luisa trabaja en su rama
  feature/luisa-backend$ git add .
  feature/luisa-backend$ git commit -m "Agrega modelo de transformador al engine MNA"
  feature/luisa-backend$ git push origin feature/luisa-backend

DÍA 1 — Luisa termina y crea Pull Request
  → Va a GitHub.com → Pull Requests → New PR
  → base: release/v1.0  ←  compare: feature/luisa-backend
  → Título: "Agrega transformador al backend MNA"
  → Asigna revisores: Josue y Miguel

DÍA 2 — Josue revisa el PR
  → Ve el código en GitHub, revisa que la lógica sea correcta
  → Prueba local: git checkout feature/luisa-backend, python test_backend.py
  → Comenta si hay cambios o aprueba

DÍA 2 — Miguel también revisa
  → Revisa que los cambios no rompan el frontend
  → Prueba que el editor funcione con el nuevo componente

DÍA 2 — Aprobación
  → Josue: "Apruebo" | Miguel: "Apruebo" | Luisa: "Listo"
  → SOLO AHORA se mergea el PR a release/v1.0

DÍA 4 — Merge a main (último día)
  → Se hace PR desde release/v1.0 → main
  → Los 3 revisan y aprueban
  → Josue hace clic en "Merge pull request"
  → Listo, el código está en main
```

**Regla clave:** Si alguien dice "no" o pide cambios, NO se mergea hasta que esté resuelto.

### 3.6 Qué hacer en cada etapa (resumen en tabla)

| Etapa               | Quién               | Acción                           |
| ------------------- | ------------------- | -------------------------------- |
| Trabajar            | Cada uno            | Commits en su rama, push diario  |
| Funcionalidad lista | El que terminó      | Crea PR a `release/v1.0`         |
| Revisar             | Josue + los otros 2 | Revisan código, prueban          |
| Aprobar             | Los 3               | Dan su "OK" en el PR             |
| Mergear a release   | Josue               | Hace merge del PR                |
| Probar integración  | Los 3               | Prueban todo junto               |
| Merge a main        | Josue               | PR desde `release/v1.0` → `main` |

---

## 4. Estructura del Repositorio

```
proyectoElectro+/
├── backend/
│   ├── main.py                       # Servidor FastAPI
│   ├── api/routes.py                 # Endpoints REST
│   ├── models/circuit.py             # Modelos de datos
│   ├── simulation/engine.py          # Motor MNA con numpy
│   ├── spice/builder.py              # Generador netlist SPICE
│   ├── validators/circuit_validator.py  # Validador BFS
│   └── requirements.txt
├── src/
│   ├── App.tsx                       # Layout principal
│   ├── index.css                     # Tema claro + estilos globales
│   ├── components/
│   │   ├── calculator/CalculatorPage.tsx   # 7 tabs
│   │   ├── graph/GraphPanel.tsx            # Plotly osciloscopio
│   │   ├── multimeter/MultimeterDisplay.tsx
│   │   ├── properties/PropertiesPanel.tsx  # Sliders + mediciones
│   │   ├── status/SimulationStatus.tsx     # LED estado
│   │   ├── symbols/index.tsx               # SVGs (13 comps)
│   │   └── toolbar/Toolbar.tsx             # Sidebar categorías
│   ├── core/constants.ts             # Configuración
│   ├── features/editor/
│   │   ├── CircuitEditor.tsx         # ReactFlow canvas
│   │   └── ComponentNode.tsx         # Nodo personalizado
│   ├── hooks/useSimulation.ts        # Loop de simulación
│   ├── store/circuitStore.ts         # Estado global Zustand
│   ├── types/index.ts                # Tipos TypeScript
│   └── utils/componentHandles.ts     # Handles por componente
├── docs/
│   ├── DOCUMENTACION_COMPLETA.md     # Este documento
│   ├── TEMA_UI.md                    # Paleta y convenciones tema claro
│   ├── RESPONSABILIDADES.md          # Guía por integrante
│   ├── class-diagram.puml            # Diagrama UML clases
│   └── design-diagram.puml           # Diagrama de arquitectura
├── test_backend.py                   # Test de backend
├── plan_trabajo.tex                  # Plan LaTeX
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 5. PLAN DE TRABAJO POR PERSONA Y DÍA

---

### 5.1 LUIS — Simulación de circuitos (backend + motor TS)

**Rama:** `feature/luisa-backend`  
**Guía detallada:** [TAREAS-LUISA.md](TAREAS-LUISA.md)

**Archivos que le corresponden:**

- `backend/` (main.py, api/, models/, simulation/, spice/, validators/)
- `src/engine/` — motor MNA TypeScript (ownership Luisa)
- `src/services/localSimulation.ts` — contrato UI ↔ motor
- `test_backend.py`

**Prioridades actuales (P0):**

| ID | Tarea |
|----|-------|
| L-01 | Tomar ownership de `src/engine/` — revisar y extender |
| L-02 | Paridad validación Python ↔ TypeScript |
| L-03 | Alinear `ComponentType` backend con frontend |
| L-04 | Unificar resolución de nodos en backend |
| L-05 | Tests regresión ampliados |

**Verificación diaria:**

```bash
pnpm exec tsx src/engine/demo/smokeTest.ts
cd backend && python test_backend.py
```

---

### 5.2 MIGUEL — Editor + Store

**Rama:** `feature/miguel-editor`  
**Guía detallada:** [TAREAS-MIGUEL.md](TAREAS-MIGUEL.md)

**Archivos que le corresponden:**

- `src/features/editor/CircuitEditor.tsx`
- `src/features/editor/ComponentNode.tsx`
- `src/store/circuitStore.ts`
- `src/hooks/useCircuit.ts`
- `src/utils/circuit.ts`, `src/utils/componentHandles.ts`

**NO tocar:** `src/engine/**` (simulación = Luisa)

**Prioridades actuales (P0):**

| ID | Tarea |
|----|-------|
| M-02 | Dividir `circuitStore.ts` en slices |
| M-03 | Reducir re-renders en `ComponentNode` durante simulación |
| M-04 | Conexión de cables robusta |
| M-05 | Atajos teclado (R,C,L,V,I,S,G,W, Delete, Ctrl+Z/Y) |

---

### 5.3 JOSUE — UI/UX + Coordinación

**Rama:** `feature/josue-ui`  
**Guía detallada:** [TAREAS-JOSUE.md](TAREAS-JOSUE.md)
**Archivos que le corresponden:**

- `src/index.css` + `tailwind.config.js` — Estilos globales
- `src/App.tsx` — Layout general (top bar, panel derecho, gráficas)
- `src/components/toolbar/Toolbar.tsx` — Sidebar + buscador
- `src/components/status/SimulationStatus.tsx` — LED estado
- `src/components/symbols/index.tsx` — SVGs de componentes
- `src/components/multimeter/MultimeterDisplay.tsx` — Multímetro
- `src/components/properties/PropertiesPanel.tsx` — Panel propiedades
- `src/components/graph/GraphPanel.tsx` — Osciloscopio Plotly
- `src/components/calculator/CalculatorPage.tsx` — Calculadora 7 tabs
- `docs/` — Documentación

**Además, coordina y revisa:**

- Revisar PRs de Luisa y Miguel antes del merge
- Probar la aplicación completa después de cada cambio importante
- Mantener este documento actualizado
- Proponer mejoras y nuevas funcionalidades

#### Día 1 — Diagnóstico y verificación de UI

| Hora | Tarea                             | Archivos                          | Verificación                                     |
| ---- | --------------------------------- | --------------------------------- | ------------------------------------------------ |
| 1h   | Verificar tema claro global       | `index.css`, `tailwind.config.js` | Fondos crema, texto ink, sin zonas oscuras       |
| 1h   | Probar sidebar + buscador         | `Toolbar.tsx`                     | Buscador filtra, categorías funcionales          |
| 1h   | Verificar traducción 100% español | TODOS los .tsx                    | Sin inglés visible                               |
| 1h   | Reportar bugs al equipo           | —                                 | Issues escritos, asignados a `fix/critical-bugs` |

#### Día 2 — Mejoras visuales y funcionales

| Tarea                     | Archivos              | Detalle                                                    |
| ------------------------- | --------------------- | ---------------------------------------------------------- |
| Rediseñar SVGs restantes  | `symbols/index.tsx`   | Diodo, transistor, potenciómetro profesionales             |
| Probar calculadora 7 tabs | `CalculatorPage.tsx`  | Ohm, R, Colores, RC, XL/XC, Conv, Fórmulas                 |
| Verificar gráficas Plotly | `GraphPanel.tsx`      | Múltiples sondas, zoom, hover, limpiar                     |
| Probar panel propiedades  | `PropertiesPanel.tsx` | Sliders, mediciones, botones Rotar/Duplicar/Sonda/Eliminar |
| Revisar coherencia lógica | `App.tsx`, store      | Que los datos fluyan correctamente                         |

#### Día 3 — Nuevas implementaciones + supervisión

| Tarea                              | Archivos               | Detalle                                                           |
| ---------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| Revisar PR de Luisa (backend)      | `backend/`             | Revisar código, probar endpoint                                   |
| Revisar PR de Miguel (editor)      | `src/features/editor/` | Probar drag, conexiones, LED                                      |
| Proponer/implementar nueva feature | —                      | Ej: historial de simulaciones, exportar CSV de gráficas, tooltips |
| Pulir layout y espaciado           | `App.tsx`              | Consistencia vertical/horizontal                                  |
| Agregar micro-animaciones          | `index.css`            | Transiciones suaves hover/focus                                   |

**Ideas de nuevas implementaciones (preguntar al equipo antes):**

- Exportar datos de gráficas a CSV
- Tooltips explicativos en cada componente
- Historial de últimas 5 simulaciones
- Panel de "estadísticas" con total de componentes, nodos, conexiones
- Snackbar/notificaciones para errores de simulación

#### Día 4 — Cierre y calidad final

| Tarea                                  | Archivos            | Detalle                        |
| -------------------------------------- | ------------------- | ------------------------------ |
| Revisión final UI completa             | TODOS los .tsx      | Consistencia visual tema claro |
| Ejecutar `pnpm build`                  | —                   | 0 errores                      |
| Prueba manual completa (ver sección 7) | —                   | Checklist de 10 pasos          |
| Aprobar merge final a `release/v1.0`   | —                   | Solo cuando los 3 digan OK     |
| Preparar presentación                  | `presentacion.pptx` | Diapositivas del proyecto      |
| Merge a `main` (último paso del Día 4) | —                   | Aprobación de los 3            |

---

## 6. Checklist Completo

### Backend + motor TS (Luisa)

- [ ] L-01 — Ownership de `src/engine/` verificado
- [ ] L-02 — Paridad validación Python ↔ TS
- [ ] L-03 — Tipos backend alineados con frontend
- [ ] L-04 — Resolución de nodos unificada en backend
- [ ] L-05 — `pnpm exec tsx src/engine/demo/smokeTest.ts` + `test_backend.py` OK

### Editor (Miguel)

- [ ] B1 — Todos los componentes se arrastran libremente
- [ ] B2 — Cables bezier animados desde handles reales
- [ ] B3 — Batería: terminal + rojo, terminal − verde
- [ ] B4 — LED se apaga al pausar, enciende al reanudar
- [ ] B5 — Click selecciona, Delete elimina, Shift multi-selección
- [ ] B6 — Ctrl+Z deshace, Ctrl+Shift+Z rehace
- [ ] B7 — Rotar y Duplicar funcionan en el panel
- [ ] B8 — Herramientas Select, Wire, Probe funcionales
- [ ] B9 — `pnpm build` sin errores

### UI/UX + Supervisión (Josue)

- [ ] C1 — Tema claro consistente en TODA la aplicación (sin excepciones)
- [ ] C2 — Sidebar con categorías + buscador funcional
- [ ] C3 — Barra superior compacta con botones + estado
- [ ] C4 — Multímetro con V/I/P en tiempo real
- [ ] C5 — Panel propiedades con sliders + mediciones
- [ ] C6 — Osciloscopio Plotly con datos reales
- [ ] C7 — Calculadora con 7 tabs funcionando
- [ ] C8 — 100% traducido al español
- [ ] C9 — SVGs profesionales con terminales visibles
- [ ] C10 — PR de Luisa revisado y aprobado
- [ ] C11 — PR de Miguel revisado y aprobado
- [ ] C12 — Build final verificado sin errores
- [ ] C13 — Prueba manual completa pasada
- [ ] C14 — Documentación actualizada

---

## 7. Prueba de Validación Manual (Josue ejecuta)

Ejecutar en orden ANTES del merge a `main`:

1. Abrir `http://localhost:5174`
2. Hacer clic en **"Cargar circuito demo"**
3. Arrastrar cada tipo de componente (deben moverse suavemente)
4. Pasar mouse sobre los terminales de un componente (deben aparecer puntos)
5. Hacer clic en **INICIAR** (el LED debe encenderse con glow amarillo)
6. Hacer clic en **DETENER** (el LED debe apagarse inmediatamente)
7. Abrir la **Calculadora** (icono en top bar) → tab Ohm → probar V=9, I=0.011 → R debe dar ~818Ω
8. Ir a **Gráficas** (panel inferior) — deben mostrar líneas con datos reales
9. Panel derecho **Propiedades** → seleccionar batería → mover slider de voltaje → rotar → duplicar → eliminar
10. Abrir Chrome DevTools (F12) → Console → **0 errores rojos**

---

## 8. Criterios de Evaluación (100 pts)

| Criterio               | Pts | Cómo se evalúa                             |
| ---------------------- | --- | ------------------------------------------ |
| Simulación funcional   | 25  | Circuito demo simula, LED enciende         |
| Interfaz profesional   | 20  | Tema claro, SVGs, layout limpio            |
| Herramientas completas | 15  | Select, Wire, Probe, Drag, Delete          |
| Calculadora completa   | 10  | 7 tabs funcionales                         |
| Gráficas con datos     | 10  | Plotly con señales reales                  |
| Sin errores de build   | 10  | Build 0 errores TS + Vite                  |
| Trabajo en equipo      | 5   | Ramas separadas, commits, merges ordenados |
| Documentación          | 5   | README, docs, plan de trabajo              |

---

## 9. Comandos Rápidos

```bash
# Backend
cd backend && python main.py

# Frontend (otra terminal)
pnpm dev

# Build producción
pnpm build

# Verificar tipos
pnpm tsc --noEmit

# Estado de git
git status
git log --oneline --graph --all

# Cambiar de rama
git checkout feature/josue-ui

# Traer cambios de main
git pull origin main

# Subir cambios
git push origin feature/josue-ui
```

---

## 10. Notas Importantes

- **LED bug corregido:** El LED se apaga al pausar y enciende al reanudar. Depende de `simulationRunning && current > 1e-6`.
- **Drag corregido:** `nodesDraggable: true`, `nodeDragThreshold: 0`, `onNodesChange` sin filtro de dragging.
- **Batería:** Terminal rojo (+) es source handle (posición derecha), terminal verde (−) es target handle (posición izquierda).
- **Cables:** Tipo `bezier` con `MarkerType.ArrowClosed` y `animated: true`.
- **Tema claro:** Tokens en `tailwind.config.js` (`surface`, `primary`, `gold`, `ink`) y guía en `docs/TEMA_UI.md`. Sin modo oscuro.
- **Simulación local:** `useSimulation` usa `src/engine/` vía `localSimulation.ts` (~60 FPS, sin HTTP por tick).
- **Backend opcional:** API Python sigue disponible para validación/export SPICE.
- **Build actual:** 274 módulos, bundle principal ~237 KB (+ Plotly lazy).
- **Gestor de paquetes:** solo `pnpm` — ver README.

---

_3 Integrantes: Luisa (Simulación), Miguel (Editor), Josue (UI/UX + Coordinación)_
