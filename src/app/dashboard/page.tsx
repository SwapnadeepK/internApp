"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

//
// ✅ Typed interfaces for each sheet
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

//
// ✅ Utility functions
//
function groupSalesByCity(sales: Sale[]): { city: string; total: number }[] {
  const grouped: Record<string, number> = {};
  for (const row of sales) {
    grouped[row.City] = (grouped[row.City] || 0) + row.Sales;
  }
  return Object.entries(grouped).map(([city, total]) => ({ city, total }));
}

function groupProductsByCategory(products: Product[]): { category: string; count: number }[] {
  const grouped: Record<string, number> = {};
  for (const p of products) {
    grouped[p.Category] = (grouped[p.Category] || 0) + 1;
  }
  return Object.entries(grouped).map(([category, count]) => ({ category, count }));
}

function groupCustomersBySegment(customers: Customer[]): { segment: string; count: number }[] {
  const grouped: Record<string, number> = {};
  for (const c of customers) {
    grouped[c.Segment] = (grouped[c.Segment] || 0) + 1;
  }
  return Object.entries(grouped).map(([segment, count]) => ({ segment, count }));
}

function groupDates(dates: DateRow[]): { year: number; month: string; count: number }[] {
  const grouped: Record<string, number> = {};
  for (const d of dates) {
    const key = `${d.Year}-${d["Month Name"]}`;
    grouped[key] = (grouped[key] || 0) + 1;
  }
  return Object.entries(grouped).map(([key, count]) => {
    const [year, month] = key.split("-");
    return { year: Number(year), month, count };
  });
}

function groupMisc(misc: MiscRow[]): { column1: string; count: number }[] {
  const grouped: Record<string, number> = {};
  for (const m of misc) {
    grouped[m.Column1] = (grouped[m.Column1] || 0) + 1;
  }
  return Object.entries(grouped).map(([column1, count]) => ({ column1, count }));
}

//
// ✅ Reusable sort & slice helper
//
function sortAndSlice<T, K extends keyof T>(
  data: T[],
  key: K,
  order: "asc" | "desc",
  view: "top" | "bottom",
  limit = 10
): T[] {
  // Ensure the field is treated as a number
  const sorted = [...data].sort((a, b) => {
    const aVal = Number(a[key]);
    const bVal = Number(b[key]);
    return order === "asc" ? aVal - bVal : bVal - aVal;
  });

  return sorted.slice(0, limit);
}


//
// ✅ Dashboard Component
//
export default function Dashboard() {
  const [data, setData] = useState<ExcelSheets | null>(null);

  // State for toggling
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"top" | "bottom">("top");

  const [productOrder, setProductOrder] = useState<"asc" | "desc">("desc");
  const [productView, setProductView] = useState<"top" | "bottom">("top");

  const [customerOrder, setCustomerOrder] = useState<"asc" | "desc">("desc");
  const [customerView, setCustomerView] = useState<"top" | "bottom">("top");

  const [dateOrder, setDateOrder] = useState<"asc" | "desc">("desc");
  const [dateView, setDateView] = useState<"top" | "bottom">("top");

  const [miscOrder, setMiscOrder] = useState<"asc" | "desc">("desc");
  const [miscView, setMiscView] = useState<"top" | "bottom">("top");

  const [salesView, setSalesView] = useState<"top" | "bottom" | "all">("top");

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/excel");
      const json: ExcelSheets = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  // Grouped data
  const groupedSales = groupSalesByCity(data.Sheet1 ?? []);
  const groupedProducts = groupProductsByCategory(data.Sheet2 ?? []);
  const groupedCustomers = groupCustomersBySegment(data.Sheet3 ?? []);
  const groupedDates = groupDates(data.Sheet4 ?? []);
  const groupedMisc = groupMisc(data.Sheet5 ?? []);

  // Sorted & sliced data
  const sortedSales = sortAndSlice(groupedSales, "total", order, view);
  const sortedProducts = sortAndSlice(groupedProducts, "count", productOrder, productView);
  const sortedCustomers = sortAndSlice(groupedCustomers, "count", customerOrder, customerView);
  const sortedDates = sortAndSlice(groupedDates, "count", dateOrder, dateView);
  const sortedMisc = sortAndSlice(groupedMisc, "count", miscOrder, miscView);

  const salesForChart = (() => {
  if (salesView === "top") {
    return [...groupedSales]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }
  if (salesView === "bottom") {
    return [...groupedSales]
      .sort((a, b) => a.total - b.total)
      .slice(0, 10);
  }
  return groupedSales; // all
})();

const chartData = {
  labels: salesForChart.map((s) => s.city),
  datasets: [
    {
      label: "Total Sales",
      data: salesForChart.map((s) => s.total),
      backgroundColor: "rgba(255, 0, 0, 0.8)", // bright red with slight transparency
      borderColor: "rgba(200, 0, 0, 1)",       // optional: solid red border
      borderWidth: 1,
    },
  ],
};


  return (
   <><div className="flex justify-center w-full">
      {/* Sales Chart - half width, centered */}
      <Card className="w-full md:w-1/2">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>Sales by City</CardTitle>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              onClick={() => setSalesView("top")}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Top 10
            </button>
            <button
              onClick={() => setSalesView("bottom")}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Bottom 10
            </button>
            <button
              onClick={() => setSalesView("all")}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              All Sales
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} />
        </CardContent>
      </Card>
    </div><div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Sales Table */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Sales by City (Aggregated)</CardTitle>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => {
                  setView("top");
                  setOrder("desc");
                } }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Top 10
              </button>
              <button
                onClick={() => {
                  setView("bottom");
                  setOrder("asc");
                } }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Bottom 10
              </button>
              <button
                onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sort: {order === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">City</th>
                  <th className="border px-2 py-1">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{row.city}</td>
                    <td className="border px-2 py-1">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold bg-gray-100">
                  <td className="border px-2 py-1 text-right">Grand Total</td>
                  <td className="border px-2 py-1">
                    {groupedSales.reduce((sum, r) => sum + r.total, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Products (By Category)</CardTitle>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => {
                  setProductView("top");
                  setProductOrder("desc");
                } }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Top 10
              </button>
              <button
                onClick={() => {
                  setProductView("bottom");
                  setProductOrder("asc");
                } }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Bottom 10
              </button>
              <button
                onClick={() => setProductOrder(productOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sort: {productOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Category</th>
                  <th className="border px-2 py-1"># Products</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{row.category}</td>
                    <td className="border px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100">
                  <td className="border px-2 py-1">Grand Total</td>
                  <td className="border px-2 py-1">
                    {groupedProducts.reduce((acc, r) => acc + r.count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Customers (By Segment)</CardTitle>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => {
                  setCustomerView("top");
                  setCustomerOrder("desc");
                } }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Top 10
              </button>
              <button
                onClick={() => {
                  setCustomerView("bottom");
                  setCustomerOrder("asc");
                } }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Bottom 10
              </button>
              <button
                onClick={() => setCustomerOrder(customerOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sort: {customerOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Segment</th>
                  <th className="border px-2 py-1"># Customers</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{row.segment}</td>
                    <td className="border px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100">
                  <td className="border px-2 py-1">Grand Total</td>
                  <td className="border px-2 py-1">
                    {groupedCustomers.reduce((acc, r) => acc + r.count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Dates Table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Dates (By Year/Month)</CardTitle>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => {
                  setDateView("top");
                  setDateOrder("desc");
                } }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Top 10
              </button>
              <button
                onClick={() => {
                  setDateView("bottom");
                  setDateOrder("asc");
                } }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Bottom 10
              </button>
              <button
                onClick={() => setDateOrder(dateOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sort: {dateOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Year</th>
                  <th className="border px-2 py-1">Month</th>
                  <th className="border px-2 py-1"># Entries</th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{row.year}</td>
                    <td className="border px-2 py-1">{row.month}</td>
                    <td className="border px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100">
                  <td className="border px-2 py-1" colSpan={2}>
                    Grand Total
                  </td>
                  <td className="border px-2 py-1">
                    {groupedDates.reduce((acc, r) => acc + r.count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Misc Table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Misc (By Column1)</CardTitle>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => {
                  setMiscView("top");
                  setMiscOrder("desc");
                } }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Top 10
              </button>
              <button
                onClick={() => {
                  setMiscView("bottom");
                  setMiscOrder("asc");
                } }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Bottom 10
              </button>
              <button
                onClick={() => setMiscOrder(miscOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sort: {miscOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Column1</th>
                  <th className="border px-2 py-1"># Entries</th>
                </tr>
              </thead>
              <tbody>
                {sortedMisc.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{row.column1}</td>
                    <td className="border px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100">
                  <td className="border px-2 py-1">Grand Total</td>
                  <td className="border px-2 py-1">
                    {groupedMisc.reduce((acc, r) => acc + r.count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div></>
  );
}
