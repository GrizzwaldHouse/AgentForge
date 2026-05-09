# AgentForge Skills Reference

This file defines reusable skills that any agent or Claude Code session can reference. Skills are not code — they are documented patterns, verified knowledge, and reusable approaches that prevent reinventing the wheel across sessions.

---

## SKILL: VRAM Slot Management

**What it solves:** Prevents out-of-memory crashes when loading models on a 24 GB GPU.

**Pattern:**

```typescript
// /core/vram-watchdog/VramWatchdog.ts

import { exec } from "child_process";
import { promisify } from "util";
import { inferenceConfig } from "../config/models.config";

const execAsync = promisify(exec);

export class VramWatchdog {
  async getAvailableGb(): Promise<number> {
    const { stdout } = await execAsync(
      "nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits"
    );
    const freeMb = parseInt(stdout.trim(), 10);
    return freeMb / 1024;
  }

  async canLoad(slotKey: string): Promise<boolean> {
    const slotConfig = inferenceConfig.slots[slotKey];
    const available = await this.getAvailableGb();
    const safetyBufferGb = inferenceConfig.safetyBufferGb;
    return available >= slotConfig.vramBudgetGb + safetyBufferGb;
  }
}
```

**Config shape:**

```json
{
  "slots": {
    "slotA": {
      "modelName": "Qwen/Qwen3-Coder-30B-A3B-Instruct",
      "vramBudgetGb": 16,
      "task": "coding_reasoning"
    },
    "slotB": {
      "modelName": "hexgrad/Kokoro-82M",
      "vramBudgetGb": 1,
      "task": "tts"
    }
  },
  "safetyBufferGb": 2
}
```

**Rule:** Never call model.load() without checking this first.

---

## SKILL: Event Bus Pattern

**What it solves:** Decouples agents so they can be tested independently and run in parallel.

**Event types (define in /events/EventTypes.ts):**

```typescript
export const EventType = {
  JOB_DISCOVERED: "JOB_DISCOVERED",
  JOB_MATCHED: "JOB_MATCHED",
  PROPOSAL_GENERATED: "PROPOSAL_GENERATED",
  APPLICATION_READY: "APPLICATION_READY",
  VRAM_PRESSURE: "VRAM_PRESSURE",
  MODEL_SWITCHED: "MODEL_SWITCHED",
  AGENT_ERROR: "AGENT_ERROR",
} as const;

export type EventType = typeof EventType[keyof typeof EventType];
```

**Event payloads (define in /events/EventPayloads.ts):**

```typescript
export interface JobDiscoveredEvent {
  jobId: string;
  source: string;
  title: string;
  description: string;
  url: string;
  discoveredAt: string; // ISO 8601
  rawData: Record<string, unknown>;
}

export interface ProposalGeneratedEvent {
  jobId: string;
  proposalPath: string;
  modelUsed: string;
  tokensConsumed: number;
  generatedAt: string;
}
```

**OwlWatcher usage:**

```typescript
// Register listener (one listener per event type per agent)
owlWatcher.on(EventType.JOB_DISCOVERED, jobMatchingAgent.handle.bind(jobMatchingAgent));

// Emit event (never call agent directly)
owlWatcher.emit(EventType.JOB_DISCOVERED, payload);
```

---

## SKILL: Config-Driven Model Routing

**What it solves:** Allows model selection to change via config without touching business logic.

**Routing config shape (/config/models.config.json):**

```json
{
  "routingStrategy": {
    "primary": "local",
    "fallbackChain": ["hf-inference-providers", "direct-api"],
    "switchThreshold": {
      "vramPressureGb": 4,
      "tokenBudgetRemaining": 10000
    }
  },
  "localModels": {
    "coder": {
      "modelId": "Qwen/Qwen3-Coder-30B-A3B-Instruct",
      "hubUrl": "https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct",
      "license": "Apache-2.0",
      "vramGb": 16
    }
  },
  "cloudModels": {
    "heavyReasoning": {
      "modelId": "Qwen/Qwen3-72B",
      "provider": "cerebras",
      "baseUrl": "https://api-inference.huggingface.co/v1",
      "hubUrl": "https://huggingface.co/Qwen/Qwen3-72B",
      "license": "Apache-2.0"
    }
  }
}
```

---

## SKILL: Proposal Template System

**What it solves:** Gives the Proposal Generator agent a consistent, customizable template without hardcoding Marcus's background.

**Template file (/prompts/proposal.template.md):**

```markdown
# Proposal Template — {{platform}}

## Opening
{{opening_hook}}

## Relevant Experience
{{experience_block}}

## Approach to This Project
{{approach_block}}

## Why Me
- {{veteran_advantage}}
- {{technical_advantage}}
- {{portfolio_link}}

## Availability and Rate
{{availability_block}}
```

**Profile config (/config/marcus.profile.json):**

```json
{
  "name": "Marcus Daley",
  "tagline": "AI Systems Builder | Veteran | Game Developer",
  "veteranBackground": "8 years US Navy torpedoman, 3 years shipyard safety supervisor",
  "technicalStack": ["UE5", "C++", "Python", "TypeScript", "Hugging Face", "Claude Code"],
  "portfolioUrl": "https://grizzwaldhouse.github.io",
  "clearanceEligible": true,
  "preferredRate": {
    "hourly": { "min": 75, "max": 150 },
    "fixed": { "min": 500 }
  },
  "targetContracts": ["QA", "automation", "AI integration", "game dev", "tools engineering", "defense simulation"]
}
```

---

## SKILL: Verified HF Model Reference

Use this table when writing any code that references a model. Always use the exact model ID. Always include the HF URL as a comment.

| Use Case | Model ID | License | Notes |
|----------|----------|---------|-------|
| Local coding | Qwen/Qwen3-Coder-30B-A3B-Instruct | Apache-2.0 | 3B active params on MoE |
| Vision/OCR | Qwen/Qwen3-VL-7B-Instruct | Apache-2.0 | Screenshot reading |
| Image gen | black-forest-labs/FLUX.1-schnell | Apache-2.0 | 13 GB VRAM |
| 3D gen (client safe) | stabilityai/stable-point-aware-3d | MIT | SPAR3D, fast |
| TTS | hexgrad/Kokoro-82M | Apache-2.0 | 1 GB, CPU-capable |
| ASR | openai/whisper-large-v3-turbo | MIT | Fast, multilingual |
| Voice clone | myshell-ai/OpenVoice | MIT | Zero-shot |
| Heavy reasoning (cloud) | Qwen/Qwen3-72B | Apache-2.0 | Via HF Inference |
| Heavy reasoning (cloud) | meta-llama/Llama-3.3-70B-Instruct | Meta Llama | Commercial friendly |

**Do NOT use:**
- "GPT-OSS-20B" (does not exist)
- "LLaMA 3.6 CherryTorch 27B" (does not exist)
- Hunyuan3D-2.1 for EU/Korea/China clients (license restriction)

---

## SKILL: ChatGPT Verification Protocol

When using ChatGPT for research, prepend this to every query:

> Before answering: If you are uncertain about a model name, version number, license, VRAM requirement, or API spec, write UNVERIFIED next to that claim. Do not invent model names or version strings. Do not claim a model is Apache-2.0 without confirming the license tab on huggingface.co. If you cannot verify something from a primary source, say so explicitly.

After receiving a response, verify:
1. Every model name exists on HF Hub.
2. Every license claim matches the HF Hub license tab.
3. Every VRAM claim is plausible for the model size (approx. 2 GB per 1B params in fp16).
4. Every API endpoint exists and returns 200 with a test call.

---

## SKILL: Parallel Agent Session Coordination

When multiple Claude Code or Codex sessions run simultaneously:

**Session naming convention:**

```
claude-code-[date]-[task-id]
Example: claude-code-20260503-A1
```

**Claim process:**

1. Before writing code, write to README task table: `| T001 | A1 | Job Ingestion | IN_PROGRESS | claude-code-20260503-A1 | 2026-05-03T22:00Z |`
2. Commit this claim immediately before starting work.
3. If another session has already claimed the task (check README first), pick a different task.
4. Sessions working on separate agents never conflict.
5. Sessions touching shared files (/core/config, /events, /core/owl-watcher) must coordinate via PR comments.

---

## SKILL: Marcus Capability Profile for Job Matching

The Job Matching Agent scores jobs against this profile. All values are configurable.

**High-value keywords (weight: 1.0):**
QA engineer, test automation, tools engineer, game developer, game tester, UE5, Unreal Engine, C++, AI integration, automation engineer

**Medium-value keywords (weight: 0.7):**
Python, TypeScript, Node.js, React, REST API, simulation, defense, veteran, DoD, clearance

**Exclude list (weight: -1.0, auto-reject):**
Requires 5+ years React (conflicts), requires PMP certification (not held), requires active TS/SCI (not current)

**Minimum match score for proposal generation:** configurable, default 0.6

---

*Update this file whenever a new reusable pattern is established in the codebase.*
