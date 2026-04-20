const XLSX = require('xlsx');
const path = require('path');

function generateExcel() {
  const headers = [
    "Nama Lengkap", "Email", "No HP", "Tahun Masuk", "Tahun Lulus", 
    "Jenjang Terakhir", "Status Marital", "Domisili", "Provinsi/Negara", "Kota/State",
    "Pekerjaan", "Posisi", "Universitas", "Jurusan"
  ];
  const data = [headers];

  const firstNames = ["Andi", "Budi", "Cici", "Dedi", "Eni", "Feri", "Gani", "Hani", "Iwan", "Jati"];
  const lastNames = ["Saputra", "Wijaya", "Kusuma", "Hidayat", "Santoso", "Pratama", "Hutapea", "Sitorus", "Lubis", "Nasution"];

  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const isDomestic = i % 5 !== 0;

    data.push([
      `${fn} ${ln} ${i}`,
      `full_test_alumni_${i}@example.com`,
      `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      2010 + Math.floor(Math.random() * 8),
      2014 + Math.floor(Math.random() * 8),
      i % 2 === 0 ? "SMA_12" : "SMA_11",
      "Belum Menikah",
      isDomestic ? "DOMESTIC" : "FOREIGN",
      isDomestic ? "Jawa Barat" : "United States",
      isDomestic ? "Bandung" : "California",
      `PT. Contoh Ke-${i}`,
      "Manager",
      "ITB",
      "Teknik Industri"
    ]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "AlumniFull");

  const filePath = path.join(process.cwd(), 'alumni_full_test_100.xlsx');
  XLSX.writeFile(wb, filePath);
  console.log(`Full Excel file generated at: ${filePath}`);
}

generateExcel();
