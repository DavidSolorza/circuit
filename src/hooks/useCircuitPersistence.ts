import { useEffect, useCallback } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { initCircuitState } from '../utils/circuit';
import type { CircuitState } from '../types';

const STORAGE_KEY = 'labcircuitos_circuit';

export function useCircuitPersistence() {
  const circuit = useCircuitStore((s) => s.circuit);

  // Save circuit to localStorage whenever it changes
  useEffect(() => {
    try {
      const data = JSON.stringify(circuit);
      localStorage.setItem(STORAGE_KEY, data);
    } catch (err) {
      console.error('Failed to save circuit:', err);
    }
  }, [circuit]);

  // Load circuit from localStorage on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const loaded = JSON.parse(data) as CircuitState;
        // Validate structure before loading
        if (loaded && loaded.components && loaded.terminals && loaded.wires !== undefined && loaded.nextNodeId !== undefined) {
          useCircuitStore.setState({ circuit: loaded });
        }
      }
    } catch (err) {
      console.error('Failed to load circuit:', err);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const exportCircuit = useCallback(() => {
    const json = JSON.stringify(circuit, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuito_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [circuit]);

  const importCircuit = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const loaded = JSON.parse(content) as CircuitState;
        if (loaded && loaded.components && loaded.terminals && loaded.wires !== undefined && loaded.nextNodeId !== undefined) {
          useCircuitStore.setState({ 
            circuit: loaded,
            selectedComponentId: null,
            simResults: null,
            simError: null,
          });
        } else {
          throw new Error('Invalid circuit file format');
        }
      } catch (err) {
        console.error('Failed to import circuit:', err);
        alert('Error al importar circuito: archivo inválido');
      }
    };
    reader.readAsText(file);
  }, []);

  const clearCircuit = useCallback(() => {
    if (confirm('¿Seguro que deseas limpiar el circuito?')) {
      useCircuitStore.setState({ 
        circuit: initCircuitState(),
        selectedComponentId: null,
        simulationRunning: false,
        simResults: null,
        simError: null,
        probes: [],
        oscData: {},
      });
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { exportCircuit, importCircuit, clearCircuit };
}
