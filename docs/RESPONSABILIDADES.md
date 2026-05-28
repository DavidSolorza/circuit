# Luisa — Backend + Simulación SPICE

**Rama:** `feature/luisa-backend`

---

## ¿Qué hago yo?

Tu eres la encargada de todo lo que pasa del lado del servidor. El frontend (React) se comunica con tu backend para simular circuitos. Sin tu backend, la simulación no funciona.

## Tecnologías que usas

- **Python 3.11+**
- **FastAPI** — Framework web (servidor REST)
- **Numpy** — Para el motor MNA (Modified Nodal Analysis)
- **PySpice / Ngspice** — Alternativa de simulación SPICE
- **Uvicorn** — Servidor ASGI para correr FastAPI

## Archivos que te corresponden

```
backend/
├── main.py                       # Servidor FastAPI (punto de entrada)
├── api/routes.py                 # Endpoints REST
├── models/
│   ├── circuit.py                # Modelos de datos Python
│   └── simulation.py             # Modelos de simulación
├── simulation/
│   └── engine.py                 # Motor MNA con numpy
├── spice/
│   └── builder.py                # Genera netlist SPICE
├── validators/
│   └── circuit_validator.py      # Valida circuitos (BFS, cortos, flotantes)
└── requirements.txt              # Dependencias Python

test_backend.py                   # Script de prueba del backend
src/services/api.ts               # Conexión frontend → backend (solo si cambia API)
```

## Cómo empezar

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Crear entorno virtual (solo primera vez)
python -m venv venv
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Iniciar servidor
python main.py
# El servidor arranca en http://localhost:8000

# 5. Probar desde otra terminal
python test_backend.py
```

## Endpoints que debes mantener

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/simulate` | Recibe un circuito JSON, ejecuta MNA/SPICE, devuelve voltajes y corrientes |
| POST | `/api/validate` | Valida que el circuito sea correcto (tierra, sin cortos) |
| GET | `/api/status` | Health check del servidor |

## Lo que debes hacer (Día 1-4)

### Día 1
1. Verificar que ngspice está instalado: `ngspice --version`
2. Probar endpoint POST /api/simulate con curl o test_backend.py
3. Corregir ground validator BFS para detectar tierra aunque esté conectada por múltiples nodos
4. Agregar tipos diodo y transistor al engine MNA

### Día 2
1. Automatizar simulación al detectar cambios en el circuito
2. Crear test con circuito 9V + R + LED (corriente esperada ~9mA)
3. Validar que nodeVoltages devuelva arrays correctos
4. Validar que branchCurrents devuelva corriente por componente

### Día 3
1. Pruebas de estrés con 10+ componentes
2. Medir y optimizar tiempos de simulación
3. Implementar caché de resultados (no re-simular si el circuito no cambió)
4. Manejo de errores robusto (try/except en toda la simulación)

### Día 4
1. Pruebas de regresión (todo lo que funcionaba sigue funcionando)
2. Merge a release/v1.0 mediante Pull Request
3. Josue y Miguel revisan tu PR antes del merge

## Cómo probar tu código

```bash
# Test básico
python test_backend.py

# Con curl
curl -X POST http://localhost:8000/api/simulate -H "Content-Type: application/json" -d @test_circuit.json

# Ver que el servidor responde
curl http://localhost:8000/api/status
```

## Reglas importantes

1. Trabaja SOLO en tu rama `feature/luisa-backend`
2. NUNCA hagas push a `main`
3. Commits en español y descriptivos
4. Cuando termines una funcionalidad → crea Pull Request a `release/v1.0`
5. No se mergea nada sin que los 3 digan OK

## Dependencias con los otros

- **Miguel** (editor): necesita que tu endpoint `/api/simulate` funcione bien para que el LED encienda y las gráficas muestren datos
- **Josue** (UI): necesita tus respuestas para mostrar mediciones en el multímetro y gráficas

Si algo de tu backend cambia (nuevo endpoint, cambio en el formato de respuesta), avísales a ellos para que actualicen `src/services/api.ts`.
