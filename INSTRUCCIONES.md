# Instrucciones de Uso - Estimador de Probabilidades de Buses

## Resumen

Este sistema calcula la probabilidad de llegada de buses en los próximos 1, 5, 10 y 15 minutos basándose en **headways reales** calculados minuto a minuto, utilizando la distribución exponencial.

## Scripts Disponibles

### 1. `bus-probability-estimator.js` - Script Principal
**Uso:** `node bus-probability-estimator.js`

- Procesa ambos archivos Excel (Ruta C y Expreso 9)
- Calcula headways reales minuto a minuto
- Genera archivos JSON con todas las estimaciones
- Muestra ejemplo para minuto 13

### 2. `run-estimator.js` - Ejemplos de Uso
**Uso:** `node run-estimator.js`

- Demuestra el uso del estimador
- Muestra ejemplos para minutos específicos (5, 10, 15, 20, 25)
- Genera archivos completos de resultados

### 3. `query-estimator.js` - Consulta Interactiva
**Uso:** `node query-estimator.js`

- Permite consultar estimaciones específicas
- Interfaz interactiva para ingresar minuto y ruta
- Muestra resultados formateados con porcentajes

### 4. `debug-excel.js` - Debug de Archivos
**Uso:** `node debug-excel.js`

- Examina la estructura de los archivos Excel
- Muestra nombres de columnas y primeros registros
- Útil para verificar la estructura de datos

## Archivos de Datos

### Entrada (Excel):
- `data/Datos_C_1.xlsx` - Datos de la Ruta C
- `data/Datos_only.xlsx` - Datos del Expreso 9

### Salida (JSON):
- `results/ruta-c-estimations.json` - Estimaciones completas Ruta C
- `results/expreso-9-estimations.json` - Estimaciones completas Expreso 9

## Metodología

### 1. Cálculo de Headways
```
Minutos con buses: [1, 4, 8, 9, 12, 19, ...]
Headways: [3, 4, 1, 3, 7, ...]
```

### 2. Asignación de Headway por Minuto
- Cada minuto se le asigna el headway del intervalo en el que se encuentra
- Ejemplo: Minuto 13 está entre buses 12 y 19 → headway = 7

### 3. Cálculo de Probabilidades
```
λ = 1 / headway
P(bus en t minutos) = 1 - exp(-λ * t)
```

## Formato de Salida

```json
{
  "minuto": 13,
  "ruta": "C",
  "lambda": 0.143,
  "headway": 7,
  "probNext1": 0.133,
  "probNext5": 0.510,
  "probNext10": 0.760,
  "probNext15": 0.883
}
```

## Uso Programático

```javascript
const BusProbabilityEstimator = require('./bus-probability-estimator');

const estimator = new BusProbabilityEstimator();
estimator.loadData();
estimator.processData();

// Obtener estimación específica
const estimation = estimator.getEstimation(13, 'C');
console.log(estimation);

// Generar todas las estimaciones
const allEstimations = estimator.generateAllEstimations('C');
```

## 📈 Ejemplos de Resultados

### Ruta C - Minuto 13:
- **Headway:** 7 minutos
- **λ:** 0.143
- **P(bus en 1 min):** 13.3%
- **P(bus en 5 min):** 51.0%
- **P(bus en 10 min):** 76.0%
- **P(bus en 15 min):** 88.3%

### Expreso 9 - Minuto 13:
- **Headway:** 10 minutos
- **λ:** 0.100
- **P(bus en 1 min):** 9.5%
- **P(bus en 5 min):** 39.3%
- **P(bus en 10 min):** 63.2%
- **P(bus en 15 min):** 77.7%


## Diferencias entre Rutas

| Aspecto | Ruta C | Expreso 9 |
|---------|--------|-----------|
| **Frecuencia promedio** | Más frecuente | Menos frecuente |
| **Patrón de llegada** | Más irregular | Más regular |
| **Headways típicos** | 1-7 minutos | 3-10 minutos |

## Verificación de Datos

Para verificar que los datos se están leyendo correctamente:

```bash
node debug-excel.js
```

Esto mostrará:
- Número de registros en cada archivo
- Nombres de columnas disponibles
- Primeros registros como ejemplo

## Notas Importantes

1. **No se usa interpolación:** Solo headways basados en observación directa
2. **Cada minuto tiene su propio λ:** No se usan promedios globales
3. **Distribución exponencial:** Asume llegadas aleatorias entre buses
4. **Datos reales:** Basado en observaciones minuto a minuto reales

