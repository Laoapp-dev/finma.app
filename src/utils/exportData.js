// xlsx (SheetJS) is a large dependency (~600KB) only needed at the moment
// someone clicks "Export". Loading it dynamically keeps it out of the
// initial bundle entirely, which is one of the main levers for a faster
// first paint / less "slow to show app" delay.
async function getXLSX() {
  const mod = await import("xlsx");
  return mod;
}

/**
 * Generic export helper. `rows` is an array of flat objects; keys become
 * column headers. Works for the ledger (transactions) as well as any
 * calculator's result set (e.g. NPV's discounted cash flow table).
 */
async function buildWorksheet(rows) {
  const XLSX = await getXLSX();
  return { XLSX, worksheet: XLSX.utils.json_to_sheet(rows) };
}

export async function exportToCsv(rows, filename = "export.csv") {
  const { XLSX, worksheet } = await buildWorksheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  downloadBlob(csv, filename, "text/csv;charset=utf-8;");
}

export async function exportToExcel(rows, filename = "export.xlsx", sheetName = "Sheet1") {
  const { XLSX, worksheet } = await buildWorksheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

/** Convenience wrapper specifically for the monthly ledger. */
export async function exportLedger(transactions, format = "csv") {
  const rows = transactions.map((tx) => ({
    Date: tx.date,
    Type: tx.type,
    Category: tx.category,
    Description: tx.description,
    Amount: tx.amount,
    Currency: tx.currency,
  }));

  if (format === "excel") {
    await exportToExcel(rows, "finma-ledger.xlsx", "Ledger");
  } else {
    await exportToCsv(rows, "finma-ledger.csv");
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
