import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

//
// Typed interfaces (same as your Dashboard)
//
interface Sale {
  City: string;
  Sales: number;
}

interface Product {
  ID: string | number;
  Name: string;
  Category: string;
}

interface Customer {
  ID: string | number;
  Name: string;
  Segment: string;
}

interface DateRow {
  "Month Name": string;
  Year: number;
}

interface MiscRow {
  Column1: string;
  Column2: string;
}

interface ExcelSheets {
  Sheet1: Sale[];
  Sheet2: Product[];
  Sheet3: Customer[];
  Sheet4: DateRow[];
  Sheet5: MiscRow[];
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "db_excel", "SalesData1.xlsx");
    const fileBuffer = fs.readFileSync(filePath);

    // Read Excel file
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Convert sheets to JSON
    const sheets: ExcelSheets = {
      Sheet1: XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"] || {}),
      Sheet2: XLSX.utils.sheet_to_json(workbook.Sheets["Sheet2"] || {}),
      Sheet3: XLSX.utils.sheet_to_json(workbook.Sheets["Sheet3"] || {}),
      Sheet4: XLSX.utils.sheet_to_json(workbook.Sheets["Sheet4"] || {}),
      Sheet5: XLSX.utils.sheet_to_json(workbook.Sheets["Sheet5"] || {}),
    };

    return NextResponse.json(sheets);
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return NextResponse.json(
      { error: "Failed to load Excel data" },
      { status: 500 }
    );
  }
}
