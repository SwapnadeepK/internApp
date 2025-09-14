"use client";

import { useEffect, useState } from "react";

interface RowData {
  [key: string]: string | number;
}

export default function SalesTable() {
  const [rows, setRows] = useState<RowData[]>([]);

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => setRows(data.rows || []));
  }, []);

  if (rows.length === 0) {
    return <p>No data found.</p>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <table className="table-auto border-collapse border border-gray-400 w-full">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} className="border border-gray-400 px-2 py-1">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {headers.map((header) => (
              <td key={header} className="border border-gray-400 px-2 py-1">
                {row[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
