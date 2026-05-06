// BrainstormAIModels.jsx
// Developer: Marcus Daley | Grizzwald Workshop
// Date: 2026-05-03
// Purpose: AI Architecture best practices brainstorm for freelance game dev and AgentForge planning
// Standard: VetAssistBrainstormWizard v2.0 (May 2026) -- fully compliant

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Award, Settings, ChevronRight, ChevronLeft, Mic, Edit3, Flag, Plus,
  Copy, Check, ChevronUp, ChevronDown, X, Volume2, VolumeX
} from "lucide-react";

// ─── THEMES ─────────────────────────────────────────────────────────────────
// Two themes shipped: ai_research for architecture work, game_dev_arcade for game dev context
const THEMES = {
  ai_research: {
    name: "AI Research Lab",
    desc: "Deep space blue with cyan accents -- architecture and systems work",
    bgPrimary: "#080E18",
    bgSecondary: "#0E1724",
    bgCard: "#141E2E",
    accent: "#2A9CC8",
    accentBright: "#44BEE8",
    textPrimary: "#D8E8F2",
    textMuted: "#62889A",
    panelBorder: "#1C2C40",
    success: "#28785A",
    warning: "#947820",
    danger: "#884040",
    sectionColors: ["#2A9CC8","#4A6EC8","#7A4EA8","#2AAA7A","#C8862A","#7AAA2E"],
    fontDisplay: "'IBM Plex Mono', monospace",
    fontMono: "'IBM Plex Mono', monospace",
    fontBody: "'IBM Plex Mono', sans-serif",
    rankNames: ["Trainee","Researcher","Analyst","Architect","Principal","Fellow","Laureate"],
    iconChar: "◆",
  },
  game_dev_arcade: {
    name: "Game Dev Arcade",
    desc: "Neon retro purple -- game development and portfolio context",
    bgPrimary: "#0F0A1F",
    bgSecondary: "#1A1230",
    bgCard: "#221840",
    accent: "#FF3DAB",
    accentBright: "#FF6BC5",
    textPrimary: "#E8E0FF",
    textMuted: "#9080B8",
    panelBorder: "#382850",
    success: "#3DFFB8",
    warning: "#FFD93D",
    danger: "#FF5C5C",
    sectionColors: ["#FF3DAB","#7C3AFF","#3DFFB8","#FFD93D","#FF6B3D","#3D8FFF"],
    fontDisplay: "monospace",
    fontMono: "monospace",
    fontBody: "monospace",
    rankNames: ["Pixel","Sprite","Developer","Senior Dev","Lead Dev","Principal","Game Director"],
    iconChar: "▲",
  },
};

// ─── ACHIEVEMENTS ──────────────────────────────────────────────────────────
// Standard set per VetAssistBrainstormWizard spec plus two domain-specific additions
const ACHIEVEMENTS = [
  { id:"first_decision", title:"First Call",         desc:"Locked your first architectural decision",                xp:25,  icon:"🎯" },
  { id:"voice_recon",    title:"Voice Recon",         desc:"Used voice input to capture an answer",                  xp:50,  icon:"🎙️" },
  { id:"field_notes",    title:"Field Notes",         desc:"Used free-text override for the first time",             xp:30,  icon:"📝" },
  { id:"after_action",   title:"After Action",        desc:"Flagged a question for improvement",                     xp:30,  icon:"🚩" },
  { id:"section_cleared",title:"Section Cleared",     desc:"Answered every question in a section",                   xp:75,  icon:"✅" },
  { id:"tier_master",    title:"Tier Master",         desc:"Assigned every row in the deployment tier matrix",       xp:100, icon:"🏆" },
  { id:"full_stack",     title:"Full Stack Architect",desc:"Completed every question in the artifact",               xp:200, icon:"🌟" },
  { id:"hybrid_thinker", title:"Hybrid Thinker",      desc:"Selected three or more hybrid model pairings",           xp:60,  icon:"🧬" },
  { id:"source_cited",   title:"Research Validated",  desc:"Used hybrid composer to annotate with source references",xp:40,  icon:"📊" },
];

// ─── BRAINSTORM DATA ────────────────────────────────────────────────────────
// All content, schemas, and question definitions live here -- zero hardcoded values in UI components
const BRAINSTORM_DATA = {
  title: "AI Architecture Best Practices",
  subtitle: "Model selection, hybrid pairings, and deployment strategy for freelance game dev and AgentForge",
  capturedDate: "2026-05-03",
  preLockedNotes: [
    "Hardware stack: RTX 5080 (16GB GDDR7) + 64GB RAM -- local inference is viable for 14B models at 80+ tps",
    "Official ratings (LMSYS Arena, May 2026): Claude 3.5 Sonnet ~1320 Elo #1 | GPT-4o ~1290 | Qwen2.5-72B ~1240 | DeepSeek-R1 reasoning SOTA | Falcon-Mamba-7B best SSM locally per HuggingFace Open LLM Leaderboard",
    "Mamba advantage (Gu & Dao 2023 paper + Mamba-3 March 2026): 5x faster inference vs same-parameter Transformer at equal quality -- O(n) linear vs O(n^2) quadratic cost",
    "Diffusion rankings: Flux.1 Pro currently top quality (Black Forest Labs) | SDXL most widely deployed | SD 3.5 strong open architecture",
    "MoE efficiency: Mixtral 8x7B matches GPT-3.5 at 1/4 the compute per Mistral AI paper -- sparse activation only routes relevant experts per token",
    "AgentForge feature discussions exist in ChatGPT -- extract with provided prompt BEFORE locking this artifact for highest accuracy on Q5 and Q6",
    "Sources for validation: lmarena.ai | huggingface.co/open-llm-leaderboard | stability.ai | mistral.ai | arxiv.org/abs/2312.00752 (Mamba paper)",
  ],
  sections: [
    {
      id: "foundation",
      title: "Model Selection Foundation",
      icon: "⚡",
      description: "Establish your primary AI architecture and hybrid pairing strategy for the Grizzwald stack",
      questions: [
        {
          id: "q1",
          text: "Which single AI architecture forms the backbone of your freelance development stack?",
          type: "single",
          options: [
            { id:"o1a", label:"Transformer-First (Recommended)",     desc:"Largest ecosystem, best reasoning, strongest client demos -- qwen2.5-coder:14b covers 80% of freelance work today" },
            { id:"o1b", label:"Mamba SSM-First",                     desc:"5x faster inference, linear scaling -- ideal if game state streaming is your primary use case, less mature tooling" },
            { id:"o1c", label:"MoE Hybrid from Day One",             desc:"Route tasks to specialist models automatically -- highest ceiling but requires Mixtral expertise before other models" },
            { id:"o1d", label:"Start Minimal, Add Architecture Later",desc:"One model now (qwen2.5-coder), add Mamba and Diffusion as projects demand -- lowest cognitive overhead to start" },
          ],
        },
        {
          id: "q2",
          text: "Which hybrid model pairings best serve a solo freelance game developer on your hardware?",
          type: "multi",
          options: [
            { id:"o2a", label:"Transformer + Diffusion (Code + Assets)",    desc:"qwen2.5-coder generates systems while SDXL or Flux creates textures -- highest client deliverable value available today" },
            { id:"o2b", label:"Mamba + RL (Temporal State + Behavior)",     desc:"Falcon-Mamba handles game event streams while SB3 agents learn NPC tactics -- ideal pipeline for Deep Command" },
            { id:"o2c", label:"GNN + Transformer (Graphs + Language)",      desc:"PyTorch Geometric models faction relationships while Transformer handles design documentation and commands" },
            { id:"o2d", label:"Diffusion + CNN (Generation + Analysis)",    desc:"Create assets with Diffusion then classify and filter with a vision model for automated pipeline quality gates" },
            { id:"o2e", label:"All Hybrid Where RTX 5080 Allows",           desc:"Maximize 16GB VRAM -- run multiple quantized models simultaneously with Ollama offloading excess to 64GB RAM" },
          ],
        },
      ],
    },
    {
      id: "freelance_applications",
      title: "Freelance Game Dev Applications",
      icon: "🎮",
      description: "Map AI capabilities to real client deliverables and rate each architecture for commercial value",
      questions: [
        {
          id: "q3",
          text: "Which client deliverable types will AI models primarily produce for your freelance practice?",
          type: "multi",
          options: [
            { id:"o3a", label:"Procedural Texture and Asset Packages",     desc:"Diffusion (SDXL, Flux) generates client-ready art assets -- directly billable with high client wow factor" },
            { id:"o3b", label:"NPC Behavior Systems and AI Controllers",   desc:"RL agents plus Transformer-generated C++ code -- differentiates you from devs who only code by hand" },
            { id:"o3c", label:"Level Design Automation and Prototyping",   desc:"GNN maps spatial relationships while Transformer generates layout logic -- speeds client iteration cycles" },
            { id:"o3d", label:"Code Review, Refactoring, and Generation",  desc:"Transformer models (qwen2.5-coder) handle UE5 and Unity C++ and C# -- most immediately billable use case" },
            { id:"o3e", label:"Automated Playtesting and Balance Reports", desc:"RL agents stress-test game systems and generate analytical reports -- premium deliverable for studios" },
            { id:"o3f", label:"Technical Design Documents",                desc:"Transformer-accelerated TDD production -- positions you as a senior technical lead not just an implementer" },
          ],
        },
        {
          id: "q4",
          text: "Rate each AI architecture for commercial freelance value on the RTX 5080 stack",
          type: "numeric_scale",
          scaleLabels: [
            { value:1, label:"Not viable yet" },
            { value:2, label:"Experimental only" },
            { value:3, label:"Portfolio demo" },
            { value:4, label:"Client deliverable" },
            { value:5, label:"Revenue generator" },
          ],
          rows: [
            { id:"r4a", label:"Transformer (qwen2.5-coder:14b, deepseek-r1:8b)" },
            { id:"r4b", label:"Mamba SSM (Falcon-Mamba-7B)" },
            { id:"r4c", label:"Diffusion (SDXL, Flux via ComfyUI)" },
            { id:"r4d", label:"RL Agents (Stable-Baselines3)" },
            { id:"r4e", label:"GNN (PyTorch Geometric)" },
            { id:"r4f", label:"MoE Hybrid (Mixtral 8x7B)" },
          ],
        },
      ],
    },
    {
      id: "agentforge_mapping",
      title: "AgentForge Feature Mapping",
      icon: "🧬",
      description: "Assign AI architectures to AgentForge features and lock integration priority order",
      questions: [
        {
          id: "q5",
          text: "Which AI architecture best powers each AgentForge core feature?",
          type: "abc_match",
          options: [
            { id:"cat_t",  label:"Transformer",  desc:"Best reasoning and NL understanding" },
            { id:"cat_m",  label:"Mamba/SSM",    desc:"Sequential state, long context linear" },
            { id:"cat_d",  label:"Diffusion",    desc:"Asset and content generation" },
            { id:"cat_r",  label:"RL Agent",     desc:"Learned behavior and optimization" },
            { id:"cat_g",  label:"GNN",          desc:"Graph relationships and routing" },
            { id:"cat_moe",label:"MoE Router",   desc:"Multi-expert orchestration layer" },
          ],
          rows: [
            { id:"af1", label:"Natural language command routing" },
            { id:"af2", label:"3D asset generation pipeline" },
            { id:"af3", label:"Game state and session analysis" },
            { id:"af4", label:"Faction and relationship AI" },
            { id:"af5", label:"Enemy behavior learning system" },
            { id:"af6", label:"Long session memory and context" },
          ],
        },
        {
          id: "q6",
          text: "Rank AgentForge AI feature integration phases from highest to lowest build priority",
          type: "ranked",
          items: [
            { id:"p1", label:"NL Command Interface (Transformer core)",  desc:"Foundation -- all other features depend on users being able to talk to the system" },
            { id:"p2", label:"Local Model Management UI",                desc:"Lets non-developers pull and configure Ollama models -- unlocks the platform for designers" },
            { id:"p3", label:"Diffusion Asset Pipeline",                 desc:"Highest visible client value -- generated art is immediately shareable and demonstrable" },
            { id:"p4", label:"Mamba Sensor/State Processor",             desc:"Enables real-time game data streaming -- required for the Deep Command sensor use case" },
            { id:"p5", label:"RL Behavior Training Harness",             desc:"Most complex integration -- needs the other layers stable before adding learning agents" },
            { id:"p6", label:"GNN Faction Graph Engine",                 desc:"Highest architectural sophistication -- best as a Phase 2 feature after platform stability" },
          ],
        },
      ],
    },
    {
      id: "infrastructure",
      title: "Infrastructure and Deployment",
      icon: "🖥️",
      description: "Define how models are deployed, tiered, and operated across your local stack",
      questions: [
        {
          id: "q7",
          text: "Deploy local-first inference as your primary strategy with cloud as fallback only?",
          type: "true_false",
          options: [
            { id:"o7t", label:"Yes -- Local-First",  desc:"RTX 5080 runs 14B models at 80+ tps. Privacy-first, zero API cost per call, works fully offline. Matches Navy independent ops philosophy." },
            { id:"o7f", label:"No -- Cloud-First",   desc:"Claude API for highest quality and larger context windows, no GPU memory pressure. Pay-per-use scales cleanly with client billing." },
          ],
        },
        {
          id: "q8",
          text: "Assign each model to an operational deployment tier based on usage frequency",
          type: "abc_match",
          options: [
            { id:"t1", label:"Tier 1 -- Always On",  desc:"Loaded at startup, instant response latency" },
            { id:"t2", label:"Tier 2 -- On Demand",  desc:"Pulled when needed, roughly 10s cold start" },
            { id:"t3", label:"Tier 3 -- Scheduled",  desc:"Batch tasks, overnight runs, async pipelines" },
          ],
          rows: [
            { id:"m1", label:"qwen2.5-coder:14b (primary code model)" },
            { id:"m2", label:"deepseek-r1:8b (architecture reasoning)" },
            { id:"m3", label:"Falcon-Mamba-7B (SSM sensor streaming)" },
            { id:"m4", label:"SDXL / ComfyUI (diffusion assets)" },
            { id:"m5", label:"mixtral:8x7b (MoE routing)" },
            { id:"m6", label:"SB3 RL agents (behavior training)" },
          ],
        },
      ],
    },
    {
      id: "portfolio_growth",
      title: "Portfolio and Growth Roadmap",
      icon: "🚀",
      description: "Lock your AI learning sequence and identify the highest-visibility portfolio implementations",
      questions: [
        {
          id: "q9",
          text: "Which AI integrations deliver the highest portfolio visibility for a freelance game developer?",
          type: "multi",
          options: [
            { id:"o9a", label:"Live NPC Dialog Generation Demo",        desc:"Real-time Transformer character conversation -- instantly impressive as a video, common client ask" },
            { id:"o9b", label:"Diffusion Texture Pipeline Demo",        desc:"SDXL or Flux generating game-ready assets -- visual proof of AI productivity gain, easy to demo live" },
            { id:"o9c", label:"RL-Trained Opponent AI",                 desc:"Agent that learns tactics through play -- differentiates you from any developer shipping scripted AI" },
            { id:"o9d", label:"Real-Time Game State Analysis Dashboard",desc:"Mamba or CNN analyzing live game events -- shows data engineering depth beyond prompting models" },
            { id:"o9e", label:"Procedural Level Generation System",     desc:"GNN + Transformer generating playable levels -- high narrative value for senior and lead positions" },
            { id:"o9f", label:"Multi-Model Routing System (AgentForge)",desc:"MoE-style router directing queries to specialists -- most technically impressive, best for principal roles" },
          ],
        },
        {
          id: "q10",
          text: "Rank your personal AI learning roadmap from most to least urgent mastery target",
          type: "ranked",
          items: [
            { id:"lr1", label:"Master Transformer prompting and fine-tuning", desc:"Highest immediate ROI -- every current project improves today, no new hardware or dependencies needed" },
            { id:"lr2", label:"Implement Mamba SSM pipeline for game data",   desc:"Deep Command sensor system depends on this -- blocks the flagship project if left unlearned" },
            { id:"lr3", label:"Build Diffusion asset workflow in ComfyUI",     desc:"Unlocks ForgePipeline MVP -- directly monetizable as a standalone freelance service" },
            { id:"lr4", label:"Prototype RL game agent with Stable-Baselines3",desc:"High learning value, medium timeline -- start with a 1v1 ship duel environment to keep scope tight" },
            { id:"lr5", label:"Deploy GNN faction and relationship system",    desc:"Advanced Deep Command Phase 2 -- builds on all earlier architecture work, not a blocker" },
            { id:"lr6", label:"Ship MoE routing layer for AgentForge",        desc:"Capstone capability -- requires all other architectures working before the routing layer adds value" },
          ],
        },
      ],
    },
  ],
};

// ─── STORAGE KEYS ────────────────────────────────────────────────────────────
// Versioned keys prevent collision when schema changes
const STORAGE_KEY    = "brainstorm_ai_models_v1_responses";
const SETTINGS_KEY   = "brainstorm_ai_models_v1_settings";
const XP_KEY         = "brainstorm_ai_models_v1_xp";

// ─── useBrainstormState ───────────────────────────────────────────────────────
// Central state manager -- all response mutations flow through updateResponse
function useBrainstormState() {
  const [responses, setResponses] = useState({});
  const [rankedMoved, setRankedMoved] = useState({});

  // Load persisted state on mount -- cancelled flag prevents stale state update after unmount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const saved = await window.storage?.get(STORAGE_KEY);
        if (!cancelled && saved?.value) {
          const parsed = JSON.parse(saved.value);
          setResponses(parsed.responses || {});
          setRankedMoved(parsed.rankedMoved || {});
        }
      } catch (_) {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Persist every time responses change -- errors are non-fatal
  useEffect(() => {
    if (!Object.keys(responses).length) return;
    window.storage?.set(STORAGE_KEY, JSON.stringify({ responses, rankedMoved })).catch(() => {});
  }, [responses, rankedMoved]);

  const updateResponse = useCallback((qId, field, value) => {
    setResponses(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), [field]: value } }));
  }, []);

  const markRankedMoved = useCallback((qId) => {
    setRankedMoved(prev => ({ ...prev, [qId]: true }));
  }, []);

  return { responses, updateResponse, rankedMoved, markRankedMoved };
}

// ─── useSettings ──────────────────────────────────────────────────────────────
// Theme, gamification, and sound preferences all persist independently
function useSettings() {
  const [themeKey, setThemeKeyState]       = useState("ai_research");
  const [gamification, setGamification]   = useState(true);
  const [soundEnabled, setSoundEnabled]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const s = await window.storage?.get(SETTINGS_KEY);
        if (!cancelled && s?.value) {
          const p = JSON.parse(s.value);
          if (p.themeKey && THEMES[p.themeKey]) setThemeKeyState(p.themeKey);
          if (p.gamification !== undefined) setGamification(p.gamification);
          if (p.soundEnabled !== undefined) setSoundEnabled(p.soundEnabled);
        }
      } catch (_) {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function setThemeKey(k) {
    setThemeKeyState(k);
    window.storage?.set(SETTINGS_KEY, JSON.stringify({ themeKey: k, gamification, soundEnabled })).catch(() => {});
  }
  function toggleGamification() {
    const next = !gamification;
    setGamification(next);
    window.storage?.set(SETTINGS_KEY, JSON.stringify({ themeKey, gamification: next, soundEnabled })).catch(() => {});
  }
  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    window.storage?.set(SETTINGS_KEY, JSON.stringify({ themeKey, gamification, soundEnabled: next })).catch(() => {});
  }

  return { themeKey, setThemeKey, gamification, toggleGamification, soundEnabled, toggleSound };
}

// ─── useSoundCue ──────────────────────────────────────────────────────────────
// Web Audio API tones -- all frequencies and durations from the standard spec
function useSoundCue(enabled) {
  const ctx = useRef(null);

  function getCtx() {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  }

  function tone(freqs, durs) {
    if (!enabled) return;
    try {
      const ac = getCtx();
      let t = ac.currentTime;
      freqs.forEach((f, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + durs[i] / 1000);
        o.start(t); o.stop(t + durs[i] / 1000);
        t += durs[i] / 1000;
      });
    } catch (_) {}
  }

  return {
    playSelect:      () => tone([880],            [80]),
    playLock:        () => tone([523, 659],        [60, 60]),
    playAchievement: () => tone([523, 659, 784],   [100, 100, 150]),
    playLevelUp:     () => tone([523, 659, 784, 1047], [80, 80, 80, 200]),
  };
}

// ─── useVoiceInput ────────────────────────────────────────────────────────────
// Graceful degradation when Web Speech API is unavailable -- supported flag drives visibility
function useVoiceInput(onTranscript) {
  const [listening, setListening]   = useState(false);
  const recognizer                  = useRef(null);
  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  function startListening() {
    if (!supported || listening) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const t = Array.from(e.results).map(x => x[0].transcript).join(" ");
      onTranscript(t);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    recognizer.current = r;
    r.start();
    setListening(true);
  }

  function stopListening() {
    recognizer.current?.stop();
    setListening(false);
  }

  return { supported, listening, startListening, stopListening };
}

// ─── useGamification ─────────────────────────────────────────────────────────
// XP computed from responses -- event-driven, no polling
function useGamification(responses, rankedMoved, enabled) {
  const xp = useMemo(() => {
    if (!enabled) return 0;
    let total = 0;
    BRAINSTORM_DATA.sections.forEach(sec => {
      sec.questions.forEach(q => {
        const r = responses[q.id] || {};
        if (q.type === "single" || q.type === "true_false") {
          if (r.selected) total += 10;
        } else if (q.type === "multi") {
          total += ((r.selected || []).length) * 10;
        } else if (q.type === "abc_match") {
          total += Object.keys(r.matches || {}).length * 10;
        } else if (q.type === "numeric_scale") {
          total += Object.keys(r.ratings || {}).length * 10;
        } else if (q.type === "ranked") {
          if (rankedMoved[q.id]) total += 10;
        }
        if (r.freeText?.trim()) total += 5;
        if (r.hybrid?.trim())   total += 5;
        if (r.flag?.trim())     total += 5;
      });
    });
    return total;
  }, [responses, rankedMoved, enabled]);

  const achievements = useMemo(() => {
    const unlocked = new Set();
    const allQ = BRAINSTORM_DATA.sections.flatMap(s => s.questions);

    // first_decision
    const anyAnswer = allQ.some(q => {
      const r = responses[q.id] || {};
      return r.selected || Object.keys(r.matches || {}).length || Object.keys(r.ratings || {}).length;
    });
    if (anyAnswer) unlocked.add("first_decision");

    // voice_recon
    if (allQ.some(q => (responses[q.id] || {}).voiceUsed)) unlocked.add("voice_recon");

    // field_notes
    if (allQ.some(q => (responses[q.id] || {}).freeText?.trim())) unlocked.add("field_notes");

    // after_action
    if (allQ.some(q => (responses[q.id] || {}).flag?.trim())) unlocked.add("after_action");

    // section_cleared
    BRAINSTORM_DATA.sections.forEach(sec => {
      const allDone = sec.questions.every(q => {
        const r = responses[q.id] || {};
        if (q.type === "single" || q.type === "true_false") return !!r.selected;
        if (q.type === "multi") return (r.selected || []).length > 0;
        if (q.type === "abc_match") return Object.keys(r.matches || {}).length === q.rows.length;
        if (q.type === "numeric_scale") return Object.keys(r.ratings || {}).length === q.rows.length;
        if (q.type === "ranked") return !!(r.order || rankedMoved[q.id]);
        return false;
      });
      if (allDone) unlocked.add("section_cleared");
    });

    // tier_master -- Q8 is the deployment tier matrix
    const q8 = responses["q8"] || {};
    if (Object.keys(q8.matches || {}).length === 6) unlocked.add("tier_master");

    // full_stack
    if (allQ.every(q => {
      const r = responses[q.id] || {};
      if (q.type === "single" || q.type === "true_false") return !!r.selected;
      if (q.type === "multi") return (r.selected || []).length > 0;
      if (q.type === "abc_match") return Object.keys(r.matches || {}).length === q.rows.length;
      if (q.type === "numeric_scale") return Object.keys(r.ratings || {}).length === q.rows.length;
      if (q.type === "ranked") return !!(r.order || rankedMoved[q.id]);
      return false;
    })) unlocked.add("full_stack");

    // hybrid_thinker -- 3+ options selected in Q2
    if (((responses["q2"] || {}).selected || []).length >= 3) unlocked.add("hybrid_thinker");

    // source_cited
    if (allQ.some(q => (responses[q.id] || {}).hybrid?.trim())) unlocked.add("source_cited");

    return unlocked;
  }, [responses, rankedMoved]);

  return { xp, achievements };
}

// ─── getRank ─────────────────────────────────────────────────────────────────
// Computes rank name and fractional progress to next rank from XP total
function getRank(xp, rankNames) {
  const XP_PER_RANK = 200;
  const maxRank = rankNames.length - 1;
  const rawRank = Math.floor(xp / XP_PER_RANK);
  const rank = Math.min(rawRank, maxRank);
  const floor = rank * XP_PER_RANK;
  const progress = rank === maxRank ? 1 : (xp - floor) / XP_PER_RANK;
  return { name: rankNames[rank], rank, progress };
}

// ─── AffordanceBar ────────────────────────────────────────────────────────────
// Four mandatory affordances per the standard -- all visible at all times
function AffordanceBar({ qId, responses, updateResponse, voiceInput, T }) {
  const r = responses[qId] || {};
  const [showFree, setShowFree]     = useState(false);
  const [showHybrid, setShowHybrid] = useState(false);
  const [showFlag, setShowFlag]     = useState(false);

  const { supported, listening, startListening, stopListening } = useVoiceInput((text) => {
    updateResponse(qId, "freeText", (r.freeText || "") + " " + text);
    updateResponse(qId, "voiceUsed", true);
    setShowFree(true);
  });

  const btnBase = { fontFamily: T.fontMono, fontSize: 10, cursor: "pointer", borderRadius: 4,
    padding: "3px 9px", letterSpacing: "0.06em", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 4 };

  return (
    <div style={{ borderTop: `1px dashed ${T.panelBorder}`, paddingTop: 10, marginTop: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {/* Free-text override */}
        <button onClick={() => setShowFree(p => !p)}
          style={{ ...btnBase, background: showFree ? `${T.accent}18` : "transparent", border: `1px solid ${T.panelBorder}`, color: T.textMuted }}>
          <Edit3 size={10} /> Free-text override
        </button>
        {/* Voice input -- only shown when Web Speech API is supported */}
        {supported && (
          <button onClick={listening ? stopListening : startListening}
            style={{ ...btnBase, background: listening ? `${T.danger}30` : "transparent", border: `1px solid ${listening ? T.danger : T.panelBorder}`, color: listening ? T.danger : T.textMuted }}>
            <Mic size={10} /> {listening ? "Listening..." : "Voice input"}
          </button>
        )}
        {/* Hybrid composer */}
        <button onClick={() => setShowHybrid(p => !p)}
          style={{ ...btnBase, background: showHybrid ? `${T.accent}18` : "transparent", border: `1px solid ${T.panelBorder}`, color: T.textMuted }}>
          <Plus size={10} /> Hybrid composer
        </button>
        {/* Feedback flag */}
        <button onClick={() => setShowFlag(p => !p)}
          style={{ ...btnBase, background: r.flag ? `${T.warning}20` : "transparent", border: `1px solid ${r.flag ? T.warning : T.panelBorder}`, color: r.flag ? T.warning : T.textMuted }}>
          <Flag size={10} /> Flag this question
        </button>
      </div>

      {showFree && (
        <textarea value={r.freeText || ""} onChange={e => updateResponse(qId, "freeText", e.target.value)}
          placeholder="Override or supplement preset options with your own answer..."
          style={{ width: "100%", marginTop: 6, background: T.bgSecondary, border: `1px solid ${T.panelBorder}`, borderRadius: 4, padding: "6px 10px", color: T.textPrimary, fontFamily: T.fontMono, fontSize: 11, resize: "vertical", minHeight: 60, outline: "none", boxSizing: "border-box" }} />
      )}
      {showHybrid && (
        <textarea value={r.hybrid || ""} onChange={e => updateResponse(qId, "hybrid", e.target.value)}
          placeholder="Combine preset selections with your own qualifications or source citations..."
          style={{ width: "100%", marginTop: 6, background: T.bgSecondary, border: `1px solid ${T.accent}40`, borderRadius: 4, padding: "6px 10px", color: T.textPrimary, fontFamily: T.fontMono, fontSize: 11, resize: "vertical", minHeight: 50, outline: "none", boxSizing: "border-box" }} />
      )}
      {showFlag && (
        <textarea value={r.flag || ""} onChange={e => updateResponse(qId, "flag", e.target.value)}
          placeholder="Flag this question as ambiguous, missing options, or poorly worded..."
          style={{ width: "100%", marginTop: 6, background: T.bgSecondary, border: `1px solid ${T.warning}40`, borderRadius: 4, padding: "6px 10px", color: T.warning, fontFamily: T.fontMono, fontSize: 11, resize: "vertical", minHeight: 50, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

// ─── SingleSelectPills ────────────────────────────────────────────────────────
function SingleSelectPills({ q, r, onSelect, sectionColor, T }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {q.options.map(opt => {
        const sel = r.selected === opt.id;
        return (
          <div key={opt.id} onClick={() => onSelect(opt.id)}
            style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", transition: "all 0.18s",
              background: sel ? sectionColor : `${T.bgSecondary}`,
              border: `1px solid ${sel ? sectionColor : T.panelBorder}`,
              boxShadow: sel ? `0 0 12px ${sectionColor}30` : "none" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: sel ? T.bgPrimary : T.textPrimary, marginBottom: 2 }}>{opt.label}</div>
            <div style={{ fontSize: 10, color: sel ? `${T.bgPrimary}cc` : T.textMuted, lineHeight: 1.5 }}>{opt.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MultiSelectPills ────────────────────────────────────────────────────────
// Checkmark in top-right corner of each selected pill per the standard
function MultiSelectPills({ q, r, onToggle, sectionColor, T }) {
  const selected = r.selected || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {q.options.map(opt => {
        const sel = selected.includes(opt.id);
        return (
          <div key={opt.id} onClick={() => onToggle(opt.id)}
            style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", transition: "all 0.18s", position: "relative",
              background: sel ? `${sectionColor}18` : T.bgSecondary,
              border: `1px solid ${sel ? sectionColor : T.panelBorder}`,
              boxShadow: sel ? `0 0 8px ${sectionColor}20` : "none" }}>
            {sel && (
              <div style={{ position: "absolute", top: 6, right: 8, width: 14, height: 14, borderRadius: "50%",
                background: sectionColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={9} color={T.bgPrimary} />
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: 12, color: sel ? sectionColor : T.textPrimary, marginBottom: 2, paddingRight: 20 }}>{opt.label}</div>
            <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5, paddingRight: 20 }}>{opt.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TrueFalseButtons ────────────────────────────────────────────────────────
// Larger pills rendered side-by-side per the standard spec
function TrueFalseButtons({ q, r, onSelect, sectionColor, T }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {q.options.map(opt => {
        const sel = r.selected === opt.id;
        return (
          <div key={opt.id} onClick={() => onSelect(opt.id)}
            style={{ padding: "14px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.18s",
              background: sel ? sectionColor : T.bgSecondary,
              border: `1px solid ${sel ? sectionColor : T.panelBorder}`,
              boxShadow: sel ? `0 0 16px ${sectionColor}35` : "none" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: sel ? T.bgPrimary : T.textPrimary, marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: 10, color: sel ? `${T.bgPrimary}bb` : T.textMuted, lineHeight: 1.5 }}>{opt.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ABCMatching ──────────────────────────────────────────────────────────────
// Options legend above the grid per the standard
function ABCMatching({ q, r, onMatch, sectionColor, T }) {
  const matches = r.matches || {};
  return (
    <div>
      {/* Options legend */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {q.options.map(opt => (
          <div key={opt.id} style={{ padding: "3px 10px", borderRadius: 4, background: T.bgSecondary, border: `1px solid ${T.panelBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: sectionColor }}>{opt.label}</div>
            <div style={{ fontSize: 9, color: T.textMuted }}>{opt.desc}</div>
          </div>
        ))}
      </div>
      {/* Row-by-row assignment */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {q.rows.map(row => (
          <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: T.bgSecondary, borderRadius: 5 }}>
            <div style={{ minWidth: 220, fontSize: 11, color: T.textPrimary }}>{row.label}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {q.options.map(opt => {
                const sel = matches[row.id] === opt.id;
                return (
                  <button key={opt.id} onClick={() => onMatch(row.id, opt.id)}
                    style={{ padding: "2px 8px", borderRadius: 3, fontSize: 10, cursor: "pointer", fontFamily: T.fontMono, transition: "all 0.13s",
                      background: sel ? sectionColor : "transparent",
                      border: `1px solid ${sel ? sectionColor : T.panelBorder}`,
                      color: sel ? T.bgPrimary : T.textMuted }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NumericScale ─────────────────────────────────────────────────────────────
// Scale labels above the grid per the standard
function NumericScale({ q, r, onRate, sectionColor, T }) {
  const ratings = r.ratings || {};
  const colCount = q.scaleLabels.length;
  return (
    <div>
      {/* Scale labels above grid */}
      <div style={{ display: "grid", gridTemplateColumns: `220px repeat(${colCount}, 1fr)`, gap: 4, marginBottom: 6 }}>
        <div />
        {q.scaleLabels.map(sl => (
          <div key={sl.value} style={{ textAlign: "center", fontSize: 9, color: sectionColor, fontWeight: 700 }}>
            {sl.value}<br /><span style={{ color: T.textMuted, fontWeight: 400 }}>{sl.label}</span>
          </div>
        ))}
      </div>
      {/* Rating grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {q.rows.map(row => (
          <div key={row.id} style={{ display: "grid", gridTemplateColumns: `220px repeat(${colCount}, 1fr)`, gap: 4, alignItems: "center" }}>
            <div style={{ fontSize: 11, color: T.textPrimary, paddingRight: 8 }}>{row.label}</div>
            {q.scaleLabels.map(sl => {
              const sel = ratings[row.id] === sl.value;
              return (
                <div key={sl.value} onClick={() => onRate(row.id, sl.value)}
                  style={{ height: 28, borderRadius: 4, cursor: "pointer", transition: "all 0.13s",
                    background: sel ? sectionColor : T.bgSecondary,
                    border: `1px solid ${sel ? sectionColor : T.panelBorder}`,
                    boxShadow: sel ? `0 0 8px ${sectionColor}40` : "none" }} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RankedPriority ───────────────────────────────────────────────────────────
// Up/down arrows with current position number per the standard
function RankedPriority({ q, r, onMove, sectionColor, T }) {
  const order = r.order || q.items.map(i => i.id);
  const byId  = Object.fromEntries(q.items.map(i => [i.id, i]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {order.map((id, idx) => {
        const item = byId[id];
        return (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            background: idx === 0 ? `${sectionColor}15` : T.bgSecondary,
            border: `1px solid ${idx === 0 ? sectionColor : T.panelBorder}`,
            borderRadius: 6, transition: "all 0.15s" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: idx === 0 ? sectionColor : T.panelBorder,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? T.bgPrimary : T.textMuted }}>{idx + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: idx === 0 ? sectionColor : T.textPrimary }}>{item.label}</div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{item.desc}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => onMove(idx, -1)} disabled={idx === 0}
                style={{ background: "transparent", border: `1px solid ${T.panelBorder}`, borderRadius: 3, cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 2, color: T.textMuted, display: "flex" }}>
                <ChevronUp size={12} />
              </button>
              <button onClick={() => onMove(idx, 1)} disabled={idx === order.length - 1}
                style={{ background: "transparent", border: `1px solid ${T.panelBorder}`, borderRadius: 3, cursor: idx === order.length - 1 ? "not-allowed" : "pointer", opacity: idx === order.length - 1 ? 0.3 : 1, padding: 2, color: T.textMuted, display: "flex" }}>
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────
// Dispatches to correct input component and always renders AffordanceBar
function QuestionCard({ q, r, updateResponse, markRankedMoved, sectionColor, qIndex, T, sounds }) {
  function handleSingleSelect(optId) {
    updateResponse(q.id, "selected", optId);
    sounds.playLock();
  }
  function handleMultiToggle(optId) {
    const prev = (r.selected || []);
    const next = prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId];
    updateResponse(q.id, "selected", next);
    sounds.playSelect();
  }
  function handleMatch(rowId, catId) {
    const prev = r.matches || {};
    updateResponse(q.id, "matches", { ...prev, [rowId]: catId });
    sounds.playSelect();
  }
  function handleRate(rowId, val) {
    const prev = r.ratings || {};
    updateResponse(q.id, "ratings", { ...prev, [rowId]: val });
    sounds.playSelect();
  }
  function handleMove(idx, dir) {
    const order = [...(r.order || q.items.map(i => i.id))];
    const target = idx + dir;
    if (target < 0 || target >= order.length) return;
    [order[idx], order[target]] = [order[target], order[idx]];
    updateResponse(q.id, "order", order);
    markRankedMoved(q.id);
    sounds.playSelect();
  }

  const typeLabels = { single:"Single Select", multi:"Multi Select", true_false:"True / False", abc_match:"Category Match", numeric_scale:"Numeric Scale", ranked:"Ranked Priority" };

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
        Q{qIndex + 1} -- {typeLabels[q.type]}
      </div>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 600, color: T.textPrimary, marginBottom: 14, lineHeight: 1.4 }}>
        {q.text}
      </div>

      {q.type === "single"        && <SingleSelectPills  q={q} r={r} onSelect={handleSingleSelect} sectionColor={sectionColor} T={T} />}
      {q.type === "multi"         && <MultiSelectPills   q={q} r={r} onToggle={handleMultiToggle}   sectionColor={sectionColor} T={T} />}
      {q.type === "true_false"    && <TrueFalseButtons   q={q} r={r} onSelect={handleSingleSelect}  sectionColor={sectionColor} T={T} />}
      {q.type === "abc_match"     && <ABCMatching        q={q} r={r} onMatch={handleMatch}           sectionColor={sectionColor} T={T} />}
      {q.type === "numeric_scale" && <NumericScale       q={q} r={r} onRate={handleRate}             sectionColor={sectionColor} T={T} />}
      {q.type === "ranked"        && <RankedPriority     q={q} r={r} onMove={handleMove}             sectionColor={sectionColor} T={T} />}

      <AffordanceBar qId={q.id} responses={{ [q.id]: r }} updateResponse={updateResponse} T={T} />
    </div>
  );
}

// ─── XPDisplay ────────────────────────────────────────────────────────────────
function XPDisplay({ xp, rankNames, T }) {
  const { name, progress } = getRank(xp, rankNames);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
      <Award size={14} color={T.accent} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: "0.06em" }}>{name}</span>
          <span style={{ fontSize: 9, color: T.textMuted }}>{xp} XP</span>
        </div>
        <div style={{ height: 3, background: T.panelBorder, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${T.accent}, ${T.accentBright})`, width: `${progress * 100}%`, transition: "width 0.5s" }} />
        </div>
      </div>
    </div>
  );
}

// ─── AchievementToast ─────────────────────────────────────────────────────────
// Fixed top-right, 4-second auto-dismiss per the standard
function AchievementToast({ achievement, onDismiss, T }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [achievement]);

  if (!achievement) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000,
      background: T.bgCard, border: `1px solid ${T.accent}`, borderRadius: 10, padding: "12px 16px",
      boxShadow: `0 4px 24px ${T.accent}30`, maxWidth: 260, animation: "fadeIn 0.3s ease" }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{achievement.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>{achievement.title}</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{achievement.desc}</div>
          <div style={{ fontSize: 9, color: T.accentBright, marginTop: 3 }}>+{achievement.xp} XP</div>
        </div>
        <button onClick={onDismiss} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, display: "flex" }}><X size={12} /></button>
      </div>
    </div>
  );
}

// ─── SettingsPanel ────────────────────────────────────────────────────────────
// Fixed right-side overlay with theme selector and feature toggles
function SettingsPanel({ open, onClose, settings, T }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900 }} onClick={onClose}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 320, height: "100vh", background: T.bgSecondary, borderLeft: `1px solid ${T.panelBorder}`, padding: 20, overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.textPrimary, letterSpacing: "0.1em" }}>SETTINGS</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, display: "flex" }}><X size={16} /></button>
        </div>

        <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Theme</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {Object.entries(THEMES).map(([k, v]) => (
            <button key={k} onClick={() => settings.setThemeKey(k)}
              style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", fontFamily: T.fontMono, textAlign: "left", transition: "all 0.15s",
                background: settings.themeKey === k ? T.accent : T.bgCard,
                border: `1px solid ${settings.themeKey === k ? T.accent : T.panelBorder}`,
                color: settings.themeKey === k ? T.bgPrimary : T.textPrimary }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{v.name}</div>
              <div style={{ fontSize: 9, marginTop: 2, opacity: 0.7 }}>{v.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Features</div>
        {[
          { label: "Gamification (XP + Ranks)", value: settings.gamification, toggle: settings.toggleGamification },
          { label: "Sound Cues",                value: settings.soundEnabled, toggle: settings.toggleSound },
        ].map(({ label, value, toggle }) => (
          <div key={label} onClick={toggle}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: T.bgCard, border: `1px solid ${T.panelBorder}`, borderRadius: 6, cursor: "pointer", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.textPrimary }}>{label}</span>
            <div style={{ width: 32, height: 18, borderRadius: 9, background: value ? T.accent : T.panelBorder, position: "relative", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 2, left: value ? 14 : 2, width: 14, height: 14, borderRadius: "50%", background: T.textPrimary, transition: "left 0.2s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SummaryView ──────────────────────────────────────────────────────────────
// Deterministic export format per the standard spec
function SummaryView({ open, onClose, responses, rankedMoved, T }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  // Build deterministic summary text
  const lines = [
    `AI ARCHITECTURE BEST PRACTICES BRAINSTORM`,
    `Captured: ${BRAINSTORM_DATA.capturedDate}`,
    ``,
    `PRE-LOCKED CONTEXT`,
    ...BRAINSTORM_DATA.preLockedNotes.map(n => `  - ${n}`),
  ];

  BRAINSTORM_DATA.sections.forEach(sec => {
    lines.push(``, `${"=".repeat(60)}`, sec.title.toUpperCase(), "=".repeat(60));
    sec.questions.forEach(q => {
      const r = responses[q.id] || {};
      lines.push(``, q.text);
      if (q.type === "single" || q.type === "true_false") {
        q.options.forEach(o => lines.push(`  ${r.selected === o.id ? "[x]" : "[ ]"} ${o.label}`));
      } else if (q.type === "multi") {
        q.options.forEach(o => lines.push(`  ${(r.selected || []).includes(o.id) ? "[x]" : "[ ]"} ${o.label}`));
      } else if (q.type === "abc_match") {
        const m = r.matches || {};
        q.rows.forEach(row => {
          const cat = q.options.find(o => o.id === m[row.id]);
          lines.push(`  ${row.label} -> ${cat ? `${cat.id}: ${cat.label}` : "(unassigned)"}`);
        });
      } else if (q.type === "numeric_scale") {
        const rat = r.ratings || {};
        q.rows.forEach(row => {
          const v = rat[row.id];
          const sl = v ? q.scaleLabels.find(s => s.value === v) : null;
          lines.push(`  ${row.label}: ${v ? `${v} (${sl?.label || ""})` : "(unrated)"}`);
        });
      } else if (q.type === "ranked") {
        const order = r.order || q.items.map(i => i.id);
        order.forEach((id, idx) => {
          const item = q.items.find(i => i.id === id);
          lines.push(`  ${idx + 1}. ${item?.label || id}`);
        });
      }
      if (r.freeText?.trim()) lines.push(`  OVERRIDE: ${r.freeText.trim()}`);
      if (r.hybrid?.trim())   lines.push(`  HYBRID NOTE: ${r.hybrid.trim()}`);
      if (r.flag?.trim())     lines.push(`  FEEDBACK FLAG: ${r.flag.trim()}`);
    });
  });

  const summaryText = lines.join("\n");

  async function copy() {
    await navigator.clipboard.writeText(summaryText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding: 24, width: "min(700px, 90vw)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.textPrimary, letterSpacing: "0.1em" }}>BRAINSTORM SUMMARY</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copy}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", background: copied ? `${T.success}20` : `${T.accent}18`, border: `1px solid ${copied ? T.success : T.accent}`, borderRadius: 5, color: copied ? T.success : T.accent, fontSize: 11, cursor: "pointer", fontFamily: T.fontMono, transition: "all 0.2s" }}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy Summary"}
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, display: "flex" }}><X size={16} /></button>
          </div>
        </div>
        <pre style={{ flex: 1, overflowY: "auto", fontFamily: T.fontMono, fontSize: 10, color: T.textPrimary, lineHeight: 1.6, whiteSpace: "pre-wrap", background: T.bgSecondary, border: `1px solid ${T.panelBorder}`, borderRadius: 6, padding: 14 }}>
          {summaryText}
        </pre>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [sectionIdx, setSectionIdx]   = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary]   = useState(false);
  const [toastAch, setToastAch]         = useState(null);
  const prevAchievements               = useRef(new Set());

  const { responses, updateResponse, rankedMoved, markRankedMoved } = useBrainstormState();
  const settings = useSettings();
  const T        = THEMES[settings.themeKey];
  const sounds   = useSoundCue(settings.soundEnabled);
  const { xp, achievements } = useGamification(responses, rankedMoved, settings.gamification);

  // Detect newly unlocked achievements and trigger toast + sound
  useEffect(() => {
    achievements.forEach(id => {
      if (!prevAchievements.current.has(id)) {
        const found = ACHIEVEMENTS.find(a => a.id === id);
        if (found) {
          setToastAch(found);
          sounds.playAchievement();
          // Level up detection -- play levelUp sound when rank increases
          const { rank: newRank } = getRank(xp, T.rankNames);
          const { rank: oldRank } = getRank(xp - found.xp, T.rankNames);
          if (newRank > oldRank) sounds.playLevelUp();
        }
        prevAchievements.current.add(id);
      }
    });
  }, [achievements]);

  // Total question count and answered count for progress bar
  const allQuestions = BRAINSTORM_DATA.sections.flatMap(s => s.questions);
  const answeredCount = allQuestions.filter(q => {
    const r = responses[q.id] || {};
    if (q.type === "single" || q.type === "true_false") return !!r.selected;
    if (q.type === "multi") return (r.selected || []).length > 0;
    if (q.type === "abc_match") return Object.keys(r.matches || {}).length > 0;
    if (q.type === "numeric_scale") return Object.keys(r.ratings || {}).length > 0;
    if (q.type === "ranked") return !!(r.order || rankedMoved[q.id]);
    return false;
  }).length;

  const section       = BRAINSTORM_DATA.sections[sectionIdx];
  const sectionColor  = T.sectionColors[sectionIdx % T.sectionColors.length];

  // Section completion check for tab checkmarks
  function isSectionComplete(sec, idx) {
    return sec.questions.every(q => {
      const r = responses[q.id] || {};
      if (q.type === "single" || q.type === "true_false") return !!r.selected;
      if (q.type === "multi") return (r.selected || []).length > 0;
      if (q.type === "abc_match") return Object.keys(r.matches || {}).length === q.rows.length;
      if (q.type === "numeric_scale") return Object.keys(r.ratings || {}).length === q.rows.length;
      if (q.type === "ranked") return !!(r.order || rankedMoved[q.id]);
      return false;
    });
  }

  return (
    <div style={{
      fontFamily: T.fontBody,
      background: T.bgPrimary,
      minHeight: "100vh",
      color: T.textPrimary,
      backgroundImage: `radial-gradient(ellipse at top left, ${sectionColor}0F 0%, transparent 60%), radial-gradient(ellipse at bottom right, ${T.accent}0A 0%, transparent 60%)`,
    }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${T.bgPrimary}; } ::-webkit-scrollbar-thumb { background: ${T.panelBorder}; border-radius: 3px; } button { font-family: inherit; }`}</style>

      {/* Achievement toast */}
      {toastAch && settings.gamification && (
        <AchievementToast achievement={toastAch} onDismiss={() => setToastAch(null)} T={T} />
      )}

      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} settings={settings} T={T} />
      <SummaryView open={showSummary} onClose={() => setShowSummary(false)} responses={responses} rankedMoved={rankedMoved} T={T} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: T.accentBright, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              {T.iconChar} {BRAINSTORM_DATA.capturedDate}
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: T.textPrimary, lineHeight: 1.2, marginBottom: 6 }}>
              {BRAINSTORM_DATA.title}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
              {BRAINSTORM_DATA.subtitle}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", flexShrink: 0, marginLeft: 20 }}>
            {settings.gamification && <XPDisplay xp={xp} rankNames={T.rankNames} T={T} />}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowSummary(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: `${T.accent}18`, border: `1px solid ${T.accent}40`, borderRadius: 5, color: T.accent, fontSize: 10, cursor: "pointer", letterSpacing: "0.06em" }}>
                Summary <ChevronRight size={11} />
              </button>
              <button onClick={() => setShowSettings(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "transparent", border: `1px solid ${T.panelBorder}`, borderRadius: 5, color: T.textMuted, fontSize: 10, cursor: "pointer" }}>
                <Settings size={11} /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Questions answered</span>
            <span style={{ fontSize: 9, color: T.accent }}>{answeredCount} / {allQuestions.length}</span>
          </div>
          <div style={{ height: 4, background: T.bgSecondary, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${T.accent}, ${T.accentBright})`, width: `${(answeredCount / allQuestions.length) * 100}%`, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
          {BRAINSTORM_DATA.sections.map((sec, idx) => {
            const sc = T.sectionColors[idx % T.sectionColors.length];
            const complete = isSectionComplete(sec, idx);
            const active = idx === sectionIdx;
            return (
              <button key={sec.id} onClick={() => setSectionIdx(idx)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: "6px 6px 0 0", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0,
                  background: active ? sc : "transparent",
                  border: `1px solid ${active ? sc : T.panelBorder}`,
                  borderBottom: active ? `3px solid ${sc}` : `3px solid transparent`,
                  color: active ? T.bgPrimary : T.textMuted }}>
                <span style={{ fontSize: 13 }}>{sec.icon}</span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{sec.title}</span>
                {complete && <Check size={10} color={active ? T.bgPrimary : T.success} />}
              </button>
            );
          })}
        </div>

        {/* Section header card */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.panelBorder}`, borderLeft: `4px solid ${sectionColor}`, borderRadius: 8, padding: "14px 18px", marginBottom: 14 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: sectionColor, marginBottom: 4 }}>
            {section.icon} {section.title}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{section.description}</div>
        </div>

        {/* Question dot indicators */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {section.questions.map((q, qi) => {
            const r = responses[q.id] || {};
            const answered = (q.type === "single" || q.type === "true_false") ? !!r.selected
              : q.type === "multi" ? (r.selected || []).length > 0
              : q.type === "abc_match" ? Object.keys(r.matches || {}).length > 0
              : q.type === "numeric_scale" ? Object.keys(r.ratings || {}).length > 0
              : q.type === "ranked" ? !!(r.order || rankedMoved[q.id]) : false;
            return (
              <div key={q.id} style={{ width: 10, height: 10, borderRadius: "50%", transition: "all 0.15s",
                background: answered ? sectionColor : "transparent",
                border: `1px solid ${answered ? sectionColor : T.textMuted}` }} />
            );
          })}
        </div>

        {/* Question cards */}
        {section.questions.map((q, qi) => (
          <QuestionCard key={q.id} q={q} r={responses[q.id] || {}} updateResponse={updateResponse}
            markRankedMoved={markRankedMoved} sectionColor={sectionColor} qIndex={qi} T={T} sounds={sounds} />
        ))}

        {/* Previous / next navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 24 }}>
          <button onClick={() => setSectionIdx(p => p - 1)} disabled={sectionIdx === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "transparent", border: `1px solid ${T.panelBorder}`, borderRadius: 6, color: T.textMuted, fontSize: 11, cursor: sectionIdx === 0 ? "not-allowed" : "pointer", opacity: sectionIdx === 0 ? 0.4 : 1, transition: "all 0.15s" }}>
            <ChevronLeft size={13} /> Prev
          </button>
          <span style={{ fontSize: 10, color: T.textMuted }}>{sectionIdx + 1} / {BRAINSTORM_DATA.sections.length}</span>
          <button onClick={() => setSectionIdx(p => p + 1)} disabled={sectionIdx === BRAINSTORM_DATA.sections.length - 1}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: sectionIdx < BRAINSTORM_DATA.sections.length - 1 ? sectionColor : T.success, border: "none", borderRadius: 6, color: T.bgPrimary, fontSize: 11, fontWeight: 700, cursor: sectionIdx === BRAINSTORM_DATA.sections.length - 1 ? "not-allowed" : "pointer", opacity: sectionIdx === BRAINSTORM_DATA.sections.length - 1 ? 0.4 : 1, transition: "all 0.15s" }}>
            Next <ChevronRight size={13} />
          </button>
        </div>

        {/* Non-accreditation disclaimer */}
        <div style={{ border: `1px dashed ${T.warning}50`, borderRadius: 8, padding: "12px 16px", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.warning, letterSpacing: "0.1em", marginBottom: 4 }}>ARCHITECTURE PLANNING TOOL -- NOT A PERFORMANCE GUARANTEE</div>
          <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.6 }}>
            This artifact is an architectural planning tool for internal Grizzwald Workshop use. AI model performance ratings referenced here are based on publicly available benchmark data as of May 2026 (LMSYS Chatbot Arena, HuggingFace Open LLM Leaderboard, Stability AI, Mistral AI). Actual performance varies by use case, hardware, quantization, and implementation. This artifact does not constitute a recommendation from any benchmark organization.
          </div>
        </div>

      </div>
    </div>
  );
}
