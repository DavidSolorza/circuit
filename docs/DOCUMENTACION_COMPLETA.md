# Documentación Completa — LabCircuitos

## Simulador de Circuitos Eléctricos Interactivo

---

# 1. INFORMACIÓN DEL PROYECTO

| Campo | Valor |
|---|---|
| Nombre | LabCircuitos |
| Tipo | Simulador de circuitos eléctricos |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Python + FastAPI + PySpice/Ngspice |
| Estado | Funcional con correcciones pendientes |
| Puerto Frontend | `localhost:5173` |
| Puerto Backend | `localhost:8000` |

---

# 2. ESTRUCTURA DEL REPOSITORIO

```
proyectoElectro+/
├── backend/                    # Código del backend Python
│   ├── main.py                 # Servidor FastAPI
│   ├── simulation/
│   │   ├── engine.py           # Motor MNA con numpy
│   │   └── netlist_generator.py
│   ├── validators/
│   │   └── circuit_validator.py # Validador con BFS
│   └── requirements.txt
├── src/                        # Código del frontend React
│   ├── App.tsx                 # Layout principal
│   ├── index.css               # Estilos globales + dark mode
│   ├── components/
│   │   ├── calculator/         # Calculadora de ingeniería
│   │   ├── graph/              # Osciloscopio (Plotly)
│   │   ├── multimeter/         # Multímetro
│   │   ├── properties/         # Panel de propiedades
│   │   ├── status/             # Estado de simulación
│   │   ├── symbols/            # SVGs de componentes
│   │   └── toolbar/            # Barra de herramientas
│   ├── core/
│   │   └── constants.ts        # Constantes y config
│   ├── features/
│   │   └── editor/             # React Flow editor
│   ├── hooks/                  # Custom hooks
│   ├── services/
│   │   └── api.ts              # Llamadas al backend
│   ├── store/
│   │   └── circuitStore.ts     # Estado global (Zustand)
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   └── utils/
├── docs/                       # Documentación
├── dist/                       # Build de producción
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

# 3. RAMAS DE GIT

## 3.1 Convención de Nombres

| Rama | Propósito | Base |
|---|---|---|
| `main` | Rama principal, código estable | — |
| `feature/luis-backend` | Backend + simulación SPICE | `main` |
| `feature/miguel-editor` | Editor + componentes + store | `main` |
| `feature/josue-ui` | UI/UX + paneles + calculadora | `main` |
| `fix/critical-bugs` | Corrección de bugs críticos | `main` |
| `release/v1.0` | Preparación para entrega | `main` |

## 3.2 Reglas de Uso

1. Cada integrante trabaja SOLO en su rama.
2. No hacer merge a `main` sin aprobación del equipo.
3. Los commits deben tener mensajes descriptivos en español.
4. Pull Request obligatorio para mergear a `main`.
5. Antes del Día 4, hacer merge de todas las ramas a `release/v1.0`.

## 3.3 Flujo de Trabajo Diario

```bash
# Inicio del día: actualizar rama propia
git checkout feature/luis-backend   # (o miguel-editor / josue-ui)
git pull origin main                # Traer cambios de main

# Trabajar normalmente
git add .
git commit -m "Descripción clara del cambio"
git push origin feature/luis-backend

# Fin del día: avisar al equipo para revisión
```

## 3.4 Creación de Ramas (ejecutar ahora)

```bash
# Desde main:
git checkout -b feature/luis-backend
git push origin feature/luis-backend

git checkout main
git checkout -b feature/miguel-editor
git push origin feature/miguel-editor

git checkout main
git checkout -b feature/josue-ui
git push origin feature/josue-ui

git checkout main
git checkout -b fix/critical-bugs
git push origin fix/critical-bugs

git checkout main
git checkout -b release/v1.0
git push origin release/v1.0
```

---

# 4. PLAN DE TRABAJO DETALLADO POR PERSONA

---

## 4.1 LUIS — BACKEND + INTEGRACIÓN SPICE

**Rama:** `feature/luis-backend`

### Día 1 — Diagnóstico y reparación del backend

| Hora | Tarea | Archivos | Verificación |
|---|---|---|---|
| 1h | Verificar ngspice instalado | — | `ngspice --version` funciona |
| 1h | Probar endpoint `/api/simulate` | `backend/main.py` | POST con JSON retorna 200 |
| 2h | Corregir ground validator BFS | `backend/validators/circuit_validator.py` | Detecta tierra conectada vía múltiples nodos |
| 1h | Agregar tipos: diodo, transistor | `backend/simulation/engine.py` | Acepta componente type='diode', 'transistor' |

**Comandos útiles:**
```bash
# Activar backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Probar simulación (desde raíz del proyecto)
python test_backend.py

# O con curl:
curl -X POST http://localhost:8000/api/simulate ^
  -H "Content-Type: application/json" ^
  -d @test_circuit.json
```

### Día 2 — Mejoras de simulación

| Tarea | Archivos | Detalle |
|---|---|---|
| Simulación automática al conectar | `backend/main.py` | Endpoint que detecta cambios y re-simula |
| Probar circuito 9V+R+LED | `backend/tests/` | Crear test con circuito conocido |
| Validar `nodeVoltages` arrays | `backend/simulation/engine.py` | Asegurar que los arrays por nodo tengan datos |
| Corregir `branchCurrents` | `backend/simulation/engine.py` | Asegurar que current por componente sea correcto |

### Día 3 — Robustez y rendimiento

| Tarea | Archivos | Detalle |
|---|---|---|
| Pruebas de estrés (10+ componentes) | `backend/tests/stress_test.py` | Generar circuitos grandes |
| Medir tiempos de simulación | `backend/main.py` | Logging de duración |
| Cache de resultados | `backend/main.py` | No re-simular si el circuito no cambió |
| Manejo de errores robusto | `backend/main.py` | Try/except en toda la simulación |

### Día 4 — Cierre

| Tarea | Archivos | Detalle |
|---|---|---|
| Pruebas de regresión | `backend/tests/` | Ejecutar todos los tests |
| Documentación API | `docs/API.md` | Endpoints, request/response ejemplos |
| Merge a `release/v1.0` | — | Pull Request desde `feature/luis-backend` |

---

## 4.2 MIGUEL — EDITOR + COMPONENTES + STORE

**Rama:** `feature/miguel-editor`

### Día 1 — Diagnóstico y corrección del editor

| Hora | Tarea | Archivos | Verificación |
|---|---|---|---|
| 1h | Probar drag de componentes | `src/features/editor/CircuitEditor.tsx` | Arrastrar resistencia se mueve libremente |
| 1h | Corregir `onNodesChange` | `src/features/editor/CircuitEditor.tsx:84-96` | Eliminar filtro `dragging === false` |
| 1h | Verificar handles y conexiones | `src/features/editor/ComponentNode.tsx` | Handles aparecen y son cliqueables |
| 1h | Probar batería terminales +/− | `src/features/editor/ComponentNode.tsx` | Handle izquierdo verde (−), derecho rojo (+) |
| 1h | Verificar `nodeDragThreshold: 0` | `src/features/editor/CircuitEditor.tsx:208` | Drag inicia inmediatamente |

**Archivos clave del editor:**
- `src/features/editor/CircuitEditor.tsx` — Componente principal React Flow
- `src/features/editor/ComponentNode.tsx` — Nodo personalizado por componente
- `src/store/circuitStore.ts` — Estado global (Zustand)
- `src/hooks/useSimulation.ts` — Loop de simulación
- `src/hooks/useCircuit.ts` — Hook de acceso al circuito

### Día 2 — Corrección de funcionalidades

| Tarea | Archivos | Detalle |
|---|---|---|
| Corregir selección múltiple | `src/features/editor/CircuitEditor.tsx` | Shift+click selecciona múltiples |
| Probar undo/redo (Ctrl+Z) | `src/store/circuitStore.ts` | Deshacer/rehacer cambios |
| Verificar rotación y duplicado | `src/components/properties/PropertiesPanel.tsx` | Botones Rotar y Duplicar |
| Probar multi-selección + Delete | `src/App.tsx:100-113` | Eliminar varios componentes |

### Día 3 — Validación completa del editor

| Tarea | Archivos | Detalle |
|---|---|---|
| LED on/off con simulación | `src/features/editor/ComponentNode.tsx:47` | `isLit` depende de `simulationRunning && current > 1e-6` |
| Verificar animación de cables | `src/features/editor/CircuitEditor.tsx:76-81` | Edges tipo `bezier` con `animated: true` |
| Probar todas las herramientas | `src/store/circuitStore.ts` | Select, Wire, Probe |
| Probar circuito demo completo | `src/App.tsx:27-67` | Cargar demo y verificar |

### Día 4 — Cierre

| Tarea | Archivos | Detalle |
|---|---|---|
| Build final | — | `npm run build` sin errores |
| Prueba integración completa | — | Frontend + backend juntos |
| Merge a `release/v1.0` | — | Pull Request |

**Comandos útiles:**
```bash
# Iniciar frontend
cd C:\Users\Usuario\Desktop\proyectoElectro+
npm run dev

# Build de producción
npm run build

# Verificar tipos
npx tsc --noEmit
```

---

## 4.3 JOSUE — UI/UX + PANELES + CALCULADORA

**Rama:** `feature/josue-ui`

### Día 1 — Diagnóstico y verificación de UI

| Hora | Tarea | Archivos | Verificación |
|---|---|---|---|
| 1h | Verificar dark mode global | `src/index.css`, `tailwind.config.js` | Fondos oscuros en toda la app |
| 1h | Probar sidebar y buscador | `src/components/toolbar/Toolbar.tsx` | Buscador filtra categorías |
| 1h | Verificar traducción español | TODOS los archivos .tsx | Sin texto en inglés |
| 1h | Reportar bugs encontrados | — | Issues en GitHub o lista escrita |

**Archivos clave de UI:**
- `src/App.tsx` — Layout principal con top bar, sidebar, canvas, panel derecho, gráficas
- `src/components/toolbar/Toolbar.tsx` — Sidebar con categorías y buscador
- `src/components/status/SimulationStatus.tsx` — LED + estado en top bar
- `src/components/symbols/index.tsx` — Todos los SVGs de componentes
- `src/components/graph/GraphPanel.tsx` — Osciloscopio Plotly
- `src/components/multimeter/MultimeterDisplay.tsx` — Multímetro
- `src/components/properties/PropertiesPanel.tsx` — Panel de propiedades
- `src/components/calculator/CalculatorPage.tsx` — Calculadora de ingeniería

### Día 2 — Mejoras de componentes visuales

| Tarea | Archivos | Detalle |
|---|---|---|
| Rediseñar SVGs restantes | `src/components/symbols/index.tsx` | Diodo, transistor, potenciómetro profesional |
| Probar calculadora (7 tabs) | `src/components/calculator/CalculatorPage.tsx` | Ohm, R, Colores, RC, XL/XC, Conv, Fórmulas |
| Verificar gráficas Plotly | `src/components/graph/GraphPanel.tsx` | Múltiples sondas, zoom, hover |
| Probar panel de propiedades | `src/components/properties/PropertiesPanel.tsx` | Sliders, mediciones, botones |

### Día 3 — Pulido final

| Tarea | Archivos | Detalle |
|---|---|---|
| Pulir layout y espaciado | `src/App.tsx` | Espaciado vertical consistente |
| Agregar micro-animaciones | `src/index.css` | Transiciones suaves en hover/focus |
| Probar calculadora en oscuro | `src/components/calculator/CalculatorPage.tsx` | Fondo surface-900, inputs dark |
| Verificar responsividad | `src/App.tsx` | Funciona en 1366×768 y 1920×1080 |

### Día 4 — Cierre

| Tarea | Archivos | Detalle |
|---|---|---|
| Revisión final UI | TODOS los .tsx | Consistencia visual |
| Preparar presentación | `presentacion.pptx` | Diapositivas del proyecto |
| Merge a `release/v1.0` | — | Pull Request |

---

# 5. CHECKLIST COMPLETO (marcar al completar)

## Backend (Luis)

- [ ] A1 — POST /api/simulate retorna nodeVoltages y branchCurrents
- [ ] A2 — Ground validator con BFS funcional
- [ ] A3 — Circuito 9V+R+LED simula correctamente (9mA esperado)
- [ ] A4 — Errores descriptivos sin crash del servidor
- [ ] A5 — Simulación de 10+ componentes en <2 segundos
- [ ] A6 — Netlist SPICE bien formada
- [ ] A7 — Backend arranca con `python main.py`

## Editor (Miguel)

- [ ] B1 — Todos los componentes se arrastran libremente
- [ ] B2 — Cables con curvas suaves desde handles reales
- [ ] B3 — Batería con terminal + rojo y − verde
- [ ] B4 — LED se apaga al pausar, enciende al reanudar
- [ ] B5 — Click selecciona, Delete elimina, Shift multi-selección
- [ ] B6 — Ctrl+Z deshace, Ctrl+Shift+Z rehace
- [ ] B7 — Rotar y Duplicar funcionan
- [ ] B8 — Herramientas Select, Wire, Probe funcionales
- [ ] B9 — `npm run build` sin errores

## UI/UX (Josue)

- [ ] C1 — Dark mode en TODA la aplicación
- [ ] C2 — Sidebar con categorías + buscador
- [ ] C3 — Barra superior con botones y estado
- [ ] C4 — Multímetro con V/I/P en tiempo real
- [ ] C5 — Propiedades con sliders y mediciones
- [ ] C6 — Osciloscopio Plotly funcional
- [ ] C7 — Calculadora con 7 tabs funcionando
- [ ] C8 — 100% traducido al español
- [ ] C9 — SVGs profesionales con terminales

---

# 6. PRUEBAS DE VALIDACIÓN FINAL

Ejecutar en orden antes de la entrega:

### 6.1 Backend
```bash
cd backend
python main.py
# En otra terminal:
python test_backend.py
```

### 6.2 Frontend (build)
```bash
npm run build
# Debe terminar con: "✓ built in X.Xm"
```

### 6.3 Prueba manual completa
1. Abrir `localhost:5173`
2. Click "Cargar circuito demo"
3. Arrastrar cada componente (deben moverse)
4. Pasar mouse sobre handles (deben aparecer puntos)
5. Click "INICIAR" (LED debe encenderse)
6. Click "DETENER" (LED debe apagarse)
7. Abrir calculadora → tab Ohm → probar 9V, 0.011A, 818Ω
8. Verificar gráficas con datos reales
9. Abrir panel Propiedades → rotar, duplicar, eliminar

### 6.4 Sin errores de consola
```bash
# Abrir Chrome DevTools (F12) → pestaña Console
# No debe mostrar errores rojos
```

---

# 7. CRITERIOS DE EVALUACIÓN

| Criterio | Puntos | Cómo se evalúa |
|---|---|---|
| Simulación funcional | 25 | Circuito demo simula correctamente, LED enciende |
| Interfaz profesional | 20 | Dark mode, SVGs, layout limpio |
| Todas las herramientas funcionan | 15 | Select, Wire, Probe, Drag, Delete |
| Calculadora completa | 10 | 7 tabs funcionales |
| Gráficas con datos reales | 10 | Plotly muestra señales de simulación |
| Código sin errores | 10 | Build exitoso, sin errores TS |
| Documentación | 5 | README, plan de trabajo, documentación |
| Trabajo en equipo | 5 | Commits en ramas separadas, merges ordenados |

**Puntaje máximo: 100 puntos**

---

# 8. COMANDOS RÁPIDOS

```bash
# Iniciar backend
cd backend && python main.py

# Iniciar frontend (otra terminal)
npm run dev

# Build producción
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit

# Estado de git
git status
git log --oneline --graph --all

# Cambiar de rama
git checkout feature/luis-backend

# Traer cambios de main
git pull origin main

# Subir cambios
git push origin feature/luis-backend
```

---

*Documento generado el \today para el Proyecto LabCircuitos*
*3 Integrantes: Luis (Backend), Miguel (Editor), Josue (UI/UX)*
