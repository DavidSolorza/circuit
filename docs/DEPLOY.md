# Desplegar LabCircuitos (front + back)

La app **funciona sola en el navegador** (simulación en JavaScript). El backend es opcional (API FastAPI). Esta guía deja ambos online con pocos pasos.

## Resumen

| Parte | Dónde | URL ejemplo |
|-------|--------|-------------|
| **Frontend** | Vercel | `https://labcircuitos.vercel.app` |
| **Backend** | Render (gratis) | `https://labcircuitos-api.onrender.com` |

---

## 1. Subir el código a GitHub

```bash
git add .
git commit -m "Preparar despliegue"
git push origin main
```

---

## 2. Frontend en Vercel (~3 min)

1. Entra en [vercel.com](https://vercel.com) → **Add New Project**.
2. Importa el repo de GitHub.
3. En **Settings → General** del proyecto Vercel:
   - **Framework Preset:** `Other` (no elijas FastAPI ni Python)
   - **Root Directory:** vacío
   - **Install:** `pnpm install`
   - **Build:** `pnpm build` (o deja que use `vercel-build` del `package.json`)
   - **Output:** `dist`
4. **Deploy** (sin tocar nada más).

La simulación, multímetro y osciloscopio funcionan **sin backend**.

### (Opcional) Conectar la API en Vercel

Cuando tengas la URL del backend (paso 3):

1. Vercel → tu proyecto → **Settings** → **Environment Variables**
2. Añade:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://TU-API.onrender.com` (sin `/` al final)
3. **Redeploy** el proyecto.

> Hoy la UI usa el motor local; `VITE_API_URL` queda listo para cuando conecten la API.

---

## 3. Backend en Render (~5 min)

1. Entra en [render.com](https://render.com) → **New** → **Blueprint**.
2. Conecta el **mismo repo** de GitHub.
3. Render lee `render.yaml` y crea el servicio `labcircuitos-api`.
4. Espera el deploy (primera vez ~5–10 min).
5. Copia la URL pública, p. ej. `https://labcircuitos-api.onrender.com`.

### Si creaste el Web Service a mano (sin Blueprint)

| Campo | Valor correcto |
|-------|----------------|
| **Root Directory** | *(vacío — raíz del repo, NO `backend`)* |
| **Build Command** | `pip install --upgrade pip && pip install -r backend/requirements-deploy.txt` |
| **Start Command** | `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |

> Error **127** = comando no encontrado. Casi siempre es `uvicorn` sin PATH o Root Directory en `backend`.

### Probar el backend

Abre en el navegador:

```
https://TU-API.onrender.com/api/health
```

Debe responder: `{"status":"ok","version":"0.1.2"}`

---

## 4. Variables de entorno

| Variable | Dónde | Valor |
|----------|--------|--------|
| `VITE_API_URL` | Vercel | URL del backend en Render |

Copia local: `.env.example` → `.env`

---

## 5. Problemas frecuentes

| Problema | Solución |
|----------|----------|
| Build falla en Vercel | Framework = **Vite** (no FastAPI). `vercel.json` ya fuerza `framework: vite`. Root Directory vacío. |
| `No FastAPI entrypoint found` | En Vercel → Settings → General → **Framework Preset = Other** (no FastAPI). `vercel.json` usa `@vercel/static-build` solo para el front. Backend solo en **Render**. |
| `No Output Directory named dist` | En Vercel → Settings → **Output Directory** = `dist`. El `.vercelignore` ya incluye `!dist`. |
| Pantalla en blanco | Revisa la consola del navegador; `vercel.json` ya incluye rewrite SPA. |
| API en Render “duerme” (plan free) | La primera petición tarda ~30 s; es normal en el plan gratuito. |
| CORS | El backend ya permite `*`; no hace falta configurar más. |
| **Exited with status 127** | Root Directory vacío + Start: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |

---

## ¿Solo frontend?

Si solo necesitas entregar el simulador: **solo el paso 2 (Vercel)**. No hace falta Render.
