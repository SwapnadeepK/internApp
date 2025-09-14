"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

type ExcelSheets = Record<string, Record<string, unknown>[]>;

export default function SalesDashboard() {
  const [data, setData] = useState<ExcelSheets | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/excel");
      const json: ExcelSheets = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  const sales = data.Sheet1 ?? [];
  const products = data.Sheet2 ?? [];
  const customers = data.Sheet3 ?? [];
  const dates = data.Sheet4 ?? [];
  const misc = data.Sheet5 ?? [];

  const chartData = {
    labels: sales.slice(0, 10).map((s) => String(s.City)),
    datasets: [
      {
        label: "Sales",
        data: sales.slice(0, 10).map((s) => Number(s.Sales)),
        backgroundColor: "rgba(34,197,94,0.7)",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by City</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} />
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Sales Data</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-auto w-full border">
            <thead>
              <tr>
                {sales[0] &&
                  Object.keys(sales[0]).map((key) => (
                    <th key={key} className="border px-2 py-1">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border px-2 py-1">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {products.slice(0, 5).map((p) => (
              <li key={String(p.ID)}>
                {p.Name} - {p.Category}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {customers.slice(0, 5).map((c) => (
              <li key={String(c.ID)}>
                {c.Name} ({c.Segment})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {dates.slice(0, 5).map((d, idx) => (
              <li key={idx}>
                {d["Month Name"]} {d.Year}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Misc */}
      <Card>
        <CardHeader>
          <CardTitle>Misc</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {misc.map((m, idx) => (
              <li key={idx}>
                {m.Column1} → {m.Column2}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
