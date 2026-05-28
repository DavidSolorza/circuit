# Josue — UI/UX + Coordinación del equipo

**Rama:** `feature/josue-ui`

---

## ¿Qué hago yo?

Tu eres el encargado de que la aplicación se vea profesional y funcione bien visualmente. Además coordinas al equipo: revisas el trabajo de Luisa y Miguel, pruebas que todo funcione junto, y propones mejoras.

**No eres el jefe, eres un trabajador más con más responsabilidades.** Tú indicas qué hacer y cuándo, pero las decisiones de merge se toman entre los 3.

## Tecnologías que usas

- **React 18 + TypeScript** — Framework de UI
- **Tailwind CSS** — Estilos (dark mode, colores personalizados)
- **Framer Motion** — Animaciones
- **Plotly.js** — Gráficas del osciloscopio
- **Lucide React** — Iconos

## Archivos que te corresponden

```
src/
├── App.tsx                                 # Layout principal (top bar, sidebar, paneles, footer)
├── index.css                               # Estilos globales + dark mode

src/components/
├── toolbar/Toolbar.tsx                     # Sidebar izquierda con categorías y buscador
├── symbols/index.tsx                       # SVGs de los 13 componentes
├── status/SimulationStatus.tsx             # LED de estado en la top bar
├── multimeter/MultimeterDisplay.tsx        # Panel de multímetro (V/I/P)
├── properties/PropertiesPanel.tsx          # Panel de propiedades (sliders, botones)
├── graph/GraphPanel.tsx                    # Osciloscopio con Plotly
└── calculator/CalculatorPage.tsx           # Calculadora de ingeniería (7 tabs)

tailwind.config.js                          # Colores, animaciones, dark mode
docs/                                       # Documentación del proyecto
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

# 4. Verificar tipos
pnpm tsc --noEmit

# 5. Build de producción
pnpm build
```

## Lo que debes hacer (Día 1-4)

### Día 1 — Diagnóstico de UI

1. **Dark mode global** — Verificar que TODA la app esté en oscuro (fondos surface, texto claro, inputs dark)
2. **Sidebar + buscador** — El buscador debe filtrar componentes por nombre, las categorías deben funcionar
3. **Traducción 100% español** — Revisar que no haya texto en inglés en ningún .tsx
4. **Reportar bugs** — Si encuentras algo mal, escríbelo y asígnalo a `fix/critical-bugs`

### Día 2 — Mejoras visuales

1. **Rediseñar SVGs** — Diodo, transistor y potenciómetro deben verse profesionales
2. **Calculadora 7 tabs** — Probar Ohm, R serie/paralelo, Código Colores, RC, XL/XC, Conversor, Fórmulas
3. **Gráficas Plotly** — Probar múltiples sondas, zoom, hover, toggle visibilidad, limpiar
4. **Panel propiedades** — Sliders deben modificar parámetros, botones Rotar/Duplicar/Eliminar/Sonda deben funcionar

### Día 3 — Supervisión + nuevas features

1. **Revisar PR de Luisa** — Entrar a `feature/luisa-backend`, revisar código, probar endpoint
2. **Revisar PR de Miguel** — Entrar a `feature/miguel-editor`, probar drag, conexiones, LED
3. **Proponer nueva feature** — Ideas: toggle tema claro/oscuro, exportar CSV de gráficas, tooltips, historial
4. **Pulir layout** — Espaciado vertical/horizontal consistente
5. **Micro-animaciones** — Transiciones suaves en hover/focus

### Día 4 — Cierre

1. **Revisión final UI** — Consistencia visual en TODA la app
2. **Build final** — `pnpm build` sin errores
3. **Prueba manual completa** — Seguir checklist de 10 pasos en DOCUMENTACION_COMPLETA.md
4. **Aprobar merges** — Coordinar que los 3 revisen y aprueben antes de mergear a `release/v1.0`
5. **Merge a main** — Último paso: PR desde `release/v1.0` → `main` con aprobación de los 3

## Cómo probar tu código

```bash
# Verificar tipos
pnpm tsc --noEmit

# Build
pnpm build

# Prueba visual en navegador:
# 1. http://localhost:5173 → debe verse oscuro y profesional
# 2. Sidebar: buscar "resistencia" → debe filtrar
# 3. Arrastrar componente al canvas
# 4. Panel derecho: seleccionar componente → ver sliders y mediciones
# 5. Calculadora: icono ∑ en top bar → 7 tabs funcionales
# 6. Gráficas: deben verse al iniciar simulación
```

## Reglas importantes

1. Trabaja SOLO en tu rama `feature/josue-ui`
2. NUNCA hagas push a `main`
3. Commits en español y descriptivos
4. Cuando termines una funcionalidad → crea Pull Request a `release/v1.0`
5. No se mergea nada sin que los 3 digan OK

## Coordinación del equipo

Como coordinador, tu rol extra es:

1. **Revisar PRs** — Antes de mergear a `release/v1.0`, revisa el código de Luisa y Miguel
2. **Probar integración** — Frontend + backend deben funcionar juntos
3. **Asignar bugs** — Si algo falla, créalo en `fix/critical-bugs` y asígnalo a quien corresponda
4. **Mantener docs** — Este archivo y DOCUMENTACION_COMPLETA.md deben estar actualizados
5. **Asegurar build** — Nunca mergees nada que rompa `pnpm build`

## Dependencias con los otros

- **Luisa** (backend): tus paneles muestran datos que vienen de su API (voltajes, corrientes)
- **Miguel** (editor): tus SVGs se renderizan dentro de sus nodos de React Flow. Si cambias un SVG, avísale

**Tip:** Si quieres agregar un SVG nuevo:
1. Crear el SVG en `src/components/symbols/index.tsx`
2. Usar `TerminalDot` para los puntos de conexión
3. Agregar `Handle` de React Flow en `src/features/editor/ComponentNode.tsx` (o pedirle a Miguel)
4. Registrar el tipo en `src/types/index.ts` y `src/core/constants.ts`
