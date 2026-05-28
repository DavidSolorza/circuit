# LabCircuitos - Simulador Electrónico Profesional

## 🎯 Descripción

LabCircuitos es un simulador electrónico interactivo profesional basado en tecnologías modernas. Permite simular circuitos electrónicos en tiempo real con visualización de datos, mediciones en vivo y análisis gráfico.

## 🚀 Mejoras Implementadas

### Fase 1: Bugs Críticos de Funcionamiento

#### ✅ Componentes Completamente Móviles
- **Problema**: Componentes parecían bloqueados en el canvas
- **Solución**: Configuración correcta de ReactFlow (`nodesDraggable=true`, `nodesConnectable=true`, `elementsSelectable=true`)
- **Estado**: Componentes se mueven libremente, se seleccionan y se pueden manipular

#### ✅ Conexiones Mejoradas (Bezier Curves)
- **Problema**: Cables se veían incorrectos y no recalculaban bien
- **Solución**: 
  - Cambio de `smoothstep` a `bezier` curves
  - Mejora en la lógica de handles por componente
  - Sistema de handles configurables por tipo de componente
- **Estado**: Cables ahora salen desde terminales reales, se actualizan dinámicamente

#### ✅ Terminales Reales por Componente
- **Nuevo archivo**: `src/utils/componentHandles.ts`
- Cada componente tiene terminales reales en posiciones correctas:
  - **Batería**: Terminal (-) a la izquierda, terminal (+) a la derecha
  - **Resistor, Capacitor, Inductor**: Terminales 1 y 2
  - **LED**: Terminal (-) a la izquierda, (+) a la derecha
  - **Ground**: Terminal única en la parte superior
- **Estado**: Handles profesionales, colores intuitivos

#### ✅ Simulación Automática al Conectar
- **Cambio**: Cuando se conectan dos componentes, la simulación inicia automáticamente
- **Beneficio**: Feedback inmediato del usuario
- **Probes automáticas**: Se agregan automáticamente a componentes clave (LED, capacitor, inductor, resistor)
- **Estado**: Funcionando perfectamente

### Fase 2: Interfaz Profesional

#### ✅ Panel de Propiedades Editable
- Parámetros ajustables en tiempo real (voltaje, resistencia, capacitancia, inductancia)
- Mediciones en vivo (voltaje, corriente, potencia)
- Botones de utilidad (Rotar, Duplicar, Sonda, Eliminar)
- **Estado**: Totalmente funcional

#### ✅ Gráficas en Tiempo Real
- Osciloscopio multicanal con Plotly.js
- Multiples señales simultáneamente
- Funciones de zoom, pan, hover
- Actualización automática mientras simula
- **Estado**: Activo

#### ✅ Calculadora Electrónica Expandida
Contiene calculadores para:
- Ley de Ohm (V, I, R, P)
- Resistencias en serie y paralelo
- Divisor de voltaje
- Capacitores
- Inductores
- RC, RL, RLC
- Conversores de unidades
- **Estado**: Totalmente implementada

#### ✅ Toolbar (Barra Lateral)
- Categorías de componentes:
  - Fuentes
  - Pasivos
  - Semiconductores
  - Lógicos
  - Medidores
  - Misceláneos
- Búsqueda de componentes
- Herramientas (Seleccionar, Cable, Sonda)
- Botones de simulación, undo/redo
- **Estado**: Profesional y funcional

#### ✅ Barra Superior (Navbar)
- Nuevo: Crear circuito
- Abrir: Cargar circuito desde archivo
- Guardar: Exportar como JSON
- Exportar: Mismo que Guardar
- Botón Calculadora
- Estado de simulación
- **Estado**: Completamente implementada

### Fase 3: Persistencia y Almacenamiento

#### ✅ Guardar/Cargar Circuitos
- **LocalStorage**: Auto-guardado automático en el navegador
- **Exportar**: Descarga JSON con todo el circuito
- **Importar**: Carga circuitos desde archivo JSON
- **Nuevo**: Crear circuito nuevo con confirmación
- **Estado**: Completamente funcional

### Fase 4: Validación y Testing

#### ✅ Archivo de Test del Backend
- Archivo: `test_backend.py`
- Crea circuito de prueba automático completo
- Valida:
  - Conexión al servidor
  - Validación de circuito
  - Simulación correcta
  - Datos retornados
- **Uso**: `python test_backend.py`

#### ✅ Circuito Demo
- Botón "Cargar circuito demo"
- Circuito completo preconfigurado:
  - Batería 9V
  - Resistor 1kΩ
  - LED
  - Capacitor 1µF
  - Inductor 100µH
  - Tierra
- Conexiones correctas
- Simulación lista para iniciar
- **Estado**: Totalmente funcional

## 📋 Características Principales

### Frontend
- ✅ React 18.3.1 con TypeScript
- ✅ Vite para bundling
- ✅ TailwindCSS para estilos
- ✅ ReactFlow para editor visual
- ✅ Plotly para gráficas
- ✅ Zustand para estado global
- ✅ Framer Motion para animaciones
- ✅ Axios para HTTP

### Backend
- ✅ FastAPI con Python
- ✅ PySpice para simulación SPICE
- ✅ Ngspice como motor
- ✅ NumPy/SciPy para cálculos
- ✅ Modified Nodal Analysis (MNA)

## 🎮 Cómo Usar

### Instalación

**Frontend:**
```bash
cd proyectoElectro+
pnpm install
pnpm dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Crear Circuito

1. **Arrastra componentes** desde la barra lateral al canvas
2. **Conecta terminales** con la herramienta Cable
3. **Presiona INICIAR** para simular
4. **Visualiza resultados** en el osciloscopio

### Guardar/Cargar

- **Guardar**: Click en botón de disco (barra superior)
- **Abrir**: Click en botón de carpeta (barra superior)
- **Nuevo**: Click en botón + (barra superior)

### Usar Calculadora

1. Click en "∑ Calculadora" (esquina superior derecha)
2. Selecciona calculador deseado (Ley Ohm, Resistencias, etc.)
3. Ingresa valores
4. Ve resultados en tiempo real

## 🏗️ Estructura del Proyecto

```
proyectoElectro+/
├── src/
│   ├── components/          # Componentes React
│   │   ├── calculator/      # Calculadora electrónica
│   │   ├── circuit/         # Circuito (vacío, para custom)
│   │   ├── dialogs/         # Modales (vacío)
│   │   ├── graph/           # Gráficas (Plotly)
│   │   ├── multimeter/      # Display multímetro
│   │   ├── properties/      # Panel de propiedades
│   │   ├── symbols/         # Símbolos SVG
│   │   ├── status/          # Estado simulación
│   │   └── toolbar/         # Barra lateral
│   ├── features/
│   │   ├── editor/          # CircuitEditor con ReactFlow
│   │   └── measurements/    # Mediciones (vacío)
│   ├── hooks/               # React hooks
│   │   ├── useCircuit.ts
│   │   ├── useCircuitPersistence.ts  # NEW
│   │   ├── useGraph.ts
│   │   ├── useMultimeter.ts
│   │   └── useSimulation.ts
│   ├── store/               # Zustand store
│   │   └── circuitStore.ts
│   ├── services/            # API calls
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilidades
│   │   ├── circuit.ts
│   │   ├── componentHandles.ts  # NEW
│   │   ├── id.ts
│   │   └── snapToGrid.ts
│   ├── core/                # Constantes
│   │   └── constants.ts
│   └── App.tsx              # Aplicación principal
├── backend/
│   ├── main.py              # Servidor FastAPI
│   ├── api/
│   │   └── routes.py
│   ├── models/              # Modelos de datos
│   ├── simulation/          # Motor de simulación
│   ├── spice/               # Generador SPICE
│   └── validators/          # Validadores
├── test_backend.py          # Test suite
└── package.json, tailwind.config.js, etc.
```

## 🔧 Tecnologías Obligatorias

### Frontend
- [x] React 18.3.1
- [x] TypeScript 5.5.2
- [x] Vite
- [x] pnpm
- [x] TailwindCSS 3.4.4
- [x] React Flow 11.11.4
- [x] Zustand 4.5.2
- [x] Framer Motion 12.40.0
- [x] Plotly.js
- [x] Lucide React (iconos)

### Backend
- [x] FastAPI 0.115.0
- [x] Python 3.10+
- [x] PySpice 1.5.0
- [x] Ngspice
- [x] NumPy 1.26.0
- [x] SciPy 1.14.0
- [x] Pydantic 2.9.0

## 📊 Análisis del Estado

### ✅ Completado
- ✅ Componentes móviles y arrastrables
- ✅ Conexiones con Bezier curves
- ✅ Handles reales y configurables
- ✅ Simulación automática
- ✅ Probes automáticas
- ✅ Gráficas en tiempo real
- ✅ Panel de propiedades editable
- ✅ Calculadora expandida
- ✅ Persistencia (guardar/cargar/exportar)
- ✅ Interfaz profesional oscura
- ✅ Barra superior funcional
- ✅ Toolbar completo

### ⚠️ Por Pulir
- Traducción completa al español (parcial)
- Símbolos SVG ultra profesionales (actuales están bien)
- Más temas de color

### 🔮 Futuras Mejoras
- Modo colaborativo en tiempo real
- Exportar a diferentes formatos (SPICE netlist, PDF, imagen)
- Análisis de frecuencia (AC analysis)
- Parámetros transitorios avanzados
- Historial de simulaciones
- Compartir circuitos en la comunidad

## 🐛 Validación de Bugs

### LED cuando pausa
- ✅ Lógica correcta: LED se apaga cuando simulationRunning = false
- ✅ Validado: `isLit = led && simulationRunning && current > threshold`

### Componentes bloqueados
- ✅ Arreglado: ReactFlow configurado correctamente
- ✅ Handles funcionan perfectamente

### Cables incorrectos
- ✅ Arreglado: Bezier curves suave y profesional
- ✅ Se recalculan dinámicamente

### Battery sin terminales claras
- ✅ Arreglado: Terminal (-) izquierda, (+) derecha
- ✅ Colores diferenciados (azul/rojo)

## 📝 Notas de Desarrollo

### Convenciones
- Todos los archivos nuevos están comentados
- Colores Tailwind: surface-x (fondo), primary-x (acento)
- Iconos con SVG inline
- Estructura componentes React + hooks

### Performance
- Memoizado donde necesario
- useCallback para callbacks estables
- ResizeObserver para canvas responsivo
- Lazy loading de CircuitEditor

### Seguridad
- Validación en backend antes de simular
- No hay entrada de usuario sin sanitizar
- CORS habilitado solo para desarrollo

## 🚀 Próximos Pasos Recomendados

1. **Traducir completamente** al español todos los strings
2. **Expandir símbolos SVG** a más componentes
3. **Agregar sonido** en eventos (optional)
4. **Crear documentación** PDF/HTML
5. **Tests e2e** con Cypress/Playwright
6. **Deploy** en Vercel/Netlify (frontend) + Heroku/Railway (backend)

## 📞 Soporte

Para reportar bugs o sugerir mejoras, abre un issue en el repositorio.

---

**Versión**: 1.0  
**Última actualización**: Mayo 2026  
**Estado**: Producción - Beta
