"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface Sale {
  "Order ID": string;
  Sales: number;
  Profit: number;
  Cost: number;
  Quantity: number;
  "Order Date": string;
  City: string;
  Country: string;
  Region: string;
  "Ship Mode": string;
  "Ship Date": string;
  State: string;
  lon: number;
  lat: number;
  "Customer ID": number;
  "Product ID": number;
}

export default function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      // Fetch the Excel file from the public folder
      const response = await fetch("/db_excel/SalesData1.xlsx");
      const arrayBuffer = await response.arrayBuffer();

      // Read workbook from ArrayBuffer
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get the first sheet dynamically
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const firstSheet: Sale[] = XLSX.utils.sheet_to_json<Sale>(worksheet);

      if (firstSheet.length > 0) {
        setColumns(Object.keys(firstSheet[0]));
      }

      setSales(firstSheet);
    }

    loadData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sales Data</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="border px-2 py-1">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} className="border px-2 py-1">
                    {row[col as keyof Sale]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
