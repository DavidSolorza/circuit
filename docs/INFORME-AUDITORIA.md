# Informe de auditoría técnica — LabCircuitos

**Fecha:** 2026-06-02  
**Rama analizada:** `feature/josue-ui` (comparada con `main`)  
**Referencia:** `acctulizacio.mkd` — Fases 1 y 2

---

## 1. Resumen ejecutivo

> **Actualización Jun 2026:** Se implementó `src/engine/` (MNA TS), simulación local en cliente y docs por rama (`docs/TAREAS-POR-RAMA.md`). Los hallazgos A1 y A4 de abajo están **resueltos**.

LabCircuitos es un **simulador de circuitos funcional** con frontend React + motor MNA TypeScript local + backend FastAPI opcional. El producto **compila y corre** (`pnpm build` OK, frontend en `:5174`).

Pendiente de la spec `acctulizacio.mkd`: FSD completo, Canvas 2D, React 19, modelos avanzados (diodo/transistor reales).

---

## 2. Arquitectura actual

### 2.1 Frontend

| Capa | Implementación |
|------|----------------|
| UI | React 18 + Tailwind + componentes en `src/components/` |
| Editor | **React Flow** (SVG/DOM), no Canvas 2D |
| Estado | Zustand monolítico `src/store/circuitStore.ts` |
| Simulación UI | `useSimulation.ts` — motor local `src/engine/` (~60 FPS) |
| Gráficas | Plotly (`react-plotly.js`) |
| Persistencia | `localStorage` + export/import JSON |

### 2.2 Backend

| Capa | Implementación |
|------|----------------|
| API | FastAPI `backend/api/routes.py` |
| Motor | MNA con NumPy `backend/simulation/engine.py` |
| Validación | BFS tierra + cables `backend/validators/circuit_validator.py` |
| SPICE | Netlist builder + endpoint opcional PySpice |

### 2.3 Flujo de datos

```
Usuario → React Flow / Store → useSimulation → POST /api/simulate
                                              → FastAPI engine (MNA)
                                              → simResults → UI (multímetro, LED, Plotly)
```

---

## 3. Hallazgos (problema → impacto → prioridad → solución)

| ID | Problema | Impacto | Prioridad | Recomendación |
|----|----------|---------|-----------|---------------|
| A1 | ~~No hay motor TS en `engine/`~~ | — | **✅ Resuelto** | `src/engine/` implementado |
| A2 | **React Flow vs Canvas 2D** (spec) | Desvío arquitectónico mayor | **P1** | Mantener React Flow a corto plazo; evaluar Canvas en v2 |
| A3 | **`circuitStore.ts` monolítico** (~400 LOC) | Difícil testear y escalar | **P0** | Dividir: circuit / simulation / probes / history |
| A4 | ~~Simulación vía HTTP por tick~~ | — | **✅ Resuelto** | Motor local + `localSimulation.ts` |
| A5 | **Bundle ~5 MB** (Plotly en chunk principal) | TTFB / parse lento | **P0** | Lazy-load Plotly + manualChunks |
| A6 | **Duplicación `fmtV`/`fmtI`** | Mantenimiento | **P2** | `shared/lib/formatElectrical.ts` |
| A7 | **Duplicación merge nodos** (validator + engine) | Bugs inconsistentes | **P1** | Extraer `resolveNodes()` compartido en backend |
| A8 | **Dependencias sin uso** (`react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`?) | Ruido, superficie npm | **P2** | Auditar imports y remover |
| A9 | **`@types/uuid` deprecado** | Warning install | **P3** | Eliminar devDep |
| A10 | **CORS `allow_origins=["*"]` + credentials** | Riesgo si se expone públicamente | **P1** | Limitar orígenes vía env en prod |
| A11 | **Sin ESLint/Prettier** (antes de esta actualización) | Calidad inconsistente | **P1** | ✅ Añadido en esta rama |
| A12 | **React 18 vs spec React 19** | Desvío menor | **P2** | Upgrade planificado Sprint 2 |
| A13 | **Tema claro actual vs spec dark industrial** | Conflicto de requisitos | **P1** | Decisión de equipo (ver `docs/TEMA_UI.md` vs spec) |
| A14 | **`.ai/memory/*` describe otro proyecto** (PathForge) | Confusión para agentes IA | **P2** | Actualizar memoria a LabCircuitos |
| A15 | **`App.tsx` > 400 líneas** | Violación regla spec | **P2** | Extraer layout a widgets FSD |
| A16 | **`CalculatorPage.tsx` > 400 líneas** | Idem | **P2** | Dividir por tab |
| A17 | **Backend `ComponentType` incompleto** vs frontend (falta diode, transistor…) | Simulación parcial | **P1** | Alinear enums Pydantic |
| A18 | **Multi-selección Shift** incompleta en checklist | UX | **P2** | Miguel — editor |
| A19 | **`confirm()` / `alert()` en UI** | UX pobre | **P3** | Snackbar/modal |
| A20 | **Sin tests frontend** | Regresiones | **P1** | Vitest + pruebas store/engine |

---

## 4. Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Editor React Flow | ✅ Funcional | Drag, wire, probe, demo |
| Store Zustand | ⚠️ Funcional | Monolítico, pushUndo en mutaciones |
| Simulación backend | ✅ Funcional | MNA DC/transitorio, LED aproximado |
| Validador | ✅ Funcional | Tierra BFS, cables duplicados |
| UI paneles | ✅ Funcional | Multímetro, propiedades, calculadora |
| Osciloscopio | ✅ Funcional | Plotly, sondas |
| Persistencia | ✅ Funcional | localStorage + JSON |
| Motor TS local | ❌ No existe | Requerido por spec |
| Canvas renderer | ❌ No existe | Usa React Flow |
| ESLint/Prettier | ✅ Añadido | `pnpm lint`, `pnpm format` |
| CI/CD | ❌ No configurado | Recomendado GitHub Actions |
| Docker | ❌ No configurado | Opcional entrega |

---

## 5. Dependencias

### Frontend — posiblemente innecesarias

- `react-router-dom` — no hay rutas
- `react-hook-form`, `@hookform/resolvers`, `zod` — calculadora usa state local
- `framer-motion` — verificar uso real en imports

### Backend — pesadas pero opcionales

- `pyspice`, `scipy` — SPICE opcional; MNA usa solo NumPy en ruta principal

---

## 6. SOLID / escalabilidad (evaluación breve)

| Principio | Cumplimiento | Evidencia |
|-----------|--------------|-----------|
| SRP | ⚠️ Parcial | Store hace circuito + sim + probes + history |
| OCP | ⚠️ Parcial | Nuevos componentes requieren tocar store + engine if-chains |
| LSP | N/A | No hay jerarquía de elementos polimórfica en TS |
| ISP | ⚠️ Parcial | Hooks exponen demasiadas acciones del store |
| DIP | ❌ Bajo | UI depende de implementación concreta axios + store |

**Escalabilidad:** backend MNA escala a decenas de componentes; frontend limitado por Plotly + polling.

---

## 7. Seguridad (nivel educativo / demo)

- CORS abierto — OK en localhost, **restringir en producción**
- Sin autenticación — OK para simulador local
- Validación de payload vía Pydantic — ✅
- Sin rate limiting — riesgo bajo en LAN

---

## 8. Cambios aplicados en esta actualización (Fase 2 parcial)

| Cambio | Archivo(s) |
|--------|------------|
| ESLint + Prettier + scripts | `eslint.config.js`, `.prettierrc.json`, `package.json` |
| Fix arranque backend | `backend/main.py`, `backend/__init__.py` |
| Limpieza lint (imports, hooks) | Varios en `src/` |
| Formato Prettier repo | Global |
| Documentación nueva | `docs/*.md`, README |

**Validación:**

```bash
pnpm lint      # 0 errores
pnpm format    # OK
pnpm build     # OK (308 módulos)
cd backend && python main.py  # OK :8000
```

---

## 9. Plan de refactorización (resumen)

Ver detalle en `docs/roadmap.md`.

1. **Sprint 1:** Tooling ✅, docs ✅, lazy Plotly, shared formatters  
2. **Sprint 2:** FSD incremental, split store, React 19  
3. **Sprint 3:** Motor TS MNA mínimo (Resistor, Vsource, Ground)  
4. **Sprint 4:** Integración `release/v1.0` → `main`, tests E2E  

---

## 10. Checklist de calidad (acctulizacio Fase 7)

- [x] Build sin errores TypeScript/Vite  
- [x] ESLint configurado  
- [x] Prettier configurado  
- [x] Documentación técnica generada  
- [x] Backlog y roadmap  
- [ ] Motor MNA en TypeScript  
- [ ] Arquitectura FSD completa  
- [ ] React 19  
- [ ] Canvas 2D  
- [ ] Tema dark industrial (pendiente decisión equipo)  
- [ ] Tests automatizados  
- [ ] Merge unánime a `main`

---

*Elaborado como Tech Lead — LabCircuitos*
