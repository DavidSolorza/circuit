# Luisa — Simulación de circuitos (backend + motor TS)

**Rama:** `feature/luisa-backend`

> **Tareas detalladas:** [TAREAS-LUISA.md](TAREAS-LUISA.md) · [TAREAS-POR-RAMA.md](TAREAS-POR-RAMA.md)

---

## ¿Qué hago yo?

Eres la responsable de que los circuitos se simulen **correctamente**: matemática MNA, validación, elementos eléctricos y paridad entre Python y el motor TypeScript.

La UI ya simula en el cliente (`src/engine/`), pero tú mantienes la **verdad eléctrica** del proyecto.

## Tecnologías que usas

- **Python 3.11+** · FastAPI · NumPy · Uvicorn
- **TypeScript** · Motor MNA en `src/engine/` (Union-Find, Backward Euler, Gaussian elimination)

## Archivos que te corresponden

```
backend/
├── main.py
├── simulation/engine.py
├── validators/circuit_validator.py
├── spice/builder.py
└── models/

src/engine/                     # Motor TS — ownership Luisa
├── elements/                   # stamp(), validate(), nuevos componentes
├── solvers/                    # TransientMNASolver, MatrixBuilder
├── validation/CircuitValidator.ts
└── demo/smokeTest.ts

src/services/localSimulation.ts # Puente UI ↔ motor (solo si cambia contrato)
test_backend.py
```

## NO tocar

- `src/features/editor/**` → Miguel
- `src/components/**` → Josue
- `src/store/**` → Miguel

## Cómo empezar

```bash
git checkout feature/luisa-backend
git pull origin feature/luisa-backend
pnpm install

# Motor TS
pnpm exec tsx src/engine/demo/smokeTest.ts

# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py          # http://localhost:8000
python ../test_backend.py
```

## Prioridades (P0)

| ID | Tarea |
|----|-------|
| L-01 | Tomar ownership de `src/engine/` — revisar y extender |
| L-02 | Paridad validación Python ↔ TS |
| L-03 | Alinear `ComponentType` backend con frontend |
| L-04 | Unificar resolución de nodos en backend |
| L-05 | Tests regresión ampliados |

## Endpoints backend (mantener)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/simulate` | Simulación MNA (referencia / export) |
| POST | `/api/validate` | Validación de circuito |
| GET | `/api/health` | Health check |

## Reglas

1. Trabaja SOLO en `feature/luisa-backend`
2. NUNCA push directo a `main`
3. PR a `release/v1.0` con aprobación de los 3
4. Sincroniza con `feature/josue-ui` cuando Josue suba cambios compartidos

## Dependencias con el equipo

- **Miguel** — editor; no modifica `src/engine/`
- **Josue** — paneles UI; muestra resultados del motor que tú mantienes
