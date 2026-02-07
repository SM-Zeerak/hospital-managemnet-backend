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
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    console.log('Sheet name:', sheetName);
    console.log('Total rows:', data.length);
    console.log('\nFirst row (column headers):');
    if (data.length > 0) {
        console.log(JSON.stringify(Object.keys(data[0]), null, 2));
    }
    console.log('\nFirst 3 rows of data:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
} catch (error) {
    console.error('Error reading Excel file:', error.message);
    process.exit(1);
}

