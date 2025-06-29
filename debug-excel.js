const XLSX = require('xlsx');
const path = require('path');

function debugExcelFiles() {
    console.log('🔍 Debugging Excel files structure...\n');
    
    // Debug Ruta C
    console.log('📊 Datos_C_1.xlsx (Ruta C):');
    try {
        const routeCWorkbook = XLSX.readFile(path.join(__dirname, 'data', 'Datos_C_1.xlsx'));
        const routeCSheet = routeCWorkbook.Sheets[routeCWorkbook.SheetNames[0]];
        const routeCData = XLSX.utils.sheet_to_json(routeCSheet);
        
        console.log(`- Número de registros: ${routeCData.length}`);
        if (routeCData.length > 0) {
            console.log('- Columnas disponibles:');
            Object.keys(routeCData[0]).forEach((col, index) => {
                console.log(`  ${index + 1}. "${col}"`);
            });
            
            console.log('\n- Primeros 3 registros:');
            routeCData.slice(0, 3).forEach((row, index) => {
                console.log(`  Registro ${index + 1}:`, row);
            });
        }
    } catch (error) {
        console.error('❌ Error al leer Datos_C_1.xlsx:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Debug Expreso 9
    console.log('📊 Datos_only.xlsx (Expreso 9):');
    try {
        const expreso9Workbook = XLSX.readFile(path.join(__dirname, 'data', 'Datos_only.xlsx'));
        const expreso9Sheet = expreso9Workbook.Sheets[expreso9Workbook.SheetNames[0]];
        const expreso9Data = XLSX.utils.sheet_to_json(expreso9Sheet);
        
        console.log(`- Número de registros: ${expreso9Data.length}`);
        if (expreso9Data.length > 0) {
            console.log('- Columnas disponibles:');
            Object.keys(expreso9Data[0]).forEach((col, index) => {
                console.log(`  ${index + 1}. "${col}"`);
            });
            
            console.log('\n- Primeros 3 registros:');
            expreso9Data.slice(0, 3).forEach((row, index) => {
                console.log(`  Registro ${index + 1}:`, row);
            });
        }
    } catch (error) {
        console.error('❌ Error al leer Datos_only.xlsx:', error.message);
    }
}

debugExcelFiles(); 