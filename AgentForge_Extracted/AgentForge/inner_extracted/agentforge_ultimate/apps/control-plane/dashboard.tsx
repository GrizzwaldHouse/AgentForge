
"use client";
import { useState } from "react";

export default function Dashboard() {
  const [metrics] = useState({ events: 100, errors: 2 });

  return (
    <div>
      <h2>Observability Dashboard</h2>
      <p>Events: {metrics.events}</p>
      <p>Errors: {metrics.errors}</p>
    </div>
  );
}
