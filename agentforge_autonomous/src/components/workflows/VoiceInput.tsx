"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { WorkflowDefinition } from "@/workflows/types";

interface Props { onGenerated: (workflow: WorkflowDefinition) => void; }

interface SpeechRecognitionResult { readonly 0: { transcript: string }; readonly length: number; }
interface SpeechRecognitionResultList { readonly length: number; [index: number]: SpeechRecognitionResult; }
interface SpeechRecognitionEventCompat extends Event { readonly results: SpeechRecognitionResultList; }
interface SpeechRecognitionCompat extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((event: SpeechRecognitionEventCompat) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionCompat;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const INTENTS = [
  { label: "Review open PRs",       text: "Run code review on all open PRs in the main repo" },
  { label: "Deploy to staging",     text: "Deploy the latest build to staging and run smoke tests" },
  { label: "Weekly Discord summary",text: "Generate a weekly summary of completed tasks and send to Discord" },
  { label: "Scan agent errors",     text: "Scan all agents for errors in the last 24 hours and file issues" },
];

const PULSE_RINGS = [
  { scale: 1.5, opacity: 0.55, delay: 0 },
  { scale: 2.0, opacity: 0.30, delay: 0.35 },
  { scale: 2.6, opacity: 0.12, delay: 0.70 },
];

const WAVE_AMPS = [0.4, 0.75, 1, 0.85, 0.6, 0.9, 0.5, 0.75, 0.65, 0.45];

export function VoiceInput({ onGenerated }: Props) {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionCompat | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => { setHasSpeech(getSpeechRecognition() !== null); }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
  }, []);

  function toggleMic() {
    if (recording) { stopRecording(); return; }
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (ev: SpeechRecognitionEventCompat) => {
      let full = "";
      for (let i = 0; i < ev.results.length; i++) full += ev.results[i][0].transcript;
      setTranscript(full);
    };
    rec.onerror = () => stopRecording();
    rec.onend = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  }

  async function handleGenerate() {
    if (!transcript.trim()) return;
    setGenerating(true); setError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: transcript.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { workflow } = await res.json();
      onGenerated(workflow);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setGenerating(false); }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex flex-col gap-3 flex-shrink-0">
        <p className="text-[11px] text-white/35 leading-relaxed">
          Speak a workflow intent — the generator will produce a DSL plan for review before execution.
        </p>

        <div className="flex items-center gap-4">
          {/* Mic button with 3-ring pulse */}
          <div className="relative flex-shrink-0">
            {recording && !reduceMotion && PULSE_RINGS.map((r, i) => (
              <motion.div key={i} className="absolute inset-0 rounded-full border border-[#c4a8ff]/50"
                animate={{ scale: [1, r.scale], opacity: [r.opacity, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: r.delay, ease: "easeOut" }} />
            ))}
            {hasSpeech ? (
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: "0 0 24px rgba(196,168,255,0.45)" }}
                whileTap={{ scale: 0.90 }}
                onClick={toggleMic}
                className={`relative z-10 w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all backdrop-blur-xl ${
                  recording
                    ? "border-[#c4a8ff] bg-[rgba(196,168,255,0.15)] text-[#c4a8ff] shadow-[0_0_28px_rgba(196,168,255,0.55)]"
                    : "border-white/[0.12] bg-white/[0.06] text-white/55 hover:border-[#c4a8ff]/40 hover:text-[#c4a8ff]"
                }`}
              >
                {recording ? "■" : "🎙"}
              </motion.button>
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-white/10 bg-white/[0.04] flex items-center justify-center text-2xl text-white/20">
                ⌨
              </div>
            )}
          </div>

          {/* Transcript */}
          <div className="flex-1 relative">
            {hasSpeech ? (
              <div className="min-h-[56px] p-3 rounded-xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-xl text-[12px] font-mono relative">
                {transcript
                  ? <span className="text-white/85">{transcript}</span>
                  : <span className="text-white/22 italic">{recording ? "Listening..." : "Click the mic and describe your workflow..."}</span>
                }
                {recording && (
                  <motion.span className="inline-block w-0.5 h-3 bg-[#c4a8ff] ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
                )}
                {transcript && (
                  <span className="absolute bottom-1.5 right-2 text-[9px] text-white/18">{transcript.length}</span>
                )}
              </div>
            ) : (
              <textarea
                className="w-full min-h-[56px] p-3 rounded-xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-xl text-[12px] font-mono text-white/85 placeholder:text-white/22 resize-none outline-none focus:border-[#c4a8ff]/30 transition-colors"
                placeholder="Describe your workflow..." rows={2}
                value={transcript} onChange={(e) => setTranscript(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Waveform bars */}
        <AnimatePresence>
          {recording && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1 h-6 overflow-hidden">
              {WAVE_AMPS.map((amp, i) => (
                <motion.div key={i} className="w-[3px] rounded-full bg-[#c4a8ff]"
                  animate={reduceMotion ? {} : { height: [`${4 + amp * 6}px`, `${8 + amp * 16}px`, `${4 + amp * 6}px`] }}
                  transition={{ duration: 0.5 + i * 0.04, repeat: Infinity, ease: "easeInOut", delay: i * 0.06,
                    type: "spring", stiffness: 220, damping: 18 }}
                  style={{ height: `${4 + amp * 6}px` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-white/28">
            {recording ? "● Recording..." : transcript ? "Transcript ready" : "Ready"}
          </span>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setTranscript("")} disabled={!transcript}
              className="text-[11px] px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] text-white/55 disabled:opacity-30 hover:border-white/20 transition-all backdrop-blur-xl"
            >Clear</motion.button>
            <motion.button
              whileHover={transcript.trim() ? { scale: 1.04, boxShadow: "0 0 20px rgba(196,168,255,0.45)" } : {}}
              whileTap={{ scale: 0.96 }}
              onClick={handleGenerate} disabled={!transcript.trim() || generating}
              className="text-[11px] px-4 py-1.5 rounded-full border border-[rgba(196,168,255,0.5)] text-white/88 disabled:opacity-35 transition-all backdrop-blur-xl font-medium"
              style={{ background: "linear-gradient(135deg, rgba(196,168,255,0.18), rgba(168,216,200,0.12))" }}
            >
              {generating ? "Generating…" : "Generate →"}
            </motion.button>
          </div>
        </div>

        {error && <p className="text-[10px] text-[#f0a0a8]">{error}</p>}
      </div>

      <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <p className="text-[10px] font-medium text-white/28 mb-2">Suggested intents</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {INTENTS.map(({ label, text }) => (
            <motion.button key={label}
              whileHover={{ scale: 1.03, borderColor: "rgba(196,168,255,0.4)" }} whileTap={{ scale: 0.97 }}
              onClick={() => setTranscript(text)}
              className="text-[10px] px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] text-white/45 hover:text-white/75 whitespace-nowrap backdrop-blur-xl transition-colors flex-shrink-0"
            >{label}</motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center text-[11px] text-white/18 p-5 text-center leading-relaxed">
        Voice transcript will be sent to the Workflow Generator.<br />
        Review the DSL output before executing.
      </div>
    </div>
  );
}
