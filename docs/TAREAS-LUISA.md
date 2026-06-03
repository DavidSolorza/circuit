# Luisa — Simulación de circuitos

**Rama:** `feature/luisa-backend`  
**Enfoque exclusivo:** que los circuitos se simulen **correctamente** (matemática, validación, elementos).

## Tu territorio

```
backend/
├── simulation/engine.py      # MNA Python (referencia)
├── validators/                 # Validación pre-simulación
└── models/                     # Tipos de componentes API

src/engine/                     # Motor TS (ownership Luisa)
├── elements/                   # stamp(), validate(), nuevos componentes
├── solvers/                    # MNA, Backward Euler
├── validation/                 # CircuitValidator
└── demo/smokeTest.ts           # Prueba RC

src/services/localSimulation.ts # Puente UI ↔ motor
```

## NO tocar (otros integrantes)

- `src/features/editor/**` → Miguel
- `src/components/**`, `App.tsx` → Josue
- `src/store/**` → Miguel (salvo acuerdo para tipos de simulación)

## Checklist semanal

- [ ] `pnpm exec tsx src/engine/demo/smokeTest.ts` pasa
- [ ] `cd backend && python test_backend.py` pasa
- [ ] Mismo circuito inválido → mismos errores en TS y Python
- [ ] Push diario a `feature/luisa-backend`

## Tareas detalladas

Ver [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md) sección **Luisa** (L-01 … L-11).

## Sincronizar con el equipo

```bash
git checkout feature/luisa-backend
git fetch origin
git merge origin/feature/josue-ui   # traer último motor + docs
pnpm install
```
