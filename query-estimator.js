const BusProbabilityEstimator = require('./bus-probability-estimator');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function formatProbability(prob) {
    if (prob === null) return 'N/A';
    return `${(prob * 100).toFixed(1)}%`;
}

function displayEstimation(estimation) {
    console.log('\n📊 Estimación:');
    console.log(`Minuto: ${estimation.minuto}`);
    console.log(`Ruta: ${estimation.ruta}`);
    console.log(`Headway: ${estimation.headway || 'N/A'} minutos`);
    console.log(`Tasa de llegada (λ): ${estimation.lambda || 'N/A'}`);
    console.log('\n🚌 Probabilidades de llegada:');
    console.log(`  • En 1 minuto:  ${formatProbability(estimation.probNext1)}`);
    console.log(`  • En 5 minutos: ${formatProbability(estimation.probNext5)}`);
    console.log(`  • En 10 minutos: ${formatProbability(estimation.probNext10)}`);
    console.log(`  • En 15 minutos: ${formatProbability(estimation.probNext15)}`);
    
    if (estimation.error) {
        console.log(`\n⚠️  ${estimation.error}`);
    }
}

async function queryEstimator() {
    console.log('🚌 Consulta Interactiva del Estimador de Buses\n');
    
    const estimator = new BusProbabilityEstimator();
    
    // Cargar datos
    if (!estimator.loadData()) {
        console.error('❌ No se pudieron cargar los datos');
        rl.close();
        return;
    }
    
    // Procesar datos
    estimator.processData();
    
    console.log('✅ Datos cargados y procesados\n');
    
    while (true) {
        try {
            const minuto = await new Promise((resolve) => {
                rl.question('Ingresa el minuto (o "salir" para terminar): ', resolve);
            });
            
            if (minuto.toLowerCase() === 'salir') {
                break;
            }
            
            const minutoNum = parseInt(minuto);
            if (isNaN(minutoNum) || minutoNum < 0) {
                console.log('❌ Por favor ingresa un número válido mayor o igual a 0');
                continue;
            }
            
            const ruta = await new Promise((resolve) => {
                rl.question('Ingresa la ruta (C o Expreso9): ', resolve);
            });
            
            if (!['c', 'expreso9'].includes(ruta.toLowerCase())) {
                console.log('❌ Por favor ingresa "C" o "Expreso9"');
                continue;
            }
            
            const routeKey = ruta.toLowerCase() === 'c' ? 'C' : 'Expreso9';
            const estimation = estimator.getEstimation(minutoNum, routeKey);
            
            displayEstimation(estimation);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
    
    console.log('\n👋 ¡Hasta luego!');
    rl.close();
}

// Ejecutar consulta interactiva
queryEstimator().catch(console.error); 