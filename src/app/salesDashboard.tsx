"use client";

import React from "react";

interface Sale {
  id: number;
  product: string;
  amount: number;
}

const salesData: Sale[] = [
  { id: 1, product: "Laptop", amount: 1200 },
  { id: 2, product: "Phone", amount: 800 },
  { id: 3, product: "Tablet", amount: 600 },
];

const SalesDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales Dashboard</h1>
      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">ID</th>
            <th className="border border-gray-400 px-4 py-2">Product</th>
            <th className="border border-gray-400 px-4 py-2">Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale.id}>
              <td className="border border-gray-400 px-4 py-2">{sale.id}</td>
              <td className="border border-gray-400 px-4 py-2">{sale.product}</td>
              <td className="border border-gray-400 px-4 py-2">{sale.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesDashboard;
