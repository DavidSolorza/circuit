# Miguel — Editor + Componentes + Store

**Rama:** `feature/miguel-editor`

---

## ¿Qué hago yo?

Tu eres el encargado del corazón del simulador: el editor visual donde se arrastran componentes, se conectan cables y se ejecuta la simulación. Sin tu trabajo, nadie puede armar circuitos.

## Tecnologías que usas

- **React 18 + TypeScript** — Framework de UI
- **React Flow** — Librería de canvas interactivo con nodos y edges
- **Zustand** — Estado global de la aplicación
- **Framer Motion** — Animaciones

## Archivos que te corresponden

```
src/features/editor/
├── CircuitEditor.tsx         # Canvas principal con React Flow
└── ComponentNode.tsx         # Nodo personalizado por tipo de componente

src/store/
└── circuitStore.ts           # Estado global (Zustand) + acciones

src/hooks/
├── useSimulation.ts          # Loop de simulación (RAF + fetch al backend)
├── useCircuit.ts             # Hook auxiliar para acceder al circuito
└── useCircuitPersistence.ts  # Guardar/cargar circuitos (JSON)

src/types/
└── index.ts                  # Tipos TypeScript (solo si hay que agregar nuevos)

src/core/
└── constants.ts              # Categorías, templates de componentes (solo si hay que agregar)

src/utils/
└── componentHandles.ts       # Handles por tipo de componente

src/App.tsx                   # Layout general (solo función loadDemo y shortcuts)
```

## Cómo empezar

```bash
# 1. Desde la raíz del proyecto
cd C:\Users\Usuario\Desktop\proyectoElectro+

# 2. Instalar dependencias (solo primera vez)
pnpm install

# 3. Iniciar servidor de desarrollo
pnpm dev
# El frontend arranca en http://localhost:5173

# 4. Verificar tipos (sin errores)
pnpm tsc --noEmit

# 5. Build de producción (sin errores)
pnpm build
```

## Lo que debes hacer (Día 1-4)

### Día 1 — Diagnóstico del editor

1. **Probar drag de componentes** — Arrastrar resistencia, capacitor, etc. Deben moverse suavemente
2. **Verificar `onNodesChange`** en `CircuitEditor.tsx` — Asegurar que no tenga filtro `dragging === false`
3. **Verificar handles y conexiones** — Pasar mouse sobre terminales, deben aparecer puntos cliqueables
4. **Probar batería** — Handle izquierdo verde (−) y derecho rojo (+)
5. **Confirmar `nodeDragThreshold: 0`** — El drag debe iniciar inmediatamente al hacer clic

### Día 2 — Funcionalidades

1. **Selección múltiple** — Shift+click selecciona varios componentes
2. **Undo/Redo** — Ctrl+Z deshace, Ctrl+Shift+Z rehace (store + teclado)
3. **Rotar y Duplicar** — Botones en panel de propiedades deben funcionar
4. **Eliminar múltiples** — Seleccionar varios y presionar Delete

### Día 3 — Validación

1. **LED on/off** — Verificar que `isLit` dependa de `simulationRunning && current > 1e-6`
2. **Cables animados** — Edges tipo `bezier` con `animated: true`
3. **Probar Select, Wire, Probe** — Las 3 herramientas deben funcionar
4. **Circuito demo** — Cargar demo y verificar que todo funcione

### Día 4 — Cierre

1. Build final sin errores: `pnpm build`
2. Probar integración con backend (Luisa)
3. Merge a `release/v1.0` mediante Pull Request
4. Josue y Luisa revisan tu PR antes del merge

## Cómo probar tu código

```bash
# Verificar tipos TypeScript
pnpm tsc --noEmit

# Build de producción
pnpm build

# Prueba manual en navegador:
# 1. Abrir http://localhost:5173
# 2. Cargar circuito demo
# 3. Arrastrar cada componente
# 4. Conectar cables entre terminales
# 5. Iniciar simulación → LED debe encenderse
# 6. Detener simulación → LED debe apagarse
```

## Reglas importantes

1. Trabaja SOLO en tu rama `feature/miguel-editor`
2. NUNCA hagas push a `main`
3. Commits en español y descriptivos
4. Cuando termines una funcionalidad → crea Pull Request a `release/v1.0`
5. No se mergea nada sin que los 3 digan OK

## Dependencias con los otros

- **Luisa** (backend): tu editor envía el circuito al backend para simular. Si ella cambia la API, avísale
- **Josue** (UI): él depende de que tus componentes tengan los handles y datos correctos para mostrar mediciones

**Tip:** Si agregas un nuevo tipo de componente (ej: transformador), tienes que:
1. Agregarlo en `src/types/index.ts` (enum ComponentType)
2. Agregar template en `src/core/constants.ts`
3. Agregar SVG en `src/components/symbols/index.tsx` (o pedirle a Josue)
4. Agregar handles en `src/utils/componentHandles.ts`
5. Agregar lógica MNA en el backend (pedirle a Luisa)
