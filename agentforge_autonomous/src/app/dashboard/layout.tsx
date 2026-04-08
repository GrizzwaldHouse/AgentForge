"use client";

import { DemoModeProvider } from "@/hooks/use-demo-mode";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoModeProvider>
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    </DemoModeProvider>
  );
}
