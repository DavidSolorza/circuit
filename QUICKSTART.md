# ⚡ Guía Rápida de Inicio - LabCircuitos

## 🚀 Instalación en 5 Minutos

### Paso 1: Terminal Frontend (Terminal A)
```bash
cd proyectoElectro+
pnpm install
pnpm dev
```
Espera a que diga:
```
  ➜  Local:   http://localhost:5173/
```

### Paso 2: Terminal Backend (Terminal B)  
```bash
cd proyectoElectro+/backend
pip install -r requirements.txt
python main.py
```
Espera a que diga:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Paso 3: Abre el navegador
```
http://localhost:5173/
```

✅ **¡Listo!**

---

## 🎮 Primeros Pasos

### Opción 1: Circuito Demo (Recomendado)
1. Abre la app
2. Haz click en **"Cargar circuito demo"**
3. Haz click en **INICIAR** (barra lateral)
4. ¡Mira la simulación en tiempo real!

### Opción 2: Crear tu Circuito
1. Arrastra **Batería** desde la barra lateral
2. Arrastra **Resistor**
3. Arrastra **LED**
4. Arrastra **Tierra** (Ground)
5. Selecciona herramienta **Cable** (barra lateral)
6. Conecta terminales azules de componentes
7. Haz click en **INICIAR**
8. ¡El LED debería iluminarse!

---

## 🔧 Funciones Principales

### Barra Superior (Navbar)
| Botón | Función |
|-------|---------|
| **+** | Nuevo circuito |
| **📂** | Abrir circuito (archivo JSON) |
| **💾** | Guardar/Exportar como JSON |
| **↓** | Descargar (mismo que guardar) |
| **∑** | Calculadora (Ley Ohm, etc.) |

### Barra Lateral (Toolbar)
| Elemento | Uso |
|----------|-----|
| **Búsqueda** | Encontrar componentes rápido |
| **Seleccionar** | Herramienta de selección |
| **Cable** | Conectar componentes |
| **Sonda** | Agregar punto de medición |
| **Componentes** | Arrastrar al canvas |
| **INICIAR/DETENER** | Controlar simulación |
| **Undo/Redo** | Deshacer/Rehacer |

### Panel Derecho (Propiedades)
Cuando seleccionas un componente:
- **Parámetros**: Ajusta voltaje, resistencia, capacitancia, etc. (sliders)
- **Mediciones**: Voltaje, corriente, potencia en tiempo real
- **Acciones**: Rotar, Duplicar, Agregar Sonda, Eliminar
- **Multímetro**: Cambiar a vista de medidor digital

### Panel Inferior (Osciloscopio)
- **Gráficas en tiempo real**: Todas las señales
- **Zoom/Pan**: Mouse para zoom, arrastrar para pan
- **Hover**: Pasa el ratón para ver valores exactos
- **Limpiar**: Borra datos y empieza nuevo
- **Sondas**: Click en sonda para ocultar/mostrar

---

## 💾 Guardar y Cargar Circuitos

### Guardar
1. Construye tu circuito
2. Click en botón **💾** (barra superior)
3. Se descarga `circuito_2026-05-27.json`
4. También se auto-guarda en navegador (localStorage)

### Cargar
1. Click en botón **📂** (barra superior)
2. Selecciona archivo `.json`
3. ¡Tu circuito se restaura!

### Auto-guardado
✅ Se guarda automáticamente en el navegador  
Si actualizas página: **Se restaura automáticamente**

---

## 🧮 Calculadora

Acceso: Click **∑ Calculadora** (arriba derecha)

Contiene:
- **Ley de Ohm**: Calcula V, I, R, P
- **Resistencias**: Serie, paralelo, divisor
- **Capacitores**: Cálculos de valores
- **Inductores**: Cálculos de valores
- **Conversores**: Unidades (V, mA, µF, etc.)

---

## 🧪 Testing (Opcional)

### Verificar que todo funciona:
```bash
cd proyectoElectro+
python test_backend.py
```

Debería mostrar:
```
✓ Backend is running
✓ Circuit is valid
✓ Simulation completed successfully
✓ All tests passed!
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
**Solución**: Asegúrate que `python main.py` está corriendo en Terminal B

### "LED no se ilumina"
**Solución**: 
- Verifica que la batería está conectada correctamente
- La corriente debe ser > 1µA para que se ilumine

### "No veo las gráficas"
**Solución**:
- Haz click en **Osciloscopio** (abajo) para abrir
- Las gráficas solo aparecen cuando hay simulación activa

### "Componentes no se mueven"
**Solución**: 
- No estés en herramienta "Cable"
- Cambia a "Seleccionar" (barra lateral)

---

## 🎓 Ejemplo: Circuito Completo

### Construcción paso a paso:

```
1. Arrastra BATERÍA (9V) a la izquierda
2. Arrastra RESISTOR (1kΩ) a la derecha
3. Arrastra LED debajo del resistor
4. Arrastra TIERRA debajo de todo
5. Herramienta CABLE:
   - Conecta + batería → entrada resistor
   - Conecta salida resistor → entrada LED
   - Conecta salida LED → TIERRA
   - Conecta - batería → TIERRA
6. Click INICIAR
```

**Resultado**: LED brilla, gráficas mostrar voltaje y corriente

---

## 📊 Componentes Disponibles

### Fuentes
- Batería (Voltage Source)
- Fuente de corriente (Current Source)

### Pasivos
- Resistor
- Capacitor  
- Inductor
- Potenciómetro

### Semiconductores
- LED
- Diodo
- Transistor

### Lógicos
- Interruptor

### Medidores
- Voltímetro
- Amperímetro

### Especiales
- Tierra (Ground)

---

## 🎯 Tips & Tricks

✨ **Arrastrar**: Click + mantener en componente  
✨ **Múltiple selección**: Shift + Click  
✨ **Eliminar**: Selecciona + Presiona Delete  
✨ **Rotar**: Selecciona + Click "Rotar" en panel derecho  
✨ **Duplicar**: Selecciona + Click "Duplicar"  
✨ **Undo**: Ctrl+Z (o Cmd+Z en Mac)  
✨ **Redo**: Ctrl+Shift+Z  
✨ **Zoom**: Rueda del ratón en canvas  
✨ **Pan**: Click derecho + arrastrar  
✨ **Seleccionar todos**: Ctrl+A  

---

## 📖 Para Más Información

- **MEJORAS.md** - Guía completa de todas las funciones
- **IMPLEMENTACION.md** - Detalles técnicos de los cambios
- **README.md** - Información general del proyecto

---

## 🆘 Soporte Rápido

**Error en backend?**  
```bash
pip install -r requirements.txt --upgrade
python main.py
```

**Limpiar frontend?**  
En navegador: F12 → Application → localStorage → Borrar todo → Recargar

**¿Datos de simulación incorrectos?**
Presiona **Limpiar** en osciloscopio e inicia nueva simulación

---

**¡Felicidades! Ya estás listo para usar LabCircuitos** ⚡

Crea circuitos, simula, mide, calcula. ¡Diviértete! 🎉
