# Identidad visual — Tema claro LabCircuitos

La aplicación usa un **tema claro fijo** (laboratorio / papel técnico), sin toggle oscuro.

## Paleta principal

| Token         | Hex       | Uso                           |
| ------------- | --------- | ----------------------------- |
| `surface-950` | `#F8F5EF` | Fondo del canvas              |
| `surface-900` | `#FFFCF7` | Paneles, header, modales      |
| `surface-800` | `#F5F0E6` | Tarjetas, inputs, hover       |
| `surface-700` | `#E8E0D0` | Bordes, cuadrícula            |
| `primary-500` | `#1F4D3A` | Acciones, mediciones, acentos |
| `gold-500`    | `#C9A86A` | Botón INICIAR, highlights     |
| `ink`         | `#1A1A18` | Texto principal               |
| `ink-muted`   | `#5C5A54` | Texto secundario              |
| `ink-faint`   | `#8A877E` | Etiquetas, hints              |

## Estados de simulación

| Token            | Color    | Significado       |
| ---------------- | -------- | ----------------- |
| `sim-running`    | Verde    | Simulación activa |
| `sim-error`      | Rojo     | Error             |
| `sim-processing` | Amarillo | Procesando        |
| `sim-stopped`    | Gris     | Detenido          |

## Archivos de estilo

- `tailwind.config.js` — tokens `surface`, `primary`, `gold`, `ink`, sombras
- `src/index.css` — base global, React Flow, clases `.btn-primary`, `.metric-card`, etc.
- `src/core/constants.ts` — colores del canvas y componentes

## Criterios de revisión UI

1. Fondos claros (`surface-*`), sin bloques oscuros sueltos
2. Texto con `text-ink`, `text-ink-muted` o `text-ink-faint` (evitar grises arbitrarios)
3. Bordes `border-surface-700`
4. Acentos verde bosque (`primary`) y dorado (`gold`) para acciones importantes
5. Gráficas Plotly con rejilla `#E8E0D0` y tipografía legible sobre fondo claro
