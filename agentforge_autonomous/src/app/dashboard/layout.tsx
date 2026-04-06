import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | AgentForge",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
