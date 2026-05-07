"use client";

import { Suspense, lazy } from "react";
import { DemoModeProvider } from "@/hooks/use-demo-mode";

const SplineBackground = lazy(() => import("@/components/workflows/SplineBackground"));

function GradientMeshFallback() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "#0d0a14" }} />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse at 20% 20%, rgba(140,100,255,0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 80%, rgba(100,200,180,0.12) 0%, transparent 60%)",
            "radial-gradient(ellipse at 50% 0%, rgba(200,160,255,0.10) 0%, transparent 50%)",
          ].join(", "),
        }}
      />
    </>
  );
}

export default function WorkflowsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoModeProvider>
      <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a14" }}>
        <Suspense fallback={<GradientMeshFallback />}>
          <SplineBackground />
        </Suspense>

        {/* Gradient mesh overlay — always rendered above Spline */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse at 20% 20%, rgba(140,100,255,0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse at 80% 80%, rgba(100,200,180,0.12) 0%, transparent 60%)",
              "radial-gradient(ellipse at 50% 0%, rgba(200,160,255,0.10) 0%, transparent 50%)",
            ].join(", "),
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    </DemoModeProvider>
  );
}
