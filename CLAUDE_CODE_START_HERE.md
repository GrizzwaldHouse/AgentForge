# Agent Forge Build Instructions for Claude Code

**Project:** LLC Mission Control - Multi-Agent System  
**Developer:** Marcus Daley (Navy veteran, Full Sail grad, game dev specialist)  
**Supervisor:** Claude Code (you)  
**Workhorse:** Local models via Ollama  
**Status:** READY FOR SUPERPOWER BRAINSTORMING  

---

## Your Mission

Build a production-grade, multi-agent orchestration framework that guides Marcus through California LLC formation using local AI models, integrates with his existing aGenticOS infrastructure, and follows enterprise-level software engineering practices.

**This is portfolio-quality work. Make every line count.**

---

## Critical Files to Read BEFORE Starting

**MANDATORY - Read in this order:**

1. ✅ **AGENT_FORGE_MASTER_PROMPT.md** - Complete system overview and your workflow
2. ✅ **ARCHITECTURE.md** - System architecture and design decisions
3. ✅ **OBSERVER_PATTERNS.md** - How to implement observer pattern correctly
4. ✅ **QUALITY_CHECKLIST.md** - Code review requirements (all 40 items)
5. ✅ **AGENT_TASK_TEMPLATE.md** - How to create tasks for local models
6. ✅ **README.md** - User-facing documentation and setup guide

**DO NOT SKIP THESE. They contain critical patterns and standards.**

---

## Your Workflow (Follow This Exact Sequence)

### Phase 1: Superpower Brainstorming (REQUIRED FIRST STEP)

**DO THIS BEFORE WRITING ANY CODE:**

1. Read all documentation files listed above
2. Study Marcus's portfolio platform code (if paths configured)
3. Review Cowork Skills repository: https://github.com/GrizzwaldHouse/cowork-skills
4. Call `brainstorm-artifact` skill to create comprehensive scope
5. Present brainstorming artifact to Marcus for approval
6. **WAIT FOR APPROVAL** - Do not proceed without it

**Brainstorming should cover:**
- Agent communication protocol (observer pattern details)
- Token management strategy (Claudeinator integration approach)
- Model selection algorithm (how to choose best Ollama model)
- Supervisor intervention triggers (when to escalate)
- State persistence mechanism (localStorage vs file system)
- Cross-app communication via aGenticOS
- UI design patterns from Cowork Skills
- Deployment and installation flow

---

### Phase 2: Architecture Design Documents

After Marcus approves brainstorming, create:

1. **Architecture Decision Records (ADRs)** for each major decision
2. **Component Specifications** with clear responsibilities
3. **Event Flow Diagrams** showing observer pattern usage
4. **Integration Specifications** for Ollama/Claudeinator/aGenticOS
5. **UI Component Breakdown** based on Cowork Skills patterns

**Present these to Marcus for feedback before coding.**

---

### Phase 3: Task Decomposition for Local Models

Break work into parallelizable tasks for local model execution:

**UI Agent Tasks:**
- Header component with status bar
- Sidebar with chapter navigation
- Main content area with dynamic chapters
- AI assistant panel (chatbot UI)
- Progress bars and visualizations
- Checklist components

**Data Agent Tasks:**
- State manager
- Progress persistence (localStorage + file export)
- Configuration loader/validator
- Mission data JSON parser

**Integration Agent Tasks:**
- Ollama connector
- Claudeinator monitor
- aGenticOS bridge
- Path configuration widget

**Supervisor Agent Tasks:**
- Loop detector
- Timeout monitor
- Token budget enforcer
- Escalation manager

**For EACH task, create a TODO-annotated stub using AGENT_TASK_TEMPLATE.md pattern.**

---

### Phase 4: Local Model Orchestration

1. **Detect installed Ollama models** on Marcus's system
2. **Benchmark models** for this workload (coding quality vs speed)
3. **Recommend best model** with memory requirements shown
4. **Download model if needed** with progress bar (observer pattern!)
5. **Configure supervisor rules** for escalation thresholds

---

### Phase 5: Claudeinator Integration

1. **Detect Claudeinator** installation on Marcus's PC
2. **Establish connection** to token monitoring service
3. **Set token budget** per task/session
4. **Implement automatic reset** when approaching limit
5. **Preserve conversation state** across resets
6. **Build token dashboard** widget for UI

---

### Phase 6: aGenticOS Integration

1. **Discover aGenticOS** command interface
2. **Register Agent Forge** as a service
3. **Establish inter-app protocol** (observer-based)
4. **Create path configuration widget** for user to specify project paths
5. **Implement permission requests** before file access

---

### Phase 7: Code Generation with Local Models

1. **Pass TODO-annotated stubs** to local model via Ollama
2. **Local model fills in code** following TODOs step-by-step
3. **Monitor via supervisor agents** for loops/stuck states
4. **Review ALL generated code** against QUALITY_CHECKLIST.md
5. **Refactor to meet Marcus's standards** (observer pattern, no hardcoding, etc.)
6. **Test integration points** (Ollama, Claudeinator, aGenticOS)
7. **Run automated tests** if applicable

---

### Phase 8: Quality Assurance & Review

Before presenting to Marcus, verify:

**Code Quality (QUALITY_CHECKLIST.md):**
- [ ] Observer pattern used everywhere (NO polling)
- [ ] All defaults in constructors
- [ ] No hardcoded values (all configurable)
- [ ] Comments explain WHY, not WHAT
- [ ] File headers on every file
- [ ] Error handling at boundaries
- [ ] Proper separation of concerns

**Architecture Quality:**
- [ ] 95/5 rule (95% reusable, 5% config)
- [ ] Event-driven communication
- [ ] Composition over inheritance
- [ ] Clean dependency injection

**Integration Testing:**
- [ ] Ollama connection works
- [ ] Model switching functional
- [ ] Claudeinator monitoring active
- [ ] aGenticOS communication working
- [ ] Progress save/load reliable

**UI/UX Quality:**
- [ ] Follows Cowork Skills patterns
- [ ] Engaging visuals (not "AI slop")
- [ ] Responsive interactions (< 50ms)
- [ ] Accessibility standards met

**Must score 75/80 (94%) on QUALITY_CHECKLIST.md to pass.**

---

## Absolute Non-Negotiables

### 1. Observer Pattern Everywhere
**NO polling loops. ALL state changes emit events.**

```javascript
// ❌ NEVER EVER DO THIS
setInterval(() => { if (changed) update(); }, 100);

// ✅ ALWAYS DO THIS
eventBus.emit('state:changed', data);
eventBus.on('state:changed', () => update());
```

### 2. No Hardcoded Values
**Everything must be configurable via GUI or config file.**

```javascript
// ❌ REJECT
const MAX_RETRIES = 3;

// ✅ APPROVE
const MAX_RETRIES = this.config.maxRetries;
```

### 3. Initialization Discipline
**All defaults in constructors, in ONE place.**

```javascript
// ❌ REJECT - defaults scattered
class Agent {
  timeout; // undefined
  initialize() { if (!this.max) this.max = 3; }
}

// ✅ APPROVE - all together
class Agent {
  constructor() {
    this.timeout = 30000;
    this.max = 3;
  }
}
```

### 4. Comment Standards
**Use // only. Explain WHY, not WHAT. No /* */ blocks.**

```javascript
// ❌ REJECT
/* This function does X */
// Loop through items
for (let item of items) { ... }

// ✅ APPROVE
// Retry with exponential backoff to avoid thundering herd on recovery
for (let item of items) { ... }
```

### 5. File Headers
**Every file must have:**

```javascript
// FileName.ext
// Developer: Claude Code + Agent Forge System
// Date: [Date]
// Purpose: [What and why]
// Dependencies: [List]
// Integration Points: [How it connects]
```

---

## Marcus's Specific Context

**Background:**
- Navy veteran (9 years submarine service, quality assurance background)
- Full Sail University grad (BS CS & Game Dev, Feb 2026)
- Specializes in: Unreal Engine, Vulkan API, C++, observer patterns
- Has ADHD - needs engaging UIs with visual interest
- 4-month-old child at home - limited uninterrupted time
- Forming California LLC for freelance game dev business
- Pursuing DVBE certification (3% of CA state contracts reserved)

**Coding Philosophy:**
- Quality over speed ALWAYS
- 95/5 rule: 95% reusable, 5% config
- Observer pattern mandatory
- Configuration-driven design
- Refactoring is investment, not waste
- No "quick and dirty" solutions EVER

**UI Preferences:**
- Professional game-dev aesthetic (not generic SaaS)
- Engaging animations and gradients
- Dynamic content to combat boredom
- Cyberpunk/sci-fi styling acceptable
- Reference: https://github.com/GrizzwaldHouse/cowork-skills

---

## Integration Specifications

### Ollama (Required)
**File:** `src/integrations/OllamaConnector.js`

**Must support:**
- Model discovery via API
- Model downloading with streaming progress
- Model switching without restart
- Error handling when Ollama offline
- Multiple concurrent requests (with limits)

**Events to emit:**
```
ollama:connected
ollama:models:discovered
ollama:download:progress
ollama:download:completed
ollama:model:switched
ollama:error
```

### Claudeinator (Optional but Recommended)
**File:** `src/integrations/ClaudeTokenMonitor.js`

**Must support:**
- Real-time token usage monitoring
- Warning at 80% threshold
- Auto-reset at 95% threshold
- State preservation across resets
- Dashboard widget display

**Events to emit:**
```
claudeinator:connected
claudeinator:usage:update
claudeinator:threshold:warning
claudeinator:threshold:critical
claudeinator:reset:initiated
claudeinator:reset:completed
```

### aGenticOS (Optional)
**File:** `src/integrations/AgenticOSBridge.js`

**Must support:**
- Service registration
- Service discovery
- Inter-service communication
- File access coordination
- Permission management

**Events to emit:**
```
agentic:registered
agentic:services:discovered
agentic:channel:established
agentic:file:requested
agentic:file:granted
```

---

## File Structure to Create

```
src/
├── core/
│   ├── EventBus.js              ← Central observer hub
│   ├── AgentOrchestrator.js     ← Coordinates all agents
│   ├── ConfigManager.js         ← Load/validate config
│   └── StateManager.js          ← Application state
│
├── agents/
│   ├── SupervisorAgent.js       ← Loop/timeout detection
│   ├── UIAgent.js               ← Component generation
│   ├── DataAgent.js             ← State + persistence
│   ├── IntegrationAgent.js      ← External connections
│   └── AIAssistantAgent.js      ← Chatbot functionality
│
├── integrations/
│   ├── OllamaConnector.js       ← Local model interface
│   ├── ClaudeTokenMonitor.js    ← Token management
│   ├── AgenticOSBridge.js       ← Service coordination
│   └── AnthropicAPIClient.js    ← Claude API (backup)
│
├── ui/
│   ├── components/              ← React components
│   ├── widgets/                 ← Specialized UI elements
│   ├── VisualInterestEngine.js  ← Animations + imagery
│   └── ThemeManager.js          ← Cyberpunk aesthetic
│
├── data/
│   ├── missionData.json         ← Chapter content
│   └── schemas/                 ← Validation schemas
│
├── utils/
│   ├── logger.js
│   ├── errorHandler.js
│   └── validators.js
│
└── supervisors/
    ├── LoopDetector.js
    ├── TimeoutMonitor.js
    ├── TokenBudgetEnforcer.js
    └── EscalationManager.js
```

---

## Success Criteria

**The project succeeds when:**

1. ✅ All 7 chapters display correctly
2. ✅ Progress saves/loads reliably
3. ✅ AI chatbot works with local models
4. ✅ AI-generated chapter images appear
5. ✅ Ollama integration functional
6. ✅ Claudeinator monitoring working (if installed)
7. ✅ aGenticOS communication active (if installed)
8. ✅ Observer pattern used everywhere (zero polling)
9. ✅ All defaults in constructors
10. ✅ No hardcoded values
11. ✅ Code comments explain WHY
12. ✅ File headers on all files
13. ✅ Scores 94%+ on QUALITY_CHECKLIST.md
14. ✅ Follows Cowork Skills UI patterns
15. ✅ Professional game-dev aesthetic

---

## What NOT to Do

❌ **Don't:**
- Start coding before brainstorming approval
- Use polling loops for state detection
- Hardcode configuration values
- Use block comments /* */
- Skip error handling
- Forget to clean up subscriptions
- Create generic "AI slop" UI
- Suggest "quick and dirty" solutions
- Violate the 95/5 rule
- Ignore Marcus's coding standards

---

## Communication with Marcus

**When presenting work:**
- Be direct and technical (he's a programmer)
- Explain architectural decisions (he wants to know WHY)
- Use game dev metaphors when helpful
- Highlight quality improvements
- Show working demos over long explanations

**Never:**
- Apologize for taking time to do it right
- Over-simplify technical concepts
- Suggest cutting corners
- Create minimal UIs

---

## Final Checklist Before Presenting

- [ ] Read all documentation files
- [ ] Completed Superpower Brainstorming
- [ ] Got Marcus's approval on brainstorm
- [ ] Created architecture documents
- [ ] Created TODO-annotated task stubs
- [ ] Local model executed tasks
- [ ] Reviewed ALL generated code
- [ ] Refactored to meet standards
- [ ] Ran tests
- [ ] Verified integrations work
- [ ] Checked against QUALITY_CHECKLIST.md (94%+ score)
- [ ] UI follows Cowork Skills patterns
- [ ] No polling anywhere
- [ ] No hardcoded values
- [ ] All defaults in constructors
- [ ] Comments explain WHY
- [ ] File headers present

**Only when ALL checked, present to Marcus.**

---

## Remember

You are building:
- Marcus's LLC formation tool
- His freelance business platform
- Portfolio-quality demonstration code
- Template for future agent-powered workflows

This will be shown to:
- Hiring managers
- Potential clients
- Other developers
- State contracting agencies (DVBE certification)

**Make it legendary. Make every line count.** 🚀

---

## Ready to Start?

1. Read all documentation files thoroughly
2. Study Cowork Skills repository
3. Create Superpower Brainstorming artifact
4. Present to Marcus for approval
5. Wait for confirmation
6. Then and only then: begin implementation

**Let's build something incredible together.**
