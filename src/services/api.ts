import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface BackendComponent {
  id: string;
  type: string;
  params: Record<string, number>;
}

export interface BackendTerminal {
  id: string;
  componentId: string;
  nodeId: number;
}

export interface BackendWire {
  fromTerminalId: string;
  toTerminalId: string;
}

export interface SimulateRequest {
  components: Record<string, BackendComponent>;
  terminals: Record<string, BackendTerminal>;
  wires: BackendWire[];
  analysis: 'dc' | 'transient';
  duration?: number;
  timestep?: number;
}

export interface SimulateResponse {
  time: number[];
  nodeVoltages: Record<string, number[]>;
  branchCurrents: Record<string, number[]>;
  power: Record<string, number[]>;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
}

export async function simulate(req: SimulateRequest): Promise<SimulateResponse> {
  const { data } = await api.post<SimulateResponse>('/api/simulate', req);
  return data;
}

export async function generateNetlist(req: SimulateRequest): Promise<string> {
  const { data } = await api.post<{ netlist: string }>('/api/netlist', req);
  return data.netlist;
}
