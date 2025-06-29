const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class BusProbabilityEstimator {
    constructor() {
        this.routeCData = null;
        this.expreso9Data = null;
        this.routeCHeadways = null;
        this.expreso9Headways = null;
    }

    // Leer archivos Excel
    loadData() {
        try {
            // Leer datos de la ruta C
            const routeCWorkbook = XLSX.readFile(path.join(__dirname, 'data', 'Datos_C_1.xlsx'));
            const routeCSheet = routeCWorkbook.Sheets[routeCWorkbook.SheetNames[0]];
            this.routeCData = XLSX.utils.sheet_to_json(routeCSheet);

            // Leer datos del Expreso 9
            const expreso9Workbook = XLSX.readFile(path.join(__dirname, 'data', 'Datos_only.xlsx'));
            const expreso9Sheet = expreso9Workbook.Sheets[expreso9Workbook.SheetNames[0]];
            this.expreso9Data = XLSX.utils.sheet_to_json(expreso9Sheet);

            console.log(`✅ Datos cargados: Ruta C (${this.routeCData.length} registros), Expreso 9 (${this.expreso9Data.length} registros)`);
            return true;
        } catch (error) {
            console.error('❌ Error al cargar los datos:', error.message);
            return false;
        }
    }

    // Calcular headways reales para una ruta
    calculateHeadways(data) {
        const headways = [];
        
        // Encontrar todos los minutos donde pasó un bus
        const busMinutes = data
            .map((row, index) => ({ 
                minuto: row['Minuto desde inicio'], 
                bus: row['¿Pasó bus? (Sí/No)'], 
                index 
            }))
            .filter(item => item.bus === 'sí')
            .map(item => item.minuto);

        console.log(`🚌 Minutos con buses: ${busMinutes.join(', ')}`);

        // Calcular headways entre buses consecutivos
        const headwayValues = [];
        for (let i = 1; i < busMinutes.length; i++) {
            const headway = busMinutes[i] - busMinutes[i-1];
            headwayValues.push(headway);
        }

        // Asignar headway a cada minuto
        for (let i = 0; i < data.length; i++) {
            const currentMinute = data[i]['Minuto desde inicio'];
            let assignedHeadway = null;

            // Encontrar el headway que corresponde a este minuto
            for (let j = 0; j < busMinutes.length - 1; j++) {
                if (currentMinute >= busMinutes[j] && currentMinute < busMinutes[j + 1]) {
                    assignedHeadway = headwayValues[j];
                    break;
                }
            }

            // Si el minuto está después del último bus, usar el último headway
            if (assignedHeadway === null && currentMinute >= busMinutes[busMinutes.length - 1]) {
                assignedHeadway = headwayValues[headwayValues.length - 1];
            }

            headways.push({
                minuto: currentMinute,
                headway: assignedHeadway,
                lambda: assignedHeadway ? 1 / assignedHeadway : null
            });
        }

        return headways;
    }

    // Calcular probabilidades usando distribución exponencial
    calculateProbabilities(lambda, timeIntervals = [1, 5, 10, 15]) {
        if (lambda === null || lambda <= 0) {
            return {
                probNext1: null,
                probNext5: null,
                probNext10: null,
                probNext15: null
            };
        }

        const probabilities = {};
        timeIntervals.forEach(interval => {
            // P(bus en t minutos) = 1 - exp(-λ * t)
            probabilities[`probNext${interval}`] = 1 - Math.exp(-lambda * interval);
        });

        return probabilities;
    }

    // Procesar datos y calcular headways
    processData() {
        console.log('\n📊 Procesando datos de la Ruta C...');
        this.routeCHeadways = this.calculateHeadways(this.routeCData);

        console.log('\n📊 Procesando datos del Expreso 9...');
        this.expreso9Headways = this.calculateHeadways(this.expreso9Data);

        console.log('\n✅ Procesamiento completado');
    }

    // Obtener estimación para un minuto específico
    getEstimation(minuto, route = 'C') {
        const headways = route === 'C' ? this.routeCHeadways : this.expreso9Headways;
        const data = route === 'C' ? this.routeCData : this.expreso9Data;
        
        const minuteData = headways.find(h => h.minuto === minuto);
        
        if (!minuteData) {
            return {
                error: `Minuto ${minuto} no encontrado en los datos de la ruta ${route}`,
                minuto: minuto,
                ruta: route
            };
        }

        const probabilities = this.calculateProbabilities(minuteData.lambda);

        return {
            minuto: minuto,
            ruta: route,
            lambda: minuteData.lambda ? parseFloat(minuteData.lambda.toFixed(3)) : null,
            headway: minuteData.headway,
            ...probabilities
        };
    }

    // Generar estimaciones para todos los minutos
    generateAllEstimations(route = 'C') {
        const headways = route === 'C' ? this.routeCHeadways : this.expreso9Headways;
        const estimations = [];

        headways.forEach(minuteData => {
            const probabilities = this.calculateProbabilities(minuteData.lambda);
            
            estimations.push({
                minuto: minuteData.minuto,
                ruta: route,
                lambda: minuteData.lambda ? parseFloat(minuteData.lambda.toFixed(3)) : null,
                headway: minuteData.headway,
                ...probabilities
            });
        });

        return estimations;
    }

    // Guardar resultados en JSON
    saveResults(estimations, filename) {
        const outputPath = path.join(__dirname, 'results', filename);
        
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(estimations, null, 2));
        console.log(`💾 Resultados guardados en: ${outputPath}`);
    }

    // Ejecutar análisis completo
    runAnalysis() {
        console.log('🚌 Iniciando análisis de probabilidades de buses...\n');

        // Cargar datos
        if (!this.loadData()) {
            return;
        }

        // Procesar datos
        this.processData();

        // Generar estimaciones para ambas rutas
        console.log('\n📈 Generando estimaciones...');
        
        const routeCEstimations = this.generateAllEstimations('C');
        const expreso9Estimations = this.generateAllEstimations('Expreso9');

        // Guardar resultados
        this.saveResults(routeCEstimations, 'ruta-c-estimations.json');
        this.saveResults(expreso9Estimations, 'expreso-9-estimations.json');

        // Mostrar ejemplo para minuto 13
        console.log('\n📋 Ejemplo de estimación para minuto 13:');
        console.log('Ruta C:');
        console.log(JSON.stringify(this.getEstimation(13, 'C'), null, 2));
        console.log('\nExpreso 9:');
        console.log(JSON.stringify(this.getEstimation(13, 'Expreso9'), null, 2));

        console.log('\n✅ Análisis completado exitosamente!');
    }
}

// Función principal
function main() {
    const estimator = new BusProbabilityEstimator();
    estimator.runAnalysis();
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
    main();
}

module.exports = BusProbabilityEstimator; 