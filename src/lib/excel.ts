import * as XLSX from 'xlsx';

/**
 * Generates an Excel template and triggers download in the browser
 */
export function downloadExcelTemplate(
  filename: string, 
  headers: string[], 
  exampleRows?: any[][]
) {
  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    ...(exampleRows || [])
  ]);

  // Set column widths
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // Write and download
  XLSX.writeFile(wb, `${filename}_template.xlsx`);
}

/**
 * Parses an Excel file (File object from input) into JSON
 */
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
