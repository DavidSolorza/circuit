# LabCircuitos

Simulador de circuitos eléctricos interactivo con dark mode profesional. Frontend React + TypeScript + Vite. Backend Python + FastAPI + MNA/Ngspice.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + pnpm |
| UI | Tailwind CSS + React Flow + Framer Motion |
| Gráficas | Plotly.js |
| Estado | Zustand |
| Backend | Python + FastAPI + Numpy + PySpice/Ngspice |

## Inicio rápido

```bash
# Terminal 1 — Frontend
pnpm install
pnpm dev          # → localhost:5173

# Terminal 2 — Backend
cd backend
pip install -r requirements.txt
python main.py    # → localhost:8000
```

## Componentes disponibles

Resistencia, Capacitor, Inductor, Batería (+/−), Fuente Corriente, LED (con glow), Diodo, Transistor NPN, Potenciómetro, Interruptor, Tierra, Voltímetro, Amperímetro.

## Ramas

| Rama | Persona | Rol |
|------|---------|-----|
| `main` | — | Código estable |
| `feature/luis-backend` | Luis | Backend + SPICE |
| `feature/miguel-editor` | Miguel | Editor React Flow + store |
| `feature/josue-ui` | Josue | UI/UX + supervisor general |
| `release/v1.0` | Equipo | Entrega final |

**Regla principal:** Nada se mergea a `main` sin aprobación unánime de las 3 personas.
