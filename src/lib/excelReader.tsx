import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export type ExcelSheets = Record<string, Record<string, unknown>[]>;

export function readExcelFile(): ExcelSheets {
  const filePath = path.join(process.cwd(), "public/db_excel/SalesData1.xlsx");
  const fileBuffer = fs.readFileSync(filePath);

  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetsData: ExcelSheets = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    sheetsData[sheetName] = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
  });

  return sheetsData;
}
