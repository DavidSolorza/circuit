"""
Circuit Lab Backend — FastAPI Application
==========================================
Endpoints:
  POST /api/simulate              — DC / transient simulation (numpy MNA)
  POST /api/simulate/validate     — Validate circuit without running
  POST /api/simulate/spice        — Simulation via PySpice (if installed)
  POST /api/netlist               — Generate SPICE netlist
  GET  /api/health                — Health check
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router

app = FastAPI(title="Circuit Lab API", version="0.1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
