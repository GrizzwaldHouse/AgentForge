# Agent Forge: LLC Mission Control
## Self-Managing Multi-Agent System for Guided Workflows

**Version:** 1.0.0  
**Author:** Marcus Daley + Claude AI  
**Purpose:** Interactive desktop app for California LLC formation using local AI models

---

## What This Is

**Agent Forge** is a production-grade, multi-agent orchestration framework that:

✅ Guides you through California LLC formation step-by-step  
✅ Uses local open-source models (Ollama) as primary workhorse  
✅ Uses Claude Code as supervisor and quality gate  
✅ Prevents infinite loops with automated supervisors  
✅ Manages token usage via Claudeinator integration  
✅ Connects to your existing aGenticOS infrastructure  
✅ Saves/loads progress across sessions  
✅ Features engaging UI with AI-generated chapter imagery  
✅ Follows enterprise-grade software engineering practices  

**This is NOT a minimal prototype. This is portfolio-quality production software.**

---

## Package Contents

When you download and extract `agent-forge.zip`, you'll find:

```
agent-forge/
│
├── README.md                              ← You are here
├── SETUP.md                              ← First-time setup guide
├── AGENT_FORGE_MASTER_PROMPT.md          ← Master prompt for Claude Code
├── ARCHITECTURE.md                       ← System architecture overview
├── OBSERVER_PATTERNS.md                  ← Observer pattern implementation guide
├── QUALITY_CHECKLIST.md                  ← Code review standards
├── AGENT_TASK_TEMPLATE.md                ← Template for creating local model tasks
│
├── config/
│   ├── path-configuration.json           ← Path mapping widget config
│   ├── ollama.config.json               ← Ollama connection settings
│   ├── claudeinator.config.json         ← Token monitor settings
│   └── agentic-os.config.json           ← aGenticOS integration
│
├── installer/
│   ├── setup-wizard.html                 ← First-run configuration UI
│   ├── detect-integrations.js           ← Auto-detect Ollama/Claudeinator
│   └── request-permissions.js           ← File access permission flow
│
└── prompt-for-claude-code.md            ← Final consolidated prompt
```

---

## Prerequisites

Before running Agent Forge, ensure you have:

### Required (Must Have)
- ✅ **Claude Code** installed on your PC
- ✅ **Ollama** installed and running ([download](https://ollama.com))
- ✅ At least one Ollama model installed (recommended: `llama3.2` or `codellama`)
- ✅ **Node.js** (v18+ recommended)
- ✅ At least 8GB RAM (16GB recommended for larger models)

### Optional (Enhances Experience)
- ⚪ **Claudeinator** (token usage monitor)
- ⚪ **aGenticOS** (if integrating with other agent systems)
- ⚪ Your existing portfolio platform repository
- ⚪ Other splintered apps you want to connect

---

## Quick Start (5 Minutes)

### Step 1: Extract Files

```bash
# Extract the zip to your desired location
unzip agent-forge.zip -d ~/projects/agent-forge
cd ~/projects/agent-forge
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or if using yarn
yarn install
```

### Step 3: Run First-Time Setup

```bash
# Launch configuration wizard
npm run setup

# Or manually open installer/setup-wizard.html in browser
```

The setup wizard will:
1. Detect Ollama installation
2. Show available models
3. Recommend best model for your hardware
4. Offer to download additional models
5. Prompt for paths to your other projects
6. Request file access permissions
7. Connect to Claudeinator (if installed)
8. Register with aGenticOS (if installed)

### Step 4: Launch Claude Code with Master Prompt

```bash
# Open Claude Code and paste this command:
claude-code --prompt-file="./AGENT_FORGE_MASTER_PROMPT.md" --workspace="./"
```

Or manually:
1. Open Claude Code
2. Load `AGENT_FORGE_MASTER_PROMPT.md`
3. Point Claude Code to this directory
4. Let Claude Code run through the Superpower Brainstorming phase

---

## Directory Structure (After Build)

Once Claude Code completes the build, the project structure will look like:

```
agent-forge/
├── src/
│   ├── core/
│   │   ├── EventBus.js
│   │   ├── AgentOrchestrator.js
│   │   ├── ConfigManager.js
│   │   └── StateManager.js
│   │
│   ├── agents/
│   │   ├── SupervisorAgent.js
│   │   ├── UIAgent.js
│   │   ├── DataAgent.js
│   │   ├── IntegrationAgent.js
│   │   └── AIAssistantAgent.js
│   │
│   ├── integrations/
│   │   ├── OllamaConnector.js
│   │   ├── ClaudeTokenMonitor.js
│   │   ├── AgenticOSBridge.js
│   │   └── AnthropicAPIClient.js
│   │
│   ├── ui/
│   │   ├── components/
│   │   ├── widgets/
│   │   ├── VisualInterestEngine.js
│   │   └── ThemeManager.js
│   │
│   ├── data/
│   │   ├── missionData.json
│   │   └── schemas/
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   │
│   └── supervisors/
│       ├── LoopDetector.js
│       ├── TimeoutMonitor.js
│       └── EscalationManager.js
│
├── config/
│   ├── default.config.json
│   ├── user.config.json
│   └── models.config.json
│
├── dist/                              ← Built application
├── tests/                             ← Automated tests
└── docs/                              ← Generated documentation
```

---

## Configuration Files Explained

### `config/path-configuration.json`

Maps where Agent Forge can find your other projects:

```json
{
  "portfolioPlatform": "/path/to/portfolio-platform",
  "spaghettiRelay": "/path/to/SpaghettiRelay",
  "unrealMCP": "/path/to/UnrealMCP",
  "otherProjects": [
    "/path/to/project1",
    "/path/to/project2"
  ],
  "permissions": {
    "portfolioPlatform": "read-write",
    "spaghettiRelay": "read-only",
    "unrealMCP": "read-only"
  }
}
```

**How it works:**
- Setup wizard presents a GUI for selecting paths
- You click folders to add them
- Agent Forge requests permission before accessing files
- Permissions are remembered across sessions
- You can revoke access at any time

### `config/ollama.config.json`

Ollama API connection settings:

```json
{
  "apiUrl": "http://localhost:11434",
  "timeoutMs": 30000,
  "defaultModel": "llama3.2",
  "fallbackModel": "codellama",
  "maxConcurrentRequests": 3,
  "retryAttempts": 3
}
```

### `config/claudeinator.config.json`

Token usage monitoring:

```json
{
  "enabled": true,
  "warningThreshold": 0.8,
  "criticalThreshold": 0.95,
  "autoResetOnCritical": true,
  "preserveStateOnReset": true
}
```

### `config/agentic-os.config.json`

aGenticOS integration:

```json
{
  "enabled": true,
  "serviceRegistry": "http://localhost:8080",
  "serviceName": "agent-forge-llc-mission-control",
  "capabilities": [
    "guided-workflow",
    "multi-agent-orchestration",
    "local-model-integration"
  ]
}
```

---

## How to Use

### Normal Workflow

1. **Launch the app:**
   ```bash
   npm start
   ```

2. **Navigate through chapters:**
   - Click chapter in sidebar to jump to it
   - Complete checklist items by clicking checkboxes
   - Progress auto-saves

3. **Use AI Assistant:**
   - Click "🤖 AI Assistant" button
   - Ask questions about current chapter
   - Get personalized advice based on your veteran status

4. **View AI-generated chapter imagery:**
   - Each chapter has unique AI-generated visual
   - Images generated from prompts in `missionData.json`
   - Keeps you engaged, combats ADHD boredom

5. **Save/Load progress:**
   - Click "💾 Save Progress" to export `.json` file
   - Click "📂 Load Progress" to restore from saved file
   - Progress also auto-saves to localStorage

### Advanced: Extending with New Chapters

1. **Edit `src/data/missionData.json`:**
   ```json
   {
     "id": "new_chapter",
     "title": "Chapter Title",
     "imagePrompt": "Description for AI image generation",
     "content": "HTML content with chapters and checklists",
     "checklist": [
       { "id": "task_1", "text": "Task description" }
     ]
   }
   ```

2. **Reload app** - new chapter appears in sidebar

3. **Future Claude sessions** can add chapters by:
   - Importing existing `missionData.json`
   - Adding new chapter object
   - Re-exporting

---

## Understanding the Agent System

### Agent Roles

**Claude Code (You Reading This)**
- Primary supervisor
- Reviews all code from local models
- Makes architectural decisions
- Escalates complex problems
- Final quality gate

**Local Model (via Ollama)**
- Code generation workhorse
- Follows detailed TODO instructions
- Executes repetitive tasks
- Reports when stuck

**Supervisor Agents (Automated)**
- Monitor local model for loops
- Detect stuck states
- Trigger escalation to Claude Code
- Prevent runaway token usage

**Specialized Sub-Agents**
- UI Agent: Build React components
- Data Agent: State management
- Integration Agent: External connections
- AI Assistant Agent: Chatbot functionality

### Communication Flow

```
User interacts with UI
     ↓
UI emits event via EventBus
     ↓
Agent Orchestrator hears event
     ↓
Orchestrator assigns task to appropriate agent
     ↓
Agent broadcasts progress events
     ↓
Supervisor monitors for problems
     ↓
Agent completes and emits result
     ↓
UI listens and updates display
```

**Key principle: Observer pattern everywhere. No polling.**

---

## Troubleshooting

### "Cannot connect to Ollama"

**Solution:**
1. Verify Ollama is running: `ollama list`
2. Check API URL in `config/ollama.config.json`
3. Try `curl http://localhost:11434/api/tags`
4. If offline, restart Ollama service

### "Model download stuck at X%"

**Solution:**
- Download is actually streaming, not stuck
- Check Ollama logs for errors
- Verify internet connection
- Try smaller model first

### "Supervisor keeps escalating to Claude Code"

**Possible causes:**
- Local model doesn't understand TODO instructions
- Task is too complex for local model
- Config setting for max iterations is too low

**Solution:**
- Let Claude Code handle it (that's what it's for)
- Or adjust `supervisor.config.json` to allow more iterations

### "Token usage warning appearing"

**Expected behavior:**
- Claudeinator warns at 80% of budget
- Auto-resets at 95% to prevent interruption
- State is preserved across resets

**If unwanted:**
- Adjust thresholds in `claudeinator.config.json`
- Increase token budget
- Disable auto-reset

### "Path configuration widget not finding my projects"

**Solution:**
1. Open `config/path-configuration.json`
2. Manually add paths as absolute paths
3. Reload app
4. Grant permissions when prompted

---

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- agents

# Run with coverage
npm test -- --coverage
```

### Building for Production

```bash
# Create optimized build
npm run build

# Build outputs to dist/
```

### Logging and Debugging

```bash
# Enable verbose logging
DEBUG=* npm start

# View event history
# In browser console:
eventBus.getRecentEvents(50)

# View performance metrics
eventBus.getMetrics()
```

---

## Architecture Highlights

### Observer Pattern Implementation

**Every state change uses observer pattern. No polling. Period.**

```javascript
// ❌ WRONG - Polling
setInterval(() => {
  if (downloadComplete) updateUI();
}, 100);

// ✅ RIGHT - Observer
eventBus.emit('download:completed', data);
eventBus.on('download:completed', () => updateUI());
```

### Configuration-Driven Design

**No hardcoded values. Everything configurable via GUI or config files.**

```javascript
// ❌ WRONG - Hardcoded
const MAX_RETRIES = 3;

// ✅ RIGHT - Configurable
const MAX_RETRIES = this.config.maxRetries;
```

### Initialization Discipline

**All defaults in constructors, in one place.**

```javascript
// ❌ WRONG - Scattered defaults
class Agent {
  timeout; // undefined
  constructor() {
    if (!this.maxRetries) this.maxRetries = 3; // Later
  }
}

// ✅ RIGHT - All together
class Agent {
  constructor() {
    this.timeout = 30000;
    this.maxRetries = 3;
    // All defaults visible
  }
}
```

---

## Integration with Your Existing Projects

### Connecting Portfolio Platform

1. **Add path in configuration widget**
2. **Grant read-write permission**
3. **Agent Forge can now:**
   - Read existing project structure
   - Understand your UI patterns
   - Coordinate file updates without conflicts
   - Apply learnings to future projects

### Connecting Splintered Apps

Agent Forge can coordinate multiple apps through aGenticOS:

```
Agent Forge (orchestrator)
    ↓ communication via aGenticOS
    ├── Portfolio Platform (website)
    ├── SpaghettiRelay (communication tool)
    ├── UnrealMCP (Unreal Engine integration)
    └── Other projects
```

**Benefits:**
- No file access conflicts
- Centralized coordination
- Event-driven communication
- Shared state management

---

## Performance Expectations

### Startup Time
- **Cold start:** < 3 seconds to UI
- **With model loading:** < 10 seconds

### Responsiveness
- **UI interactions:** < 50ms
- **Event propagation:** < 10ms
- **Model inference:** Depends on model/hardware

### Resource Usage
- **Memory (base):** ~500MB
- **Memory (with 7B model):** ~2-4GB
- **Memory (with 13B model):** ~8-10GB
- **CPU:** Minimal when idle, burst during inference

---

## Security & Privacy

### File Access
- User grants explicit permission
- All access logged
- Can revoke at any time
- Read-only by default

### API Keys
- Stored encrypted locally
- Never transmitted except to intended API
- Never logged
- User can delete at any time

### Model Execution
- Runs locally (no cloud)
- No data leaves your machine (unless Anthropic API used)
- Code execution sandboxed
- Supervisor monitors for unsafe operations

---

## What's Next?

After LLC formation, Agent Forge can be extended for:

1. **Tax Planning Workflows**
2. **Client Onboarding Flows**
3. **Project Management Workflows**
4. **Learning Pathways**
5. **Custom Business Processes**

The modular architecture makes it easy to add new guided workflows.

---

## Support & Feedback

### Reporting Issues

Create a detailed issue report with:
- **Symptom:** What you observed
- **Expected:** What should happen
- **Steps to reproduce:** How to see the problem
- **System info:** OS, Node version, Ollama version
- **Logs:** Copy from `logs/` directory

### Feature Requests

Describe:
- **What:** Feature you want
- **Why:** Problem it solves
- **How:** How you envision using it

### Contributing

This is a living system. Future Claude sessions can:
- Add new chapters
- Improve agent coordination
- Optimize model performance
- Enhance UI/UX
- Add integrations

---

## Credits

**Designed & Built By:**
- Marcus Daley (Navy veteran, Full Sail grad, game developer)
- Claude AI (Anthropic)

**Influenced By:**
- Marcus's Navy submarine quality assurance experience
- AAA game development practices (Nick Penney, Full Sail)
- Observer pattern from Unreal Engine architecture
- Event-driven design from modern web frameworks

**Built With:**
- React 19
- Tailwind CSS 4
- Ollama (local models)
- Claude Code (supervision & review)
- Anthropic API (when needed)

---

## License

**For Marcus's Use:**
- Build your freelance business
- Show to clients and hiring managers
- Use as template for future projects
- Modify as needed

**Sharing:**
- If sharing publicly, maintain attribution
- Don't present as entirely your own work
- Credit Claude AI partnership

---

## Final Words

This is not just an LLC formation tool. It's a demonstration of:
- Production-grade multi-agent architecture
- Quality-first software engineering
- Event-driven design at scale
- Local AI integration done right
- Portfolio-quality craftsmanship

Use it to form your LLC. Use it to show clients your standards. Use it as a foundation for future agent-powered workflows.

**You're not building a side project. You're building a business platform.** 🚀

---

## Quick Command Reference

```bash
# Setup
npm install              # Install dependencies
npm run setup            # First-time configuration

# Development
npm start                # Launch app
npm test                 # Run tests
npm run build            # Production build

# Claude Code Integration
claude-code --prompt-file="./AGENT_FORGE_MASTER_PROMPT.md"

# Ollama Management
ollama list              # Show installed models
ollama pull llama3.2     # Download model
ollama serve             # Start Ollama API

# Debugging
DEBUG=* npm start        # Verbose logging
npm run lint             # Check code quality
```

---

**Ready to launch your LLC and build your empire? Let's go.** 🚀
