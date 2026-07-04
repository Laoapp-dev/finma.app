import * as XLSX from "xlsx";

/**
 * Generic export helper. `rows` is an array of flat objects; keys become
 * column headers. Works for the ledger (transactions) as well as any
 * calculator's result set (e.g. NPV's discounted cash flow table).
 */
function buildWorksheet(rows) {
  return XLSX.utils.json_to_sheet(rows);
}

export function exportToCsv(rows, filename = "export.csv") {
  const worksheet = buildWorksheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadBlob(csv, filename, "text/csv;charset=utf-8;");
}

export function exportToExcel(rows, filename = "export.xlsx", sheetName = "Sheet1") {
  const worksheet = buildWorksheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

/** Convenience wrapper specifically for the monthly ledger. */
export function exportLedger(transactions, format = "csv") {
  const rows = transactions.map((tx) => ({
    Date: tx.date,
    Type: tx.type,
    Category: tx.category,
    Description: tx.description,
    Amount: tx.amount,
    Currency: tx.currency,
  }));

  if (format === "excel") {
    exportToExcel(rows, "laokip-ledger.xlsx", "Ledger");
  } else {
    exportToCsv(rows, "laokip-ledger.csv");
  }
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
