# Flujo de trabajo Git — LabCircuitos

## Modelo de ramas

Adaptación de Git Flow al equipo de 3 integrantes + entrega académica.

```
main                 ← Fuente de verdad (solo merges aprobados)
  ↑
release/v1.0         ← Integración pre-entrega
  ↑
feature/*            ← Desarrollo individual
fix/critical-bugs    ← Hotfixes coordinados por Josue
```

### Ramas activas del equipo

| Rama | Responsable | Dominio |
|------|-------------|---------|
| `feature/luisa-backend` | Luisa | API, MNA, validación, SPICE |
| `feature/miguel-editor` | Miguel | React Flow, store, conexiones |
| `feature/josue-ui` | Josue | UI, paneles, docs, calidad |
| `release/v1.0` | Equipo | Integración final |
| `main` | Equipo | Estable |

> **Regla de oro:** ningún merge a `main` sin aprobación **unánime** de Luisa, Miguel y Josue.

---

## Flujo diario

```bash
# 1. Actualizar tu rama con main
git checkout feature/josue-ui
git fetch origin
git merge origin/main

# 2. Trabajar con commits pequeños
git add .
git commit -m "Mejora panel multímetro con tokens ink"

# 3. Subir
git push origin feature/josue-ui

# 4. Al terminar feature → PR a release/v1.0
```

---

## Estrategia para convertir `main` en fuente de verdad

### Fase A — Estabilizar (actual)

1. Completar auditoría (`docs/INFORME-AUDITORIA.md`) ✅  
2. Añadir ESLint + Prettier + scripts ✅  
3. Corregir arranque backend ✅  
4. Documentación técnica ✅  

### Fase B — Integración a `release/v1.0`

Orden recomendado de merges (menor riesgo de conflicto):

| Orden | Rama | Motivo |
|-------|------|--------|
| 1 | `feature/luisa-backend` | Contratos API estables |
| 2 | `feature/miguel-editor` | Depende de tipos/store |
| 3 | `feature/josue-ui` | UI encima del editor |

### Fase C — Promoción a `main`

1. PR `release/v1.0` → `main`  
2. Checklist completo (sección inferior)  
3. Aprobación de los 3 integrantes  
4. Tag `v1.0.0`

---

## Pull Requests

### Plantilla mínima

```markdown
## Qué hace
- ...

## Cómo probar
1. pnpm dev + python main.py
2. ...

## Checklist
- [ ] pnpm build OK
- [ ] pnpm lint OK
- [ ] Probado manualmente
- [ ] Sin conflictos con release/v1.0
```

### Revisores obligatorios

- PR backend → Miguel + Josue  
- PR editor → Luisa + Josue  
- PR UI → Luisa + Miguel  
- PR a `main` → **los 3**

---

## Sincronización y conflictos

| Situación | Acción |
|-----------|--------|
| Conflicto en `circuitStore.ts` | Resolver en pair con Miguel |
| Conflicto en `engine.py` | Resolver con Luisa |
| Conflicto en estilos/UI | Josue lidera, otros revisan |
| Bug bloqueante | Branch `fix/critical-bugs`, cherry-pick a features |

**Frecuencia:** merge de `main` → tu feature **al inicio de cada día** de trabajo.

---

## Scripts de calidad (obligatorios antes de PR)

```bash
pnpm lint
pnpm format
pnpm build
pnpm tsc --noEmit

# Backend
cd backend && python -m pytest ../test_backend.py  # si aplica
python main.py  # smoke test
```

---

## Checklist de aprobación para merge a `main`

### Técnico

- [ ] `pnpm build` — 0 errores  
- [ ] `pnpm lint` — 0 errores  
- [ ] Backend arranca en `:8000`  
- [ ] Circuito demo simula (LED enciende)  
- [ ] Sin errores rojos en consola del navegador  

### Equipo

- [ ] Luisa aprueba  
- [ ] Miguel aprueba  
- [ ] Josue aprueba  
- [ ] Documentación actualizada  

### Manual (10 pasos)

Ver `docs/DOCUMENTACION_COMPLETA.md` sección 7.

---

## Estrategia de despliegue (futuro)

| Entorno | Frontend | Backend |
|---------|----------|---------|
| Dev | `pnpm dev` :5174 | `python main.py` :8000 |
| Preview | `pnpm preview` | uvicorn sin reload |
| Prod | `pnpm build` → static host | Docker + uvicorn |

Variables:

```env
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5174
```

---

## Referencias

- `docs/guia-contribucion.md` — estándares de código  
- `docs/roadmap.md` — plan por sprints  
- `docs/RESPONSABILIDADES.md` — roles del equipo
