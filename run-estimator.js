const BusProbabilityEstimator = require('./bus-probability-estimator');

async function runExamples() {
    console.log('🚌 Ejemplos de uso del Estimador de Probabilidades de Buses\n');
    
    const estimator = new BusProbabilityEstimator();
    
    // Cargar datos
    if (!estimator.loadData()) {
        console.error('❌ No se pudieron cargar los datos');
        return;
    }
    
    // Procesar datos
    estimator.processData();
    
    // Ejemplos de consultas específicas
    const testMinutes = [5, 10, 15, 20, 25];
    
    console.log('📊 Ejemplos de estimaciones:\n');
    
    testMinutes.forEach(minuto => {
        console.log(`\n--- Minuto ${minuto} ---`);
        
        // Ruta C
        const routeC = estimator.getEstimation(minuto, 'C');
        console.log('Ruta C:');
        console.log(JSON.stringify(routeC, null, 2));
        
        // Expreso 9
        const expreso9 = estimator.getEstimation(minuto, 'Expreso9');
        console.log('\nExpreso 9:');
        console.log(JSON.stringify(expreso9, null, 2));
    });
    
    // Generar archivos completos
    console.log('\n📁 Generando archivos completos...');
    const routeCEstimations = estimator.generateAllEstimations('C');
    const expreso9Estimations = estimator.generateAllEstimations('Expreso9');
    
    estimator.saveResults(routeCEstimations, 'ruta-c-estimations.json');
    estimator.saveResults(expreso9Estimations, 'expreso-9-estimations.json');
    
    console.log('\n✅ Ejemplos completados!');
}

// Ejecutar ejemplos
runExamples().catch(console.error); 