# Estimador de Probabilidades de Buses

Este estimador calcula la probabilidad de llegada de buses en los próximos 1, 5, 10 y 15 minutos basándose en **headways reales** calculados minuto a minuto, utilizando la distribución exponencial.

## Metodología

### 1. Cálculo de Headways Reales
- Se identifican todos los minutos donde pasó un bus (columna "¿Bus?" = "Sí")
- Se calculan las diferencias de tiempo entre buses consecutivos
- Cada minuto se le asigna el headway correspondiente según su posición temporal

### 2. Cálculo de Tasa de Llegada (λ)
- Para cada minuto `m`: `λ(m) = 1 / headway_asignado`
- La tasa varía minuto a minuto, no es un promedio global

### 3. Probabilidades con Distribución Exponencial
- `P(bus en t minutos) = 1 - exp(-λ(m) * t)`
- Se calculan para t = 1, 5, 10, 15 minutos


## Archivos Generados

El script genera dos archivos JSON con todas las estimaciones:

- `results/ruta-c-estimations.json` - Estimaciones para la Ruta C
- `results/expreso-9-estimations.json` - Estimaciones para el Expreso 9

## Uso Programático

```javascript
const BusProbabilityEstimator = require('./bus-probability-estimator');

const estimator = new BusProbabilityEstimator();

estimator.loadData();
estimator.processData();

const estimation = estimator.getEstimation(13, 'C');
console.log(estimation);
```

## Formato de Salida

```json
{
  "minuto": 13,
  "ruta": "C",
  "lambda": 0.111,
  "headway": 9,
  "probNext1": 0.105,
  "probNext5": 0.422,
  "probNext10": 0.653,
  "probNext15": 0.777
}
```

### Campos:
- `minuto`: Minuto desde el inicio
- `ruta`: "C" o "Expreso9"
- `lambda`: Tasa de llegada (1/headway)
- `headway`: Headway asignado al minuto
- `probNext1`: Probabilidad de bus en 1 minuto
- `probNext5`: Probabilidad de bus en 5 minutos
- `probNext10`: Probabilidad de bus en 10 minutos
- `probNext15`: Probabilidad de bus en 15 minutos

## Estructura de Datos Esperada

Los archivos Excel deben tener las siguientes columnas:
- **A**: Minuto desde inicio
- **B**: Hora aproximada
- **C**: Personas que llegaron
- **D**: Personas que subieron
- **E**: ¿Bus? ("Sí" o "No")
- **F**: Personas que quedaron en cola

## Casos Especiales

- Si un minuto no tiene headway asignado (por falta de buses antes o después), las probabilidades serán `null`
- Los minutos después del último bus usan el último headway disponible

## Ejemplo de Cálculo

Para el minuto 13 con headway = 9:
- `λ = 1/9 = 0.111`
- `P(bus en 1 min) = 1 - exp(-0.111 * 1) = 0.105`
- `P(bus en 5 min) = 1 - exp(-0.111 * 5) = 0.422`
- `P(bus en 10 min) = 1 - exp(-0.111 * 10) = 0.653`
- `P(bus en 15 min) = 1 - exp(-0.111 * 15) = 0.777`

## Diferencias entre Rutas

- **Ruta C**: Usa datos de `Datos_C_1.xlsx`
- **Expreso 9**: Usa datos de `Datos_only.xlsx`
- Cada ruta tiene sus propios headways y probabilidades
- Los patrones de llegada pueden variar significativamente entre rutas 