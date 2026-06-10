#!/usr/bin/env python3
"""
Test circuit for validation of the electronics simulator.
This creates a complete test circuit with:
- Voltage source (9V)
- Resistor (1kΩ)
- LED
- Capacitor
- Inductor
- Ground
"""

import json
import os
from typing import Dict, Any

import requests

API_BASE = os.environ.get("API_BASE", "http://localhost:8000")

def create_test_circuit() -> Dict[str, Any]:
    """Create a test circuit request."""
    # Component definitions
    components = {
        "bat1": {"id": "bat1", "type": "voltageSource", "label": "Batería 9V", "params": {"voltage": 9.0}},
        "res1": {"id": "res1", "type": "resistor", "label": "R1 1kΩ", "params": {"resistance": 1000}},
        "led1": {"id": "led1", "type": "led", "label": "LED", "params": {}},
        "cap1": {"id": "cap1", "type": "capacitor", "label": "C1 1µF", "params": {"capacitance": 1e-6}},
        "ind1": {"id": "ind1", "type": "inductor", "label": "L1 100µH", "params": {"inductance": 100e-6}},
        "gnd1": {"id": "gnd1", "type": "ground", "label": "GND", "params": {}},
    }
    
    # Terminal definitions
    terminals = {
        # Battery
        "t_bat1_0": {"id": "t_bat1_0", "componentId": "bat1", "index": 0, "nodeId": 0},
        "t_bat1_1": {"id": "t_bat1_1", "componentId": "bat1", "index": 1, "nodeId": 1},
        # Resistor
        "t_res1_0": {"id": "t_res1_0", "componentId": "res1", "index": 0, "nodeId": 1},
        "t_res1_1": {"id": "t_res1_1", "componentId": "res1", "index": 1, "nodeId": 2},
        # LED
        "t_led1_0": {"id": "t_led1_0", "componentId": "led1", "index": 0, "nodeId": 2},
        "t_led1_1": {"id": "t_led1_1", "componentId": "led1", "index": 1, "nodeId": 0},
        # Capacitor
        "t_cap1_0": {"id": "t_cap1_0", "componentId": "cap1", "index": 0, "nodeId": 1},
        "t_cap1_1": {"id": "t_cap1_1", "componentId": "cap1", "index": 1, "nodeId": 3},
        # Inductor
        "t_ind1_0": {"id": "t_ind1_0", "componentId": "ind1", "index": 0, "nodeId": 3},
        "t_ind1_1": {"id": "t_ind1_1", "componentId": "ind1", "index": 1, "nodeId": 0},
        # Ground (single connection)
        "t_gnd1_0": {"id": "t_gnd1_0", "componentId": "gnd1", "index": 0, "nodeId": 0},
    }
    
    # Wire connections
    wires = [
        {"fromTerminalId": "t_bat1_1", "toTerminalId": "t_res1_0"},    # Battery(+) -> Resistor
        {"fromTerminalId": "t_res1_1", "toTerminalId": "t_led1_0"},    # Resistor -> LED(-)
        {"fromTerminalId": "t_led1_1", "toTerminalId": "t_bat1_0"},    # LED(+) -> Battery(-)
        {"fromTerminalId": "t_res1_1", "toTerminalId": "t_cap1_0"},    # Resistor -> Capacitor
        {"fromTerminalId": "t_cap1_1", "toTerminalId": "t_ind1_0"},    # Capacitor -> Inductor
        {"fromTerminalId": "t_ind1_1", "toTerminalId": "t_bat1_0"},    # Inductor -> Battery(-)
    ]
    
    return {
        "components": components,
        "terminals": terminals,
        "wires": wires,
        "analysis": "transient",
        "duration": 0.1,
        "timestep": 0.001,
    }

def test_health_check():
    """Test if backend is alive."""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        if response.status_code == 200:
            print("[OK] Backend is running")
            return True
    except Exception as e:
        print(f"[FAIL] Backend health check failed: {e}")
        return False

def test_simulation():
    """Test circuit simulation."""
    print("\nTesting circuit simulation...")
    circuit = create_test_circuit()
    
    try:
        response = requests.post(
            f"{API_BASE}/api/simulate",
            json=circuit,
            timeout=10,
        )
        
        if response.status_code != 200:
            print(f"[FAIL] Simulation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        result = response.json()
        
        # Check result structure
        if not result.get("status", {}).get("success"):
            print(f"[FAIL] Simulation returned error: {result.get('status', {}).get('error')}")
            return False
        
        # Verify data
        if not result.get("time"):
            print("[FAIL] No time data in response")
            return False
        
        print("[OK] Simulation completed successfully")
        print(f"  - Time steps: {len(result.get('time', []))}")
        print(f"  - Nodes with voltage data: {len(result.get('nodeVoltages', {}))}")
        print(f"  - Components with current data: {len(result.get('branchCurrents', {}))}")
        
        # Print sample data
        if result.get("time"):
            print(f"  - Time range: {result['time'][0]:.6f}s - {result['time'][-1]:.6f}s")
        
        # Check for LED current
        led_current = result.get("branchCurrents", {}).get("led1")
        if led_current:
            max_current = max(abs(i) for i in led_current)
            print(f"  - LED current (max): {max_current:.6e} A")
            if max_current > 1e-6:
                print("    LED should be illuminated")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Simulation test failed: {e}")
        return False

def test_validation():
    """Test circuit validation."""
    print("\nTesting circuit validation...")
    circuit = create_test_circuit()
    
    try:
        response = requests.post(
            f"{API_BASE}/api/simulate/validate",
            json=circuit,
            timeout=5,
        )
        
        if response.status_code != 200:
            print(f"[FAIL] Validation failed with status {response.status_code}")
            return False
        
        result = response.json()
        
        if result.get("valid"):
            print("[OK] Circuit is valid")
            if result.get("warnings"):
                print(f"  Warnings: {result['warnings']}")
        else:
            print("[FAIL] Circuit validation failed")
            print(f"  Errors: {result.get('errors', [])}")
            return False
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Validation test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Electro+ Lab — Backend Test Suite")
    print("=" * 60)
    
    all_pass = True
    
    # Run tests
    if not test_health_check():
        print("\n[WARN] Backend is not running. Start it with:")
        print("   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000")
        exit(1)
    
    all_pass &= test_validation()
    all_pass &= test_simulation()
    
    # Summary
    print("\n" + "=" * 60)
    if all_pass:
        print("[OK] All tests passed!")
        print("=" * 60)
    else:
        print("[FAIL] Some tests failed")
        print("=" * 60)
        exit(1)
