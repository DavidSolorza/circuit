# LabCircuitos

Simulador de circuitos eléctricos interactivo con **tema claro profesional** (crema, verde bosque y dorado). Frontend React + TypeScript + Vite (pnpm). Backend Python + FastAPI + MNA/Ngspice.

## Objetivos

- Editor visual de circuitos con simulación DC/transitoria en tiempo real  
- Paneles de medición (multímetro, osciloscopio, propiedades)  
- Calculadora de ingeniería eléctrica  
- Trabajo colaborativo en ramas por integrante  

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/INFORME-AUDITORIA.md](docs/INFORME-AUDITORIA.md) | Auditoría técnica y deuda |
| [docs/arquitectura.md](docs/arquitectura.md) | Arquitectura actual y objetivo FSD |
| [docs/estructura-proyecto.md](docs/estructura-proyecto.md) | Carpetas y convenciones |
| [docs/flujo-trabajo.md](docs/flujo-trabajo.md) | Git, PRs, integración a `main` |
| [docs/guia-contribucion.md](docs/guia-contribucion.md) | Cómo contribuir |
| [docs/roadmap.md](docs/roadmap.md) | Backlog, sprints, tareas |
| [docs/TAREAS-POR-RAMA.md](docs/TAREAS-POR-RAMA.md) | **Tareas por integrante y rama** |
| [docs/TAREAS-LUISA.md](docs/TAREAS-LUISA.md) | Simulación (Luisa) |
| [docs/TAREAS-MIGUEL.md](docs/TAREAS-MIGUEL.md) | Editor (Miguel) |
| [docs/TAREAS-JOSUE.md](docs/TAREAS-JOSUE.md) | UI (Josue) |
| [docs/DOCUMENTACION_COMPLETA.md](docs/DOCUMENTACION_COMPLETA.md) | Manual del equipo |

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript + Vite + **pnpm** |
| UI | Tailwind CSS + React Flow + Plotly.js |
| Estado | Zustand |
| Calidad | ESLint + Prettier |
| Backend | Python + FastAPI + NumPy (MNA) |

## Instalación

> **Gestor de paquetes oficial: [pnpm](https://pnpm.io)** — no uses `npm install` ni `yarn`.
> Si no tienes pnpm: `corepack enable` (viene con Node 18+) o `npm install -g pnpm`.

```bash
# Frontend
pnpm install

# Backend
cd backend
pip install -r requirements.txt
```

## Variables de entorno

Copiar `.env.example` → `.env` (opcional):

```env
VITE_API_URL=http://localhost:8000
```

## Scripts

```bash
pnpm dev          # Frontend → http://localhost:5174
pnpm build        # Build producción
pnpm preview      # Preview build
pnpm lint         # ESLint
pnpm format       # Verificar Prettier
pnpm format:fix   # Formatear código
```

## Inicio rápido

```bash
# Terminal 1 — Frontend (usa pnpm, no npm)
pnpm dev

# Terminal 2 — Backend
cd backend
python main.py    # → http://localhost:8000
```

## Componentes disponibles

Resistencia, Capacitor, Inductor, Batería (+/−), Fuente Corriente, LED, Diodo, Transistor NPN, Potenciómetro, Interruptor, Tierra, Voltímetro, Amperímetro.

## Estrategia de ramas

| Rama | Persona | Rol |
|------|---------|-----|
| `main` | — | Código estable (fuente de verdad) |
| `release/v1.0` | Equipo | Integración pre-entrega |
| `feature/luisa-backend` | Luisa | Backend + SPICE |
| `feature/miguel-editor` | Miguel | Editor React Flow + store |
| `feature/josue-ui` | Josue | UI/UX + documentación + calidad |
| `fix/critical-bugs` | Equipo | Hotfixes |

**Regla:** Nada se mergea a `main` sin aprobación unánime de las 3 personas.

## Convenciones

- Commits en **español**  
- `pnpm lint` + `pnpm build` antes de cada PR  
- Ver [docs/guia-contribucion.md](docs/guia-contribucion.md)  

## Despliegue

```bash
pnpm build
# Servir dist/ con cualquier static host
# Backend: uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Licencia

Proyecto académico — uso educativo.
