import React, { useState } from 'react';
import { Eye, Code, HardDrive, Smartphone, Monitor, Copy, Check } from "lucide-react";

const THEME = {
  bg: "#0a0e0a",
  surface: "#141a14",
  accent: "#c9a96e",
  text: "#e8e0c8"
};

const NavTab = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-4 transition-all ${
      active ? 'bg-zinc-800 border-b-2' : 'opacity-50'
    }`}
    style={{ borderColor: active ? THEME.accent : 'transparent' }}
  >
    <Icon size={20} />
    <span className="hidden sm:inline font-mono text-xs uppercase tracking-widest">{label}</span>
  </button>
);

export default function ArtifactViewer({ documentData }) {
  const [tab, setTab] = useState('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: THEME.bg, color: THEME.text }}>
      <nav className="flex border-b border-zinc-800" style={{ minHeight: '56px' }}>
        <NavTab active={tab === 'preview'} onClick={() => setTab('preview')} icon={Eye} label="View" />
        <NavTab active={tab === 'code'} onClick={() => setTab('code')} icon={Code} label="Code" />
        <NavTab active={tab === 'hook'} onClick={() => setTab('hook')} icon={HardDrive} label="Sync" />
      </nav>

      <main className="flex-1 overflow-auto p-4 md:p-12">
        {tab === 'preview' ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <header className="border-l-4 p-4 bg-zinc-900" style={{ borderColor: THEME.accent }}>
              <h2 className="text-xl font-bold">{documentData.metadata?.projectName || 'Artifact Viewer'}</h2>
              <p className="text-sm opacity-50">{documentData.metadata?.sessionDate}</p>
            </header>
            <div className="p-8 border-2 border-dashed border-zinc-800 rounded-xl text-center">
              <p className="text-zinc-600">Visual Preview Layer Active</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button 
              onClick={() => handleCopy(JSON.stringify(documentData, null, 2))}
              className="absolute right-4 top-4 p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              {copied ? <Check size={18} color={THEME.accent} /> : <Copy size={18} />}
            </button>
            <pre className="p-6 bg-black/40 rounded-lg text-xs md:text-sm font-mono overflow-x-auto leading-relaxed">
              <code>{JSON.stringify(documentData, null, 2)}</code>
            </pre>
          </div>
        )}
      </main>

      <footer className="px-4 py-2 bg-zinc-950 flex justify-between items-center text-[10px] uppercase opacity-30 tracking-tighter">
        <div className="flex gap-4"><Smartphone size={12}/><Monitor size={12}/></div>
        <span>Universal Coding Standards v1.0</span>
      </footer>
    </div>
  );
}
