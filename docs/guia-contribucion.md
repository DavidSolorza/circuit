# Guía de contribución — LabCircuitos

Gracias por contribuir. Este proyecto es académico-colaborativo (3 integrantes). Sigue estas reglas para mantener calidad y evitar conflictos.

---

## Requisitos previos

- Node.js 18+  
- pnpm 9+  
- Python 3.10+  
- Git  

---

## Configuración inicial

```bash
git clone <repo>
cd proyectoElectro+
pnpm install

cd backend
pip install -r requirements.txt
```

---

## Ejecutar en desarrollo

**Terminal 1 — Frontend**

```bash
pnpm dev
# → http://localhost:5174
```

**Terminal 2 — Backend**

```bash
cd backend
python main.py
# → http://localhost:8000
```

---

## Variables de entorno

Crear `.env` en la raíz (opcional):

```env
VITE_API_URL=http://localhost:8000
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor Vite desarrollo |
| `pnpm build` | Build producción + tsc |
| `pnpm preview` | Preview del build |
| `pnpm lint` | ESLint sobre `src/` |
| `pnpm format` | Verificar Prettier |
| `pnpm format:fix` | Aplicar Prettier |

---

## Convenciones de código

### TypeScript / React

- Tipado estricto — evitar `any`  
- Componentes funcionales + hooks  
- Estado global solo en Zustand (no duplicar en React state salvo UI local)  
- **No** poner lógica MNA en componentes — pertenece a `engine/` o backend  
- Archivos ≤ 400 líneas — dividir si crece  

### Estilos

- Tailwind con tokens del proyecto: `surface`, `ink`, `primary`, `gold`  
- Ver `docs/TEMA_UI.md` (tema claro actual)  
- Sin emojis en UI  

### Python

- Type hints en funciones públicas  
- Mensajes de error descriptivos en español/inglés técnico  
- Validación en `validators/` antes de simular  

### Commits

- Idioma: **español**  
- Formato: imperativo descriptivo  

```
Corrige validador BFS para detectar tierra indirecta
Añade lazy load de Plotly en GraphPanel
Actualiza documentación de arquitectura FSD
```

---

## Estructura de carpetas (dónde poner código nuevo)

| Tipo de cambio | Ubicación actual | Ubicación futura (FSD) |
|----------------|------------------|------------------------|
| Panel UI nuevo | `src/components/` | `src/widgets/` |
| Acción usuario | `src/hooks/` o store | `src/features/` |
| Tipo de componente | `src/types` + `constants` | `entities/element` |
| Lógica simulación TS | — | `src/engine/` |
| Endpoint API | `backend/api/` | idem |

Consultar `docs/estructura-proyecto.md` antes de crear carpetas nuevas.

---

## Reglas de importación (FSD — objetivo)

```
app → pages → widgets → features → entities → shared
engine → (solo shared/lib interno, nunca React)
```

**Prohibido:** `shared` importando desde `features`.  
**Prohibido:** `engine` importando `react`.

---

## Pull Requests

1. Trabaja en **tu rama** (`feature/*`)  
2. Antes de PR: `pnpm lint && pnpm build`  
3. PR hacia `release/v1.0` (no directo a `main`)  
4. Asigna revisores del otro par  
5. Responde comentarios en ≤ 24 h  

---

## Reportar bugs

1. Describir pasos para reproducir  
2. Captura de consola (F12)  
3. Asignar a `fix/critical-bugs` si es bloqueante  
4. Josue coordina prioridad  

---

## Testing

| Tipo | Herramienta | Estado |
|------|-------------|--------|
| Backend | `test_backend.py` | ✅ Existe |
| Frontend unit | Vitest | ⏳ Planificado |
| E2E manual | Checklist 10 pasos | ✅ Documentado |

Al añadir lógica crítica (store, engine), incluir test.

---

## Recursos

- `docs/arquitectura.md`  
- `docs/flujo-trabajo.md`  
- `docs/INFORME-AUDITORIA.md`  
- `docs/DOCUMENTACION_COMPLETA.md`  

---

## Código de conducta del equipo

- Respetar ownership de ramas  
- No force-push a `main` ni `release/v1.0`  
- Comunicar antes de cambios que afecten `circuitStore` o API  
- Decisiones de merge: consenso de 3
