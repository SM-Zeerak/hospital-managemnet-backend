import XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = join(__dirname, '../../docs/Carrier_grid1_20251208T144235.xlsx');

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get all column headers
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headers = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
        headers.push(cell ? cell.v : `__EMPTY_${C}`);
    }
    
    console.log('Column headers:', headers);
    console.log('Total columns:', headers.length);
    
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
    console.log('\nTotal rows:', data.length);
    
    // Show first data row with all fields
    if (data.length > 1) {
        console.log('\nFirst data row:');
        const firstRow = data[1];
        Object.keys(firstRow).forEach(key => {
            if (firstRow[key]) {
                console.log(`  ${key}: ${firstRow[key]}`);
            }
        });
    }
    
    // Count non-empty carriers
    const carriers = data.slice(1).filter(row => row.Carriers && row.Carriers.trim());
    console.log(`\nValid carrier rows: ${carriers.length}`);
    
} catch (error) {
    console.error('Error reading Excel file:', error.message);
    process.exit(1);
}

