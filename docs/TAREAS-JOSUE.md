# Josue — UI/UX y coordinación

**Rama:** `feature/josue-ui`  
**Enfoque exclusivo:** apariencia, paneles, documentación y revisión del equipo.

## Tu territorio

```
src/App.tsx
src/components/**
src/index.css
tailwind.config.js
docs/**
.ai/** (memoria del proyecto)
```

## NO tocar (salvo coordinación)

- `src/engine/**` → Luisa
- `backend/**` → Luisa
- `src/features/editor/**`, `src/store/**` → Miguel

## Coordinación

1. Revisar PRs de Luisa y Miguel
2. Mantener [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md) actualizado
3. Verificar `pnpm lint && pnpm build` antes de cada merge a `release/v1.0`

## Gestor de paquetes

**Siempre `pnpm`**, nunca `npm install`:

```bash
pnpm install
pnpm dev      # http://localhost:5174
pnpm build
```

## Tareas detalladas

Ver [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md) sección **Josue** (J-01 … J-08).
