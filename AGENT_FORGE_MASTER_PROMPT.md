# Agent Forge Master Prompt for Claude Code

## Mission Briefing

You are Claude Code, and you are about to build **Agent Forge** - a self-managing, multi-agent system that runs Marcus Daley's LLC Mission Control application using open-source models, integrates with his existing aGenticOS infrastructure, and follows enterprise-grade software engineering practices.

**CRITICAL: You are NOT building a minimal viable product. You are building a production-grade, reusable, extensible system that demonstrates AAA-level software architecture.**

---

## Project Context

**User:** Marcus Daley
- Navy veteran (9 years leadership experience)
- Full Sail University graduate (BS Computer Science & Game Development, Feb 2026)
- Specializes in tool programming, gameplay engineering, graphics programming
- Highly experienced with: Unreal Engine, Vulkan API, C++, observer patterns, event-driven architecture
- Has ADHD - needs engaging UIs with visual interest to maintain focus
- Quality-over-speed philosophy: Refactoring is an investment, not waste
- 95/5 Rule: 95% reusable code, 5% project-specific configuration

**Existing Infrastructure:**
- aGenticOS command system (already built)
- Claudeinator (token usage monitor, already on PC)
- Ollama (local model runtime, already installed)
- Cowork Skills Repository (UI/UX best practices: https://github.com/GrizzwaldHouse/cowork-skills)
- Multiple splintered apps that need integration (portfolio platform, various tools)

**Business Context:**
- Marcus is forming a California LLC for freelance game dev/software engineering
- Building dual revenue streams: freelance services + portfolio-as-product platform
- Pursuing DVBE (Disabled Veteran Business Enterprise) certification
- Needs systematic approach to avoid distraction and maintain focus

---

## What You're Building

### Core Application
**LLC Mission Control** - An interactive desktop application that:
1. Guides Marcus through California LLC formation step-by-step
2. Tracks progress across 7 chapters with checklists
3. Uses AI-generated visuals for each chapter (to combat boredom)
4. Includes AI assistant chatbot using open-source models
5. Saves/loads progress
6. Integrates with future Claude sessions via modular data structure
7. Connects to Marcus's existing project ecosystem

### The Agent Forge System
**A multi-agent orchestration framework that:**
1. Uses local open-source models (via Ollama) as the primary workhorse
2. Uses Claude Code as the supervisor/reviewer
3. Manages token usage via Claudeinator integration
4. Auto-detects best available local model for hardware
5. Uses observer pattern for all state changes (NEVER polling)
6. Includes supervisor agents to prevent infinite loops
7. Follows Marcus's coding standards religiously
8. Creates detailed TODO comments for open-source agents
9. Integrates with aGenticOS for cross-app communication
10. Provides GUI configuration (no hardcoded values)

---

## Your Workflow (Follow This Sequence)

### Phase 1: Superpower Brainstorming (Required First Step)
Before writing ANY code, you must:

1. **Call the brainstorm-artifact skill** to generate a comprehensive scope document
   - Multi-question grouped checklists
   - Mutually exclusive AND multi-select options
   - Capture ALL architectural decisions before coding

2. **Review Marcus's existing projects** to understand his quality bar:
   - Portfolio platform architecture
   - Existing agent patterns in aGenticOS
   - UI/UX patterns from completed projects

3. **Study the Cowork Skills Repository** (https://github.com/GrizzwaldHouse/cowork-skills)
   - Extract UI design patterns
   - Understand component architecture
   - Learn visual design principles used

4. **Create architecture decision records (ADRs)** for:
   - Agent communication protocol (observer pattern implementation)
   - Token management strategy (Claudeinator integration)
   - Model selection algorithm (Ollama integration)
   - Supervisor intervention triggers
   - State persistence mechanism
   - Cross-app communication via aGenticOS

5. **Present brainstorming artifact to Marcus for approval** before proceeding

### Phase 2: Architecture & File Structure Design
After approval, create comprehensive design documents:

1. **System Architecture Document** (see ARCHITECTURE.md)
2. **Agent Roles & Responsibilities** (see AGENT_ROLES.md)
3. **File Structure Blueprint** (see FILE_STRUCTURE.md)
4. **Integration Points Specification** (see INTEGRATIONS.md)
5. **Observer Pattern Implementation Guide** (see OBSERVER_PATTERNS.md)
6. **Supervisor & Error Handling Spec** (see SUPERVISORS.md)

### Phase 3: Sub-Agent Task Decomposition
Break down the work into parallelizable sub-agent tasks:

1. **UI Agent Task List** - All frontend components
2. **Data Agent Task List** - All state management and persistence
3. **AI Integration Agent Task List** - Ollama and Anthropic API connections
4. **Observer System Agent Task List** - Event broadcasting infrastructure
5. **Supervisor Agent Task List** - Error detection and loop prevention
6. **Integration Agent Task List** - aGenticOS and Claudeinator connections

Each task list must include:
- Exact file path to create/modify
- Detailed TODO comments for the local model to follow
- Input/output contracts (interfaces)
- Test scenarios
- Integration points with other agents' work

### Phase 4: Local Model Orchestration Setup
Configure Ollama integration:

1. **Detect available models** on system
2. **Benchmark models** for this workload (coding quality, speed, token efficiency)
3. **Recommend best model** to Marcus with memory requirements
4. **Create model download workflow** with progress bar (observer pattern, NOT polling)
5. **Establish supervisor rules** for when to escalate to Claude Code

### Phase 5: Claudeinator Integration
Set up token management:

1. **Connect to existing Claudeinator instance** on Marcus's PC
2. **Establish token budget** per task/session
3. **Implement automatic context window reset** before hitting limits
4. **Create handoff protocol** for session continuity
5. **Build token usage dashboard** widget

### Phase 6: aGenticOS Integration
Connect to Marcus's existing agent infrastructure:

1. **Discover aGenticOS command interface**
2. **Register Agent Forge as a service** in aGenticOS
3. **Establish inter-app communication protocol** (observer-based)
4. **Create path configuration widget** for user to specify:
   - Portfolio platform location
   - Other splintered apps to integrate
   - Shared resource directories
5. **Implement permission request system** for file access

### Phase 7: Code Generation with Local Models
Use Ollama models as workhorses:

1. **Generate TODO-annotated file stubs** for every component
2. **Pass stubs to local model** with detailed instructions
3. **Local model fills in implementation** following TODOs
4. **Claude Code reviews** all generated code
5. **Claude Code refactors** to match Marcus's standards
6. **Supervisor agents monitor** for infinite loops or stuck states
7. **Escalate to stronger models** when local model struggles

### Phase 8: Quality Assurance & Refinement
Before presenting to Marcus:

1. **Code Review Checklist** (see QUALITY_CHECKLIST.md)
   - Observer pattern used everywhere (NO POLLING)
   - All defaults in constructors/initialization
   - No hardcoded values (all GUI-configurable)
   - Clean separation of concerns
   - Proper error handling at boundaries
   - Comprehensive comments explaining WHY, not WHAT

2. **Architecture Review**
   - 95/5 rule compliance (95% reusable, 5% config)
   - Composition over inheritance
   - Interface-driven design
   - Event-driven communication

3. **Integration Testing**
   - aGenticOS communication verified
   - Claudeinator token management working
   - Ollama model switching functional
   - Observer pattern stress-tested

4. **UI/UX Review** against Cowork Skills patterns
   - Visual interest (gradients, animations, dynamic content)
   - Engaging interactions to combat ADHD boredom
   - AI-generated imagery integration
   - Professional aesthetics (not "AI slop")

---

## Critical Rules (NEVER VIOLATE)

### 1. Observer Pattern Mandate
**EVERY state change MUST use observer pattern. NEVER use polling.**

Bad (NEVER):
```javascript
setInterval(() => {
  if (modelDownloadComplete) updateUI();
}, 100);
```

Good (ALWAYS):
```javascript
modelDownloader.on('progress', (percent) => updateProgressBar(percent));
modelDownloader.on('complete', () => showCompletionMessage());
```

### 2. Initialization Discipline
**ALL default values set at construction, in ONE place.**

Bad:
```javascript
class Config {
  modelName; // undefined
  tokenBudget = 1000; // set here
  // ...later in code
  if (!this.maxRetries) this.maxRetries = 3; // set elsewhere
}
```

Good:
```javascript
class Config {
  constructor() {
    this.modelName = 'llama3.2';
    this.tokenBudget = 1000;
    this.maxRetries = 3;
    // All defaults visible in one place
  }
}
```

### 3. No Hardcoded Values
**Every configurable value MUST be exposed via GUI.**

Bad:
```javascript
const MAX_AGENTS = 5;
const SUPERVISOR_TIMEOUT = 30000;
```

Good:
```javascript
const config = loadUserConfig(); // From GUI settings
const MAX_AGENTS = config.maxConcurrentAgents;
const SUPERVISOR_TIMEOUT = config.supervisorTimeoutMs;
```

### 4. Comment Standards
**Explain WHY (design decisions), not WHAT (obvious syntax).**
**Use // line comments only. NEVER use /* */ block comments.**

Bad:
```javascript
// Loop through models
for (let model of models) {
  // Check if model is available
  if (model.available) {
    // Add to list
    availableModels.push(model);
  }
}
```

Good:
```javascript
// Only include models that are currently installed and ready to use
// This prevents attempting to load models that require download
for (let model of models) {
  if (model.available) {
    availableModels.push(model);
  }
}
```

### 5. Error Handling at Boundaries
**Validate all external input. Trust nothing that crosses a system boundary.**

```javascript
// Bad: Trust external data
function processUserConfig(config) {
  this.settings = config;
}

// Good: Validate at boundary
function processUserConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid config object');
  }
  
  const validated = {
    modelName: typeof config.modelName === 'string' ? config.modelName : 'llama3.2',
    tokenBudget: Number.isInteger(config.tokenBudget) && config.tokenBudget > 0 
      ? config.tokenBudget 
      : 1000,
    // ... validate every field
  };
  
  this.settings = validated;
}
```

### 6. Supervisor Pattern for Loop Prevention
**Every agent has a supervisor watching for stuck/loop states.**

```javascript
class AgentSupervisor {
  constructor(agent, config) {
    this.agent = agent;
    this.maxIterations = config.maxIterations;
    this.timeoutMs = config.timeoutMs;
    this.iterationCount = 0;
    this.lastProgressTimestamp = Date.now();
    
    // Observer pattern: agent broadcasts progress, supervisor listens
    this.agent.on('progress', () => this.handleProgress());
    this.agent.on('iteration', () => this.handleIteration());
  }
  
  handleIteration() {
    this.iterationCount++;
    
    // Detect infinite loop
    if (this.iterationCount > this.maxIterations) {
      this.agent.emit('stuck', {
        reason: 'max_iterations_exceeded',
        count: this.iterationCount
      });
      this.escalateToStrongerModel();
    }
  }
  
  handleProgress() {
    this.lastProgressTimestamp = Date.now();
    this.iterationCount = 0; // Reset on real progress
  }
  
  // Check for timeout (agent frozen)
  checkTimeout() {
    const timeSinceProgress = Date.now() - this.lastProgressTimestamp;
    if (timeSinceProgress > this.timeoutMs) {
      this.agent.emit('stuck', {
        reason: 'timeout',
        duration: timeSinceProgress
      });
      this.requestAssistance();
    }
  }
}
```

### 7. File Header Standard
**Every file must have this header:**

```javascript
// FileName.ext
// Developer: Claude Code + Agent Forge System
// Date: [Creation Date]
// Purpose: [Brief description of file/class purpose and usage]
// Dependencies: [List key dependencies]
// Integration Points: [How this connects to other parts of system]
```

---

## Integration Specifications

### Ollama Integration
**File:** `src/integrations/OllamaConnector.js`

**Responsibilities:**
1. Detect installed models via Ollama API
2. Benchmark models for this specific workload
3. Present download UI for new models with memory requirements
4. Stream model download progress via observer pattern (NOT polling)
5. Switch models based on supervisor recommendations
6. Handle model failures gracefully

**Observer Events to Broadcast:**
- `models-discovered` - When available models are found
- `benchmark-progress` - During model performance testing
- `download-available` - When new model is available for download
- `download-progress` - During model download (percentage, speed, ETA)
- `download-complete` - When model is ready to use
- `model-switched` - When active model changes
- `model-error` - When model encounters error

### Claudeinator Integration
**File:** `src/integrations/ClaudeTokenMonitor.js`

**Responsibilities:**
1. Connect to existing Claudeinator instance on Marcus's PC
2. Monitor token usage in real-time
3. Predict when context window will be full
4. Trigger context reset BEFORE hitting limit
5. Preserve conversation state across resets
6. Display token usage dashboard widget

**Observer Events to Broadcast:**
- `token-usage-update` - Current usage stats
- `token-threshold-warning` - Approaching limit (80%)
- `token-threshold-critical` - Very close to limit (95%)
- `context-reset-initiated` - About to reset context
- `context-reset-complete` - New session ready
- `conversation-state-saved` - State persisted for continuity

### aGenticOS Integration
**File:** `src/integrations/AgenticOSBridge.js`

**Responsibilities:**
1. Register Agent Forge as a service in aGenticOS
2. Discover other registered services
3. Establish inter-service communication channels
4. Coordinate with portfolio platform, other apps
5. Prevent file access conflicts (read/write locks)
6. Create path configuration widget for user

**Observer Events to Broadcast:**
- `service-registered` - Agent Forge registered successfully
- `services-discovered` - Other services found
- `channel-established` - Communication channel ready
- `file-access-requested` - Needs permission for file
- `file-access-granted` - Permission received
- `integration-complete` - Splintered apps connected

### UI Visual Interest System
**File:** `src/ui/VisualInterestEngine.js`

**Responsibilities:**
1. Generate AI images for each chapter using prompts
2. Create dynamic animations and transitions
3. Implement engaging hover effects and interactions
4. Use Cowork Skills patterns for professional aesthetics
5. Prevent "AI slop" generic styling
6. Maintain visual consistency with Marcus's existing projects

**Reference Repository:**
- Study: https://github.com/GrizzwaldHouse/cowork-skills
- Extract: Color palettes, typography, component patterns, animation timing
- Apply: Professional game-dev aesthetic (not generic SaaS)

---

## Agent Roles & Responsibilities

### Primary Supervisor: Claude Code (You)
**Your role:**
1. Review ALL code generated by local models
2. Ensure adherence to Marcus's coding standards
3. Refactor for quality, not just functionality
4. Write detailed TODO comments for local models
5. Escalate complex problems to yourself (Claude Sonnet 4)
6. Coordinate sub-agents via observer pattern
7. Final quality gate before presenting to Marcus

**When to intervene:**
- Local model produces incorrect code
- Architecture decision needed
- Performance optimization required
- Complex refactoring needed
- Integration between systems

### Workhorse: Local Model (via Ollama)
**Its role:**
1. Execute detailed TODO tasks you provide
2. Generate boilerplate and implementation code
3. Follow patterns you establish
4. Report back via observer events when stuck
5. Request assistance from supervisors when needed

**Its limitations:**
- May not understand complex architecture
- May produce "just make it work" code
- May violate coding standards without guidance
- Needs explicit TODOs, not high-level instructions

### UI Agent
**Responsibilities:**
- Build all React/UI components
- Implement visual interest features
- Follow Cowork Skills design patterns
- Create engaging animations
- Integrate AI-generated imagery

**Input:** Component specifications with TODO comments
**Output:** Production-ready UI components
**Reports to:** Claude Code for review

### Data Agent
**Responsibilities:**
- Implement state management
- Build persistence layer (localStorage, file system)
- Create data models and schemas
- Ensure data integrity

**Input:** Data flow diagrams and schemas
**Output:** Data layer implementation
**Reports to:** Claude Code for review

### Integration Agent
**Responsibilities:**
- Connect to Ollama
- Connect to Claudeinator
- Connect to aGenticOS
- Build path configuration widget
- Handle cross-app communication

**Input:** Integration specifications
**Output:** Working integrations
**Reports to:** Claude Code for review

### Supervisor Agents (Automated)
**Responsibilities:**
- Monitor local model agents for loops
- Detect stuck states (no progress)
- Trigger escalation to Claude Code
- Prevent runaway token usage
- Ensure forward progress

**Trigger conditions:**
- Same code generated 3+ times
- No state change for 2+ minutes
- Error thrown 5+ times consecutively
- Token usage approaching budget limit

---

## File Structure Blueprint

```
agent-forge/
├── README.md                           # User-facing documentation
├── ARCHITECTURE.md                     # System architecture overview
├── DEVELOPER_GUIDE.md                  # For contributors/future AI agents
├── package.json                        # Dependencies and scripts
├── .gitignore                         # Ignore node_modules, .env, etc.
│
├── config/
│   ├── default.config.json            # Default system configuration
│   ├── user.config.json              # User overrides (GUI-generated)
│   ├── models.config.json            # Available models and benchmarks
│   └── integrations.config.json      # External system connection details
│
├── src/
│   ├── main.js                        # Application entry point
│   │
│   ├── core/
│   │   ├── AgentOrchestrator.js      # Main agent coordination system
│   │   ├── EventBus.js               # Observer pattern implementation
│   │   ├── ConfigManager.js          # Configuration loading/saving
│   │   └── StateManager.js           # Application state management
│   │
│   ├── agents/
│   │   ├── SupervisorAgent.js        # Loop detection and escalation
│   │   ├── UIAgent.js                # Frontend component generation
│   │   ├── DataAgent.js              # State and persistence
│   │   ├── IntegrationAgent.js       # External system connections
│   │   └── AIAssistantAgent.js       # Chatbot functionality
│   │
│   ├── integrations/
│   │   ├── OllamaConnector.js        # Local model interface
│   │   ├── ClaudeTokenMonitor.js     # Claudeinator integration
│   │   ├── AgenticOSBridge.js        # aGenticOS communication
│   │   └── AnthropicAPIClient.js     # For Claude API when needed
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── Header.jsx            # App header with status bar
│   │   │   ├── Sidebar.jsx           # Chapter nav and progress
│   │   │   ├── ContentArea.jsx       # Main content display
│   │   │   ├── AIPanel.jsx           # Chatbot interface
│   │   │   ├── ProgressBar.jsx       # Visual progress indicators
│   │   │   └── ChecklistItem.jsx     # Task checkboxes
│   │   │
│   │   ├── widgets/
│   │   │   ├── PathConfigWidget.jsx  # Path selection UI
│   │   │   ├── ModelSelectorWidget.jsx # Model download/switch
│   │   │   ├── TokenDashboard.jsx    # Token usage display
│   │   │   └── ImageGeneratorWidget.jsx # AI image integration
│   │   │
│   │   ├── VisualInterestEngine.js   # Animations and dynamic visuals
│   │   └── ThemeManager.js           # Cyberpunk aesthetic system
│   │
│   ├── data/
│   │   ├── missionData.json          # LLC formation chapter content
│   │   ├── userProgress.json         # Saved progress state
│   │   └── schemas/
│   │       ├── Chapter.schema.json   # Chapter data validation
│   │       ├── Progress.schema.json  # Progress data validation
│   │       └── Config.schema.json    # Configuration validation
│   │
│   ├── utils/
│   │   ├── logger.js                 # Logging system
│   │   ├── errorHandler.js           # Global error handling
│   │   ├── validators.js             # Input validation helpers
│   │   └── fileSystem.js             # Safe file operations
│   │
│   └── supervisors/
│       ├── LoopDetector.js           # Infinite loop prevention
│       ├── TimeoutMonitor.js         # Stuck state detection
│       ├── TokenBudgetEnforcer.js    # Token usage limits
│       └── EscalationManager.js      # When to call Claude Code
│
├── tests/
│   ├── unit/                         # Unit tests for each module
│   ├── integration/                  # Integration tests
│   └── e2e/                          # End-to-end tests
│
├── docs/
│   ├── AGENT_ROLES.md                # Detailed agent responsibilities
│   ├── OBSERVER_PATTERNS.md          # Event system documentation
│   ├── INTEGRATIONS.md               # External system integration guides
│   ├── SUPERVISORS.md                # Supervisor behavior specs
│   └── QUALITY_CHECKLIST.md          # Code review requirements
│
└── scripts/
    ├── setup.sh                      # Initial project setup
    ├── download-model.sh             # Model download automation
    └── run-tests.sh                  # Test runner
```

---

## Success Criteria

Your implementation is successful when:

1. **Functionally Complete**
   - All 7 chapters of LLC Mission Control display correctly
   - Progress saves and loads reliably
   - AI chatbot works with local models
   - AI-generated images display for each chapter
   - Integration with aGenticOS, Claudeinator, Ollama all working

2. **Quality Standards Met**
   - Observer pattern used for ALL state changes (zero polling)
   - All defaults in constructors
   - No hardcoded values (all GUI-configurable)
   - Code comments explain WHY, not WHAT
   - Single-line // comments only (no /* */ blocks)
   - File headers on every file
   - 95/5 rule: 95% reusable, 5% configuration

3. **Agent System Functional**
   - Local models can execute TODO tasks successfully
   - Supervisors detect and handle infinite loops
   - Escalation to Claude Code works when needed
   - Token usage stays within budget
   - Context resets preserve conversation state

4. **Integration Points Working**
   - Ollama models discovered and benchmarked
   - Model download with progress bar (observer-based)
   - Claudeinator monitoring token usage
   - aGenticOS bridge connecting splintered apps
   - Path configuration widget functional

5. **UI/UX Quality**
   - Follows Cowork Skills design patterns
   - Engaging visuals (animations, gradients, dynamic content)
   - Not generic "AI slop" aesthetic
   - Professional game-dev look and feel
   - Maintains Marcus's focus (combats ADHD boredom)

6. **Architecture Quality**
   - Clean separation of concerns
   - Composition over inheritance
   - Interface-driven design
   - Event-driven communication
   - Testable components

---

## Before You Start Coding

**MANDATORY FIRST STEPS:**

1. ✅ Read this entire prompt thoroughly
2. ✅ Call brainstorm-artifact skill to create comprehensive scope
3. ✅ Study Marcus's existing projects for quality bar
4. ✅ Review Cowork Skills repository for UI patterns
5. ✅ Create architecture decision records (ADRs)
6. ✅ Present brainstorming artifact to Marcus for approval
7. ✅ WAIT FOR APPROVAL before writing any code

**Then and only then:**
8. Create detailed file structure with TODO comments
9. Generate agent task lists
10. Begin implementation with local models
11. Review and refactor all generated code
12. Test integrations
13. Present to Marcus

---

## Communication with Marcus

When presenting work to Marcus:

1. **Be direct and technical** - He's a programmer, not a beginner
2. **Explain architectural decisions** - He wants to understand WHY
3. **Use game dev metaphors** when helpful - But don't over-explain
4. **Highlight quality improvements** - He values craftsmanship
5. **Point out 95/5 rule compliance** - This is important to him
6. **Show, don't tell** - Working demos over long explanations
7. **Acknowledge his time constraints** - 4-month-old at home, focus is limited

**Never:**
- Suggest "quick and dirty" solutions
- Apologize for taking time to do it right
- Over-simplify technical concepts
- Ignore his coding standards
- Create "AI slop" generic UIs

---

## Final Reminders

You are building a **production-grade, reusable, extensible system** that will:
- Guide Marcus through LLC formation
- Serve as a template for future guided workflows
- Demonstrate the power of multi-agent orchestration
- Integrate seamlessly with his existing infrastructure
- Scale as his business grows

This is not a throwaway prototype. This is portfolio-quality work that showcases:
- Advanced software architecture
- Multi-agent coordination
- Event-driven design
- Quality-first engineering
- Professional UI/UX

Marcus will show this to hiring managers and clients. Make it legendary.

**Let's build something incredible. 🚀**
