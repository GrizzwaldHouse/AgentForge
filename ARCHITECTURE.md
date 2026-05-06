# Agent Forge System Architecture

## System Overview

Agent Forge is a multi-agent orchestration framework that combines:
- **Claude Code** (supervisor, quality gate)
- **Local open-source models via Ollama** (code generation workhorse)
- **Supervisor agents** (loop detection, error handling)
- **Integration layer** (aGenticOS, Claudeinator, external apps)
- **Event-driven communication** (observer pattern throughout)

---

## Core Principles

### 1. Observer Pattern for All Communication
**Every state change broadcasts an event. Every component that cares listens to that event.**

```
Component A                Event Bus                Component B
    |                          |                          |
    |---[state changed]------->|                          |
    |                          |---[notify listeners]---->|
    |                          |                          |---[update UI]
```

**Benefits:**
- Component A doesn't know or care about Component B
- Easy to add new listeners without changing broadcaster
- No polling loops wasting CPU
- Clean separation of concerns

### 2. Multi-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  (LLC Mission Control App - Chapters, Checklists, Progress)    │
└─────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ UI Events
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT BUS (Observer Hub)                    │
│            Central nervous system of the application             │
└─────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ Events from all subsystems
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT ORCHESTRATOR                          │
│   Coordinates sub-agents, manages tasks, handles escalation     │
└─────────────────────────────────────────────────────────────────┘
         ▲                       ▲                        ▲
         │                       │                        │
    ┌────┴────┐            ┌────┴────┐             ┌────┴────┐
    │ UI      │            │ Data    │             │ AI      │
    │ Agent   │            │ Agent   │             │ Agent   │
    └────┬────┘            └────┬────┘             └────┬────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPERVISOR LAYER                         │
│  Loop Detector | Timeout Monitor | Token Budget | Escalation    │
└─────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ Monitoring & Intervention
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXECUTION LAYER                             │
│   Local Models (Ollama) | Claude Code | File System | APIs      │
└─────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ External Integrations
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
│   aGenticOS | Claudeinator | Portfolio App | Other Services     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Deep Dive

### Event Bus (Central Nervous System)

**Purpose:** Single point of communication for the entire system.

**Responsibilities:**
- Maintain list of event types and their listeners
- Broadcast events to all registered listeners
- Provide subscribe/unsubscribe interface
- Log all events for debugging
- Enforce event naming conventions

**Event Naming Convention:**
```
<domain>:<action>:<detail>

Examples:
- agent:task:started
- agent:task:completed
- agent:task:failed
- ollama:model:downloading
- ollama:model:downloaded
- claudeinator:token:warning
- claudeinator:token:critical
- supervisor:loop:detected
- supervisor:timeout:triggered
- ui:chapter:changed
- ui:task:toggled
- data:progress:saved
```

**Implementation Pattern:**
```javascript
// EventBus.js
// Developer: Claude Code + Agent Forge System
// Date: [Auto-generated]
// Purpose: Central event broadcasting and subscription system
// Dependencies: None (standalone)
// Integration Points: Used by all components

class EventBus {
  constructor() {
    // Map of event types to arrays of listener functions
    this.listeners = new Map();
    
    // Event history for debugging (last 1000 events)
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }
  
  // Subscribe to an event type
  // Returns unsubscribe function for cleanup
  on(eventType, listenerFn) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType).push(listenerFn);
    
    // Return unsubscribe function for cleanup
    return () => this.off(eventType, listenerFn);
  }
  
  // Unsubscribe from an event type
  off(eventType, listenerFn) {
    if (!this.listeners.has(eventType)) return;
    
    const listeners = this.listeners.get(eventType);
    const index = listeners.indexOf(listenerFn);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  
  // Broadcast an event to all listeners
  emit(eventType, data = {}) {
    // Add to history for debugging
    this.addToHistory({ eventType, data, timestamp: Date.now() });
    
    // Notify all listeners
    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType);
      
      // Call each listener with the event data
      // Use try-catch to prevent one failing listener from breaking others
      listeners.forEach(listenerFn => {
        try {
          listenerFn(data);
        } catch (error) {
          console.error(`Error in listener for ${eventType}:`, error);
          // Emit error event so supervisor can handle it
          this.emit('system:listener:error', { eventType, error });
        }
      });
    }
  }
  
  // Add event to history, maintaining size limit
  addToHistory(event) {
    this.eventHistory.push(event);
    
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift(); // Remove oldest
    }
  }
  
  // Get recent events (for debugging)
  getRecentEvents(count = 50) {
    return this.eventHistory.slice(-count);
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

---

### Agent Orchestrator (Mission Control)

**Purpose:** Coordinates all sub-agents and manages the overall workflow.

**Responsibilities:**
- Initialize all sub-agents
- Distribute tasks to appropriate agents
- Monitor agent progress via events
- Handle agent failures and retries
- Coordinate multi-agent workflows
- Escalate to Claude Code when needed

**Task Distribution Strategy:**
```
User Request
    ↓
Orchestrator analyzes request
    ↓
Determines which agents needed
    ↓
Creates task queue
    ↓
Assigns tasks to agents
    ↓
Monitors via observer events
    ↓
Aggregates results
    ↓
Presents to user
```

**Agent Selection Logic:**
```javascript
// AgentOrchestrator.js
// Developer: Claude Code + Agent Forge System
// Date: [Auto-generated]
// Purpose: Coordinate all sub-agents and manage task distribution
// Dependencies: EventBus, all agent classes
// Integration Points: All agents, supervisors, UI

class AgentOrchestrator {
  constructor(eventBus, config) {
    this.eventBus = eventBus;
    this.config = config;
    
    // Initialize all agents
    this.agents = {
      ui: new UIAgent(eventBus, config.ui),
      data: new DataAgent(eventBus, config.data),
      ai: new AIAssistantAgent(eventBus, config.ai),
      integration: new IntegrationAgent(eventBus, config.integration)
    };
    
    // Initialize supervisors for each agent
    this.supervisors = new Map();
    Object.entries(this.agents).forEach(([name, agent]) => {
      this.supervisors.set(name, new SupervisorAgent(agent, config.supervisor));
    });
    
    // Task queue
    this.taskQueue = [];
    this.activeTasks = new Map();
    
    // Listen for agent events
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Agent task completion
    this.eventBus.on('agent:task:completed', (data) => {
      this.handleTaskCompleted(data);
    });
    
    // Agent task failure
    this.eventBus.on('agent:task:failed', (data) => {
      this.handleTaskFailed(data);
    });
    
    // Supervisor escalation
    this.eventBus.on('supervisor:escalation:needed', (data) => {
      this.handleEscalation(data);
    });
  }
  
  // User requests something - orchestrator figures out how to do it
  async handleUserRequest(request) {
    // Determine which agents are needed for this request
    const agentsNeeded = this.analyzeRequest(request);
    
    // Create task breakdown
    const tasks = this.createTaskBreakdown(request, agentsNeeded);
    
    // Add to queue
    tasks.forEach(task => this.taskQueue.push(task));
    
    // Start processing queue
    this.processQueue();
  }
  
  // TODO for local model: Implement request analysis logic
  // Analyze what type of request this is and which agents can handle it
  // Examples:
  // - "Generate chapter image" -> AI Agent
  // - "Save progress" -> Data Agent
  // - "Update UI theme" -> UI Agent
  // - "Connect to Ollama" -> Integration Agent
  analyzeRequest(request) {
    // TODO: Implement analysis logic
    return [];
  }
  
  // TODO for local model: Break request into agent-specific tasks
  // Each task should specify:
  // - Which agent handles it
  // - What inputs it needs
  // - What output it should produce
  // - Success criteria
  createTaskBreakdown(request, agentsNeeded) {
    // TODO: Implement task breakdown logic
    return [];
  }
}
```

---

### Supervisor Layer (Safety Net)

**Purpose:** Prevent agents from getting stuck, looping, or consuming excessive resources.

**Four Supervisor Types:**

1. **Loop Detector**
   - Monitors agent iterations
   - Detects when agent is repeating same actions
   - Triggers after N identical iterations (configurable)
   - Escalates to stronger model or human

2. **Timeout Monitor**
   - Tracks time since last progress
   - Triggers if no progress for X minutes (configurable)
   - Requests assistance from other agents
   - Escalates if still stuck

3. **Token Budget Enforcer**
   - Monitors token consumption via Claudeinator
   - Warns at 80% of budget
   - Forces context reset at 95% of budget
   - Preserves conversation state across resets

4. **Escalation Manager**
   - Decides when to call Claude Code for help
   - Determines if problem needs stronger model
   - Coordinates multi-agent assistance
   - Reports to user when human decision needed

**Escalation Decision Tree:**
```
Agent reports problem
    ↓
Is it a known issue with solution?
    YES → Apply solution automatically
    NO → Continue
    ↓
Can another agent help?
    YES → Request assistance
    NO → Continue
    ↓
Would stronger local model help?
    YES → Switch to stronger model
    NO → Continue
    ↓
Does it require Claude Code review?
    YES → Escalate to Claude Code
    NO → Continue
    ↓
Does it require human decision?
    YES → Notify user, pause work
    NO → Continue trying with timeout
```

---

### Integration Layer (External Connections)

**Three Critical Integrations:**

#### 1. Ollama Integration
**File:** `src/integrations/OllamaConnector.js`

**Responsibilities:**
- Discover installed models
- Benchmark models for this workload
- Present model download UI with memory requirements
- Stream download progress (observer pattern)
- Switch models on demand
- Handle model failures

**Key Events:**
```
ollama:connected              - Connected to Ollama API
ollama:models:discovered      - Found available models
ollama:benchmark:started      - Starting performance test
ollama:benchmark:progress     - Benchmark progress update
ollama:benchmark:completed    - Benchmark results ready
ollama:download:available     - New model can be downloaded
ollama:download:initiated     - User started download
ollama:download:progress      - Download progress (bytes, %, ETA)
ollama:download:completed     - Model ready to use
ollama:model:switched         - Active model changed
ollama:error                  - Something went wrong
```

#### 2. Claudeinator Integration
**File:** `src/integrations/ClaudeTokenMonitor.js`

**Responsibilities:**
- Connect to existing Claudeinator instance
- Monitor token usage in real-time
- Predict context window exhaustion
- Trigger reset before hitting limit
- Preserve state across resets

**Key Events:**
```
claudeinator:connected        - Connected to token monitor
claudeinator:usage:update     - Current token count
claudeinator:threshold:80     - 80% of budget used (warning)
claudeinator:threshold:95     - 95% of budget used (critical)
claudeinator:reset:initiated  - About to reset context
claudeinator:state:saved      - Conversation state preserved
claudeinator:reset:completed  - New session ready
claudeinator:error            - Monitor connection lost
```

#### 3. aGenticOS Integration
**File:** `src/integrations/AgenticOSBridge.js`

**Responsibilities:**
- Register as service in aGenticOS
- Discover other services
- Establish communication channels
- Coordinate file access
- Prevent conflicts

**Key Events:**
```
agentic:registered            - Service registered
agentic:services:discovered   - Other services found
agentic:channel:established   - Communication ready
agentic:file:requested        - Need file access
agentic:file:granted          - Permission received
agentic:file:conflict         - Another service has lock
agentic:integration:complete  - Apps connected
agentic:error                 - Communication failure
```

---

## Data Flow Example: User Completes a Task

```
1. User clicks checkbox in UI
     ↓
2. UI Component emits event
   eventBus.emit('ui:task:toggled', { taskId: 'choose_llc_name', completed: true })
     ↓
3. Data Agent listening for 'ui:task:toggled'
   - Updates in-memory state
   - Marks task as completed
   - Emits 'data:task:updated' event
     ↓
4. Multiple components listen for 'data:task:updated'
   a) UI Agent updates checkbox visual
   b) Progress Bar updates percentage
   c) Chapter Nav marks chapter complete if all tasks done
   d) Data Agent saves to localStorage
     ↓
5. Data Agent emits 'data:progress:saved' event
   - Confirms persistence successful
     ↓
6. Optional: If chapter completed, UI Agent emits 'ui:chapter:completed'
   - Triggers celebration animation
   - Updates overall progress
```

**No polling. No tight coupling. Pure event-driven architecture.**

---

## Deployment Architecture

### Local Development
```
Developer's PC
    ├── Agent Forge App (Electron or Tauri)
    ├── Ollama Service (local models)
    ├── Claudeinator (token monitor)
    └── aGenticOS (service registry)
```

### Production Distribution
```
Installer Package (.zip or .exe)
    ├── Agent Forge executable
    ├── Configuration wizard
    │   └── Path selection widget
    ├── Model downloader
    │   └── Progress UI
    └── Integration connectors
        ├── Ollama detector
        ├── Claudeinator detector
        └── aGenticOS detector
```

**First-Run Experience:**
1. Installer extracts to user-selected directory
2. Configuration wizard launches
3. Detects installed integrations (Ollama, Claudeinator, aGenticOS)
4. Prompts for paths to other projects (portfolio, etc.)
5. Asks permission to access specified files
6. Downloads recommended model if none available
7. Launches main application

---

## Security & Permissions

### File Access Control
- User explicitly specifies which directories Agent Forge can access
- Application requests permission before first file access
- All file operations logged for transparency
- Read-only access by default, write access explicitly granted

### Model Sandboxing
- Local models run in isolated environment
- No access to sensitive system files
- Network requests limited to approved domains
- Code execution requires supervisor approval

### API Key Management
- API keys stored in encrypted local config
- Never transmitted or logged
- User can revoke access at any time

---

## Performance Targets

### Responsiveness
- UI should respond to clicks within 50ms
- Events should propagate through bus in < 10ms
- Local model task assignment within 100ms
- Total workflow start-to-finish: depends on task complexity

### Resource Usage
- Memory: < 500MB without models loaded
- Memory: < 2GB with typical model (7B parameters)
- CPU: Minimal when idle, burst during model inference
- Disk: ~50MB app + model sizes (vary 2GB-20GB)

### Reliability
- No crashes from malformed user input
- Graceful degradation if integration unavailable
- Automatic recovery from temporary failures
- State persistence prevents data loss

---

## Monitoring & Observability

### Event Logging
- All events logged with timestamp
- Filterable by domain, action, severity
- Exportable for debugging
- Viewable in real-time dashboard (optional)

### Performance Metrics
- Task completion times
- Agent utilization rates
- Model response times
- Token usage patterns
- Error rates by component

### Health Checks
- Periodic ping to integrations
- Verify event bus functioning
- Confirm supervisors active
- Test model availability

---

## Extension Points

Agent Forge is designed to be extended. Future capabilities:

### New Agents
Add specialized agents for:
- Code generation beyond UI/Data
- Testing and quality assurance
- Documentation generation
- Performance optimization

### New Integrations
Connect to additional systems:
- GitHub for version control
- Jira/Linear for project management
- Notion/Obsidian for knowledge base
- Custom internal tools

### New Chapters
Expand beyond LLC formation:
- Tax planning workflows
- Client onboarding workflows
- Project management workflows
- Learning pathways

### New Models
Support additional AI providers:
- OpenAI API
- Google PaLM
- Cohere
- Custom fine-tuned models

---

## Success Metrics

The architecture succeeds when:

1. **Extensibility**
   - New agents can be added without changing existing code
   - New integrations follow established patterns
   - New features don't break existing workflows

2. **Maintainability**
   - Clear separation of concerns
   - Each component has single responsibility
   - Changes localized to specific files
   - Tests prevent regressions

3. **Performance**
   - Meets or exceeds performance targets
   - Scales to additional agents/workflows
   - Resource usage remains reasonable

4. **Reliability**
   - Zero data loss from crashes
   - Graceful handling of errors
   - Self-recovery from transient failures

5. **User Experience**
   - Responsive UI (< 50ms interactions)
   - Clear progress indication
   - Helpful error messages
   - Engaging visual design

---

## Architecture Decision Records (ADRs)

### ADR-001: Event-Driven Architecture
**Decision:** Use observer pattern for all inter-component communication.
**Rationale:** Loose coupling, easy extensibility, no polling overhead.
**Consequences:** All components must emit/listen to events consistently.

### ADR-002: Multi-Agent Design
**Decision:** Split functionality across specialized agents.
**Rationale:** Single responsibility, parallel execution, easier debugging.
**Consequences:** Need orchestrator to coordinate, supervisors to prevent issues.

### ADR-003: Local-First Models
**Decision:** Ollama as primary execution engine, Claude Code as supervisor.
**Rationale:** Privacy, cost control, speed for simple tasks.
**Consequences:** Need robust error handling, model switching logic.

### ADR-004: No Hardcoded Values
**Decision:** All configuration via GUI, stored in user.config.json.
**Rationale:** User customization without code changes, easier testing.
**Consequences:** Need robust configuration UI, validation layer.

### ADR-005: Supervisor Pattern
**Decision:** Every agent has automated supervisor watching for problems.
**Rationale:** Prevent infinite loops, detect stuck states, auto-escalate.
**Consequences:** Additional complexity, but much higher reliability.

---

This architecture provides:
- **Scalability** to handle growth
- **Reliability** for production use
- **Extensibility** for future features
- **Maintainability** for long-term development
- **Performance** that meets user expectations

**Ready to build something legendary.** 🚀
