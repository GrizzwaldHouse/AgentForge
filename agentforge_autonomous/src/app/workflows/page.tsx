"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowList } from "@/components/workflows/WorkflowList";
import { WorkflowDetail } from "@/components/workflows/WorkflowDetail";
import { VoiceInput } from "@/components/workflows/VoiceInput";
import { WorkflowGenerator } from "@/components/workflows/WorkflowGenerator";
import { ValidationPanel } from "@/components/workflows/ValidationPanel";
import { EventStreamFeed } from "@/components/workflows/EventStreamFeed";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import type { WorkflowDefinition } from "@/workflows/types";

type CenterTab = "voice" | "generator";
type RightTab  = "validation" | "events";

const CENTER_TABS: { key: CenterTab; label: string }[] = [
  { key: "voice",     label: "Voice Input" },
  { key: "generator", label: "Generator Output" },
];
const RIGHT_TABS: { key: RightTab; label: string }[] = [
  { key: "validation", label: "Validation" },
  { key: "events",     label: "Event Stream" },
];

function TabBar<T extends string>({
  tabs, active, onChange,
}: { tabs: { key: T; label: string }[]; active: T; onChange: (k: T) => void }) {
  return (
    <div className="flex border-b border-white/[0.07] flex-shrink-0 overflow-x-auto">
      {tabs.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`px-4 py-2.5 text-[11px] border-b-2 whitespace-nowrap transition-all -mb-px ${
            active === key
              ? "text-[#c4a8ff] border-[#c4a8ff]"
              : "text-white/30 border-transparent hover:text-white/60"
          }`}
        >{label}</button>
      ))}
    </div>
  );
}

const NAV_LINKS = [
  { href: "/",          label: "Dashboard" },
  { href: "/workflows", label: "Workflows" },
  { href: "/jobs",      label: "Jobs" },
  { href: "/safety",    label: "Safety" },
] as const;

export default function WorkflowsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerTab, setCenterTab] = useState<CenterTab>("voice");
  const [rightTab,  setRightTab]  = useState<RightTab>("validation");
  const [generatedWorkflow, setGeneratedWorkflow] = useState<WorkflowDefinition | null>(null);

  function handleGenerated(wf: WorkflowDefinition) { setGeneratedWorkflow(wf); setCenterTab("generator"); }
  function handleValidate() { setRightTab("validation"); }
  function handleExecute()  { setRightTab("events"); }

  return (
    <motion.div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
      variants={staggerContainer} initial="initial" animate="animate"
    >
      {/* Header */}
      <motion.header variants={fadeInUp}
        className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.08] flex-shrink-0 backdrop-blur-2xl"
        style={{ background: "rgba(13,10,20,0.7)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #c4a8ff, #a8d8c8)" }}>A</div>
          <span className="text-[14px] font-bold text-white/88 tracking-tight">
            AgentForge <span className="text-[11px] font-normal text-white/35">/ Workflow Control Plane</span>
          </span>
        </div>

        <nav className="flex gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href}
              className={`px-3 py-1 text-[12px] rounded-lg transition-all ${
                label === "Workflows"
                  ? "text-[#c4a8ff] border border-[#c4a8ff]/30 bg-[rgba(196,168,255,0.08)]"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.05]"
              }`}
            >{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#a0f0c0]/25 text-[11px] text-[#a0f0c0]"
          style={{ background: "rgba(160,240,192,0.08)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#a0f0c0] animate-pulse" />
          <span>Live</span>
        </div>
      </motion.header>

      {/* 3-column layout */}
      <motion.div variants={fadeInUp}
        className="flex-1 grid overflow-hidden"
        style={{ gridTemplateColumns: "280px 1fr 320px", gap: 0 }}
      >
        {/* LEFT: Workflow List */}
        <div className="border-r border-white/[0.07] overflow-hidden flex flex-col backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.025)" }}>
          <WorkflowList
            onSelect={setSelectedId}
            selectedId={selectedId ?? undefined}
            onNewClick={() => setCenterTab("voice")}
          />
        </div>

        {/* CENTER */}
        <div className="flex flex-col overflow-hidden">
          {/* Center top: WorkflowDetail — fixed portion */}
          <div className="border-b border-white/[0.07] overflow-hidden flex flex-col"
            style={{ flex: "0 0 55%", maxHeight: "55%" }}>
            <WorkflowDetail workflowId={selectedId} />
          </div>

          {/* Center bottom: Voice | Generator */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <TabBar tabs={CENTER_TABS} active={centerTab} onChange={setCenterTab} />
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {centerTab === "voice" ? (
                  <motion.div key="voice" className="h-full"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}>
                    <VoiceInput onGenerated={handleGenerated} />
                  </motion.div>
                ) : (
                  <motion.div key="generator" className="h-full"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}>
                    <WorkflowGenerator workflow={generatedWorkflow} onValidate={handleValidate} onExecute={handleExecute} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: Validation | Events */}
        <div className="border-l border-white/[0.07] flex flex-col overflow-hidden backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.022)" }}>
          <TabBar tabs={RIGHT_TABS} active={rightTab} onChange={setRightTab} />
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {rightTab === "validation" ? (
                <motion.div key="validation" className="h-full"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}>
                  <ValidationPanel workflowId={selectedId} />
                </motion.div>
              ) : (
                <motion.div key="events" className="h-full"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}>
                  <EventStreamFeed />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
