// src/app/page.tsx
"use client";

import React from "react";
import SalesDashboard from "./salesDashboard";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to My Dashboard</h1>
      <SalesDashboard />
    </main>
  );
}
