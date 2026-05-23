# Circuit Simulator

Simulador interactivo de circuitos eléctricos construido con React, TypeScript, Vite y Canvas (Konva). Permite colocar componentes, conectarlos con cables, ejecutar simulación en tiempo real y visualizar lecturas con multímetro y osciloscopio.

## Stack

| Capa          | Tecnología                              |
| ------------- | --------------------------------------- |
| Lenguaje      | TypeScript (strict)                     |
| UI            | React 18 + Tailwind CSS                 |
| Canvas        | react-konva (Konva.js)                  |
| Álgebra       | mathjs (lusolve para MNA)               |
| Gráficos      | uPlot (osciloscopio)                    |
| Estado        | Zustand                                 |
| Build         | Vite 5 + pnpm                           |

## Arquitectura

```
src/
├── core/               # Lógica de dominio (tipos, solver, constantes)
│   ├── types.ts        # Interfaces del sistema (componentes, terminales, resultados, etc.)
│   ├── constants.ts    # Tamaños, colores, templates de componentes
│   └── solver.ts       # Solver MNA (Modified Nodal Analysis)
├── store/
│   └── circuitStore.ts # Estado global Zustand + acciones
├── hooks/
│   └── useSimulationLoop.ts  # Bucle RAF a 60fps
├── features/
│   ├── circuit-canvas/ # Lienzo Konva (grid, componentes, cables)
│   ├── toolbar/        # Barra lateral izquierda (herramientas)
│   ├── properties-panel/ # Panel derecho (parámetros, multímetro)
│   └── oscilloscope/   # Osciloscopio uPlot multicanal
├── App.tsx             # Layout principal + circuito demo
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## Componentes soportados

| Componente    | Símbolo                  | Parámetros                        |
| ------------- | ------------------------ | --------------------------------- |
| Resistor      | Zigzag                   | Resistencia (1&ndash;10M Ω)       |
| Capacitor     | Placas paralelas         | Capacitancia (1 pF&ndash;1 mF)    |
| Inductor      | Espirales                | Inductancia (1 nH&ndash;10 H)     |
| Battery       | Círculo con +/−          | Voltaje (0.1&ndash;30 V)          |
| CurrentSrc    | Círculo con flecha       | Corriente (0.1 mA&ndash;5 A)      |
| LED           | Triángulo + barra (glow) | Voltaje forward (0.5&ndash;3.3 V) |
| Switch        | Interruptor abierto/cerrado | Estado ON/OFF                   |
| Ground        | Tierra                   | —                                 |

## Simulación

El solver utiliza **Modified Nodal Analysis (MNA)** con integración Backward Euler para elementos reactivos:

- **Resistencia**: stampa conductancia G = 1/R en la matriz A.
- **Capacitor**: modelo companion Geq = C/dt + fuente de corriente histórica.
- **Inductor**: modelo companion Req = L/dt + fuente de voltaje histórica; se agrega una variable extra (corriente) al sistema MNA.
- **Fuente de voltaje / LED**: se agrega una variable extra de corriente; ecuación V⁺ − V⁻ = Vsrc.
- **Fuente de corriente**: stampa directamente en el vector B; corriente fluye de term0 a term1.
- **Switch cerrado**: modelado como fuente de 0V (evita matriz singular).
- **Ground**: nodo 0 fijo como referencia (0V).

La simulación corre a ~60 fps mediante `requestAnimationFrame`. Cada tick se resuelve el sistema lineal con `mathjs.lusolve` y se actualizan los resultados en el store.

## Cómo empezar

```bash
pnpm install
pnpm dev
```

Abrir http://localhost:5173 y hacer clic en **"Cargar circuito demo"** para ver un circuito funcional Battery → Resistor → LED → Ground.

## Herramientas

| Herramienta | Atajo / Acción                                 |
| ----------- | ---------------------------------------------- |
| Select      | Clic para seleccionar, arrastrar para mover    |
| Componentes | Clic en canvas para colocar                    |
| Wire        | Clic en terminal origen → clic en terminal destino |
| Probe       | Clic sobre un componente para sondear voltaje  |
| Delete      | Tecla Delete o Backspace con componente seleccionado |
| Start/Stop  | Inicia / detiene la simulación                 |

## Build

```bash
pnpm build
pnpm preview
```

## Licencia

MIT
