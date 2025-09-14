import { NextResponse } from "next/server";
import { readExcelFile } from "@/lib/excelReader";

export async function GET() {
  const data = readExcelFile();
  return NextResponse.json(data);
}
