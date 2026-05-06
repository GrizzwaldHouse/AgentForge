# Agent Task Template

## Purpose

This template shows how Claude Code should create TODO-annotated file stubs for local models (via Ollama) to implement. The goal is to give the local model:

1. **Clear context** - What this file does and why
2. **Explicit instructions** - Step-by-step TODOs to follow
3. **Code patterns** - Examples to copy/adapt
4. **Integration points** - How this connects to other files
5. **Success criteria** - How to know when it's done correctly

**Remember:** Local models are good at following detailed instructions but struggle with high-level architecture decisions. We make the decisions, they write the code.

---

## Template Structure

```javascript
// [FILENAME]
// Developer: Claude Code + Agent Forge System
// Date: [AUTO-GENERATED]
// Purpose: [ONE SENTENCE describing what this file does]
// Dependencies: [LIST of imports this file needs]
// Integration Points: [HOW this connects to other parts of system]
// Status: [TODO_STUB | IN_PROGRESS | NEEDS_REVIEW | COMPLETE]

// ============================================================================
// AGENT TASK INSTRUCTIONS
// ============================================================================
// Local Model Agent: You are implementing this file following the TODOs below.
// 
// DO:
// - Follow each TODO step in order
// - Copy the code patterns shown in examples
// - Emit events for all state changes (observer pattern)
// - Validate inputs at function boundaries
// - Use descriptive variable names
// - Add comments explaining WHY, not WHAT
//
// DON'T:
// - Use polling loops (setInterval to check state)
// - Hardcode values (use this.config instead)
// - Use block comments /* */ (only line comments //)
// - Forget to clean up event subscriptions
// - Skip error handling
//
// WHEN STUCK:
// - Emit 'agent:stuck' event with description of problem
// - Supervisor will escalate to Claude Code for help
// - Don't loop trying same approach repeatedly
//
// SUCCESS CRITERIA:
// - All TODOs are completed
// - No errors when running
// - Follows patterns from examples
// - Emits events as specified
// ============================================================================

// Imports (TODO MARKER for agent to fill in)
// TODO: Import EventBus from core
// TODO: Import config type definitions
// TODO: Import any utilities needed

/**
 * [CLASS/FUNCTION NAME]
 * 
 * [DETAILED DESCRIPTION of what this does, why it exists, and how it fits
 * into the larger system. Be thorough - this helps the local model understand
 * the context.]
 * 
 * Events Emitted:
 * - [event:name:format] - [when emitted and what data included]
 * - [event:name:format] - [when emitted and what data included]
 * 
 * Events Listened To:
 * - [event:name:format] - [what this component does when it hears this]
 * - [event:name:format] - [what this component does when it hears this]
 * 
 * Configuration Options:
 * - [config.option] - [what this controls, type, default value]
 * - [config.option] - [what this controls, type, default value]
 */

// ============================================================================
// TODO 1: Class/Module Setup
// ============================================================================
// TODO: Create the main class with constructor
// TODO: Accept eventBus and config as parameters
// TODO: Initialize all instance variables in constructor with defaults
// TODO: Set up event subscriptions
// TODO: Store unsubscribe functions for cleanup
//
// EXAMPLE:
// ```
// class ExampleAgent {
//   constructor(eventBus, config) {
//     this.eventBus = eventBus;
//     this.config = config;
//     this.isActive = false;
//     this.taskQueue = [];
//     this.unsubscribers = [];
//     
//     // Set up event listeners
//     this.setupEventListeners();
//   }
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 2: Event Listener Setup
// ============================================================================
// TODO: Create setupEventListeners() method
// TODO: Subscribe to all relevant events
// TODO: Store each unsubscribe function in this.unsubscribers array
// TODO: Each subscription should call a handler method
//
// EXAMPLE:
// ```
// setupEventListeners() {
//   this.unsubscribers.push(
//     this.eventBus.on('some:event', (data) => this.handleEvent(data))
//   );
//   
//   this.unsubscribers.push(
//     this.eventBus.on('another:event', (data) => this.handleAnotherEvent(data))
//   );
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 3: Core Functionality - Main Method
// ============================================================================
// TODO: Implement the primary method this class provides
// TODO: Validate inputs at the start (throw errors for invalid input)
// TODO: Emit 'started' event when beginning work
// TODO: Emit 'progress' events during long-running operations
// TODO: Emit 'completed' event when done successfully
// TODO: Emit 'failed' event if errors occur
// TODO: Return meaningful result
//
// PATTERN:
// 1. Validate inputs
// 2. Emit 'started' event
// 3. Do the work (with progress updates)
// 4. Emit 'completed' event
// 5. Return result
//
// EXAMPLE:
// ```
// async performTask(input) {
//   // Step 1: Validate
//   if (!input || typeof input !== 'object') {
//     throw new Error('Invalid input: must be an object');
//   }
//   
//   // Step 2: Emit started
//   this.eventBus.emit('agent:task:started', {
//     taskId: input.id,
//     timestamp: Date.now()
//   });
//   
//   try {
//     // Step 3: Do work with progress
//     const result = await this.doWork(input);
//     
//     // Step 4: Emit completed
//     this.eventBus.emit('agent:task:completed', {
//       taskId: input.id,
//       result,
//       timestamp: Date.now()
//     });
//     
//     // Step 5: Return
//     return result;
//     
//   } catch (error) {
//     // Emit failed event
//     this.eventBus.emit('agent:task:failed', {
//       taskId: input.id,
//       error: error.message,
//       timestamp: Date.now()
//     });
//     
//     throw error;
//   }
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 4: Helper Methods
// ============================================================================
// TODO: Break down complex logic into smaller helper methods
// TODO: Each helper should do ONE thing clearly
// TODO: Name helpers descriptively (what they do)
// TODO: Add comments explaining WHY they exist if not obvious
//
// EXAMPLE:
// ```
// // Extract the specific data we need from the raw API response
// // This centralizes parsing logic and makes it easier to adapt to API changes
// parseAPIResponse(rawData) {
//   return {
//     id: rawData.id,
//     name: rawData.attributes?.name || 'Unknown',
//     status: this.normalizeStatus(rawData.status)
//   };
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 5: Event Handler Methods
// ============================================================================
// TODO: Create handler methods for each event this component listens to
// TODO: Keep handlers focused (one handler per event type)
// TODO: Handlers should emit their own events if they change state
// TODO: Handle errors gracefully - don't let one bad event crash everything
//
// EXAMPLE:
// ```
// handleConfigUpdate(data) {
//   try {
//     // Validate the new config
//     if (!data.config || typeof data.config !== 'object') {
//       console.warn('Invalid config update received, ignoring');
//       return;
//     }
//     
//     // Apply the update
//     this.config = { ...this.config, ...data.config };
//     
//     // Emit event about config change
//     this.eventBus.emit('agent:config:updated', {
//       agentName: this.constructor.name,
//       timestamp: Date.now()
//     });
//     
//   } catch (error) {
//     console.error('Error handling config update:', error);
//     this.eventBus.emit('agent:error', {
//       error: error.message,
//       context: 'handleConfigUpdate'
//     });
//   }
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 6: Cleanup Method
// ============================================================================
// TODO: Create cleanup() method for graceful shutdown
// TODO: Unsubscribe from all events (loop through this.unsubscribers)
// TODO: Clear any intervals or timeouts
// TODO: Emit 'shutdown' event
// TODO: Reset state to initial values
//
// EXAMPLE:
// ```
// cleanup() {
//   // Emit shutdown event
//   this.eventBus.emit('agent:shutdown', {
//     agentName: this.constructor.name,
//     timestamp: Date.now()
//   });
//   
//   // Unsubscribe from all events
//   this.unsubscribers.forEach(unsub => unsub());
//   this.unsubscribers = [];
//   
//   // Clear any timers
//   if (this.heartbeatInterval) {
//     clearInterval(this.heartbeatInterval);
//     this.heartbeatInterval = null;
//   }
//   
//   // Reset state
//   this.isActive = false;
//   this.taskQueue = [];
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 7: Error Handling
// ============================================================================
// TODO: Add try-catch blocks around risky operations
// TODO: Emit error events instead of just throwing
// TODO: Log errors with enough context to debug
// TODO: Don't swallow errors - let them be handled at appropriate level
//
// WHEN TO CATCH:
// - External API calls (network might fail)
// - File system operations (file might not exist)
// - User input processing (might be malformed)
// - Event listener callbacks (don't let one bad listener crash everything)
//
// WHEN TO THROW:
// - Invalid function arguments (programming error)
// - Required config missing (setup error)
// - Unrecoverable state (can't continue)
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 8: Configuration Validation
// ============================================================================
// TODO: Create validateConfig() method
// TODO: Check that all required config options are present
// TODO: Validate types and ranges
// TODO: Provide sensible defaults for optional values
// TODO: Throw descriptive errors for invalid config
//
// EXAMPLE:
// ```
// validateConfig(config) {
//   const errors = [];
//   
//   // Required string
//   if (typeof config.modelName !== 'string' || !config.modelName) {
//     errors.push('modelName must be a non-empty string');
//   }
//   
//   // Required positive integer
//   if (!Number.isInteger(config.maxRetries) || config.maxRetries < 1) {
//     errors.push('maxRetries must be a positive integer');
//   }
//   
//   // Optional with default
//   const timeout = config.timeoutMs || 30000;
//   if (!Number.isInteger(timeout) || timeout < 1000) {
//     errors.push('timeoutMs must be at least 1000');
//   }
//   
//   if (errors.length > 0) {
//     throw new Error(`Invalid config:\n${errors.join('\n')}`);
//   }
//   
//   return {
//     modelName: config.modelName,
//     maxRetries: config.maxRetries,
//     timeoutMs: timeout
//   };
// }
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// TODO 9: Export
// ============================================================================
// TODO: Export the class as default export
// TODO: Also export any related types or constants if needed
//
// EXAMPLE:
// ```
// export default ExampleAgent;
// 
// // Optional: export constants used by this module
// export const DEFAULT_CONFIG = {
//   maxRetries: 3,
//   timeoutMs: 30000
// };
// ```
//
// YOUR IMPLEMENTATION BELOW:


// ============================================================================
// AGENT COMPLETION CHECKLIST
// ============================================================================
// When you've completed all TODOs, verify:
// 
// [ ] All imports are correct and resolve
// [ ] Constructor initializes all fields with defaults
// [ ] All event listeners are set up
// [ ] Unsubscribe functions are stored for cleanup
// [ ] Main method validates inputs
// [ ] Main method emits started/progress/completed/failed events
// [ ] Helper methods are small and focused
// [ ] Event handlers are implemented
// [ ] Cleanup method unsubscribes and resets state
// [ ] Error handling is present
// [ ] Config validation throws on invalid config
// [ ] Exports are correct
// [ ] No hardcoded values (uses this.config)
// [ ] No polling loops (only observer pattern)
// [ ] Comments explain WHY, not WHAT
// [ ] File header is complete
//
// If all items checked, emit:
// this.eventBus.emit('agent:task:selfverified', {
//   file: '[FILENAME]',
//   timestamp: Date.now()
// });
//
// Then Claude Code will review and refactor if needed.
// ============================================================================
```

---

## Example: Complete File Stub

Here's a real example of a properly structured file stub for a local model:

```javascript
// OllamaConnector.js
// Developer: Claude Code + Agent Forge System
// Date: 2026-05-01
// Purpose: Connect to Ollama API and manage local models
// Dependencies: EventBus, fetch API
// Integration Points: 
//   - Emits ollama:* events for UI and supervisors
//   - Listens to config:changed to reconnect if settings change
// Status: TODO_STUB

// ============================================================================
// AGENT TASK INSTRUCTIONS
// ============================================================================
// Local Model Agent: You are implementing Ollama API integration.
// 
// WHAT THIS FILE DOES:
// This file connects to the Ollama API running on the user's machine,
// discovers what models are installed, downloads new models, and switches
// between models. It's the bridge between Agent Forge and the local LLMs.
//
// WHY IT EXISTS:
// We use local models (via Ollama) as the primary code generation workhorse
// because it's faster and cheaper than cloud APIs for simple tasks. This
// component manages that integration.
//
// DO:
// - Use observer pattern for all state changes (download progress, etc.)
// - Validate all API responses (Ollama might return unexpected data)
// - Handle network failures gracefully (Ollama service might be down)
// - Emit detailed events so UI can show what's happening
// - Use this.config for all settings (API URL, timeout, etc.)
//
// DON'T:
// - Poll to check download status (use streaming or events)
// - Hardcode Ollama URL (use this.config.ollamaApiUrl)
// - Assume Ollama is running (check and emit connection events)
// - Block the UI thread with long-running operations
//
// WHEN STUCK:
// Emit 'agent:stuck' event with {reason: 'description of problem'}
//
// SUCCESS CRITERIA:
// - Can connect to Ollama API
// - Can discover installed models
// - Can download new models with progress events
// - Can switch active model
// - Handles errors gracefully
// ============================================================================

// ============================================================================
// TODO 1: Imports
// ============================================================================
// TODO: Import eventBus from '../core/EventBus.js'
// TODO: Import any TypeScript types if using (optional)
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 2: Class Definition
// ============================================================================
// TODO: Create OllamaConnector class
// TODO: Constructor accepts (eventBus, config)
// TODO: Initialize these fields:
//   - this.eventBus
//   - this.config (after validation)
//   - this.isConnected = false
//   - this.availableModels = []
//   - this.activeModel = null
//   - this.unsubscribers = []
// TODO: Call this.setupEventListeners()
// TODO: Call this.connect() to establish initial connection
//
// EXAMPLE:
// ```
// class OllamaConnector {
//   constructor(eventBus, config) {
//     this.eventBus = eventBus;
//     this.config = this.validateConfig(config);
//     this.isConnected = false;
//     this.availableModels = [];
//     this.activeModel = null;
//     this.unsubscribers = [];
//     
//     this.setupEventListeners();
//     this.connect(); // Async but don't await - happens in background
//   }
// }
// ```
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 3: Config Validation
// ============================================================================
// TODO: Create validateConfig(config) method
// TODO: Check that config.ollamaApiUrl is a string
// TODO: Default to 'http://localhost:11434' if not provided
// TODO: Check that config.timeoutMs is a positive number
// TODO: Default to 30000 if not provided
// TODO: Return validated config object
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 4: Event Listener Setup
// ============================================================================
// TODO: Create setupEventListeners() method
// TODO: Listen to 'config:ollama:changed' event
// TODO: When config changes, reconnect to Ollama with new settings
//
// EXAMPLE:
// ```
// setupEventListeners() {
//   this.unsubscribers.push(
//     this.eventBus.on('config:ollama:changed', (data) => {
//       this.config = this.validateConfig(data.config);
//       this.connect(); // Reconnect with new settings
//     })
//   );
// }
// ```
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 5: Connect to Ollama
// ============================================================================
// TODO: Create async connect() method
// TODO: Try to fetch from `${this.config.ollamaApiUrl}/api/tags`
// TODO: If successful:
//   - Parse JSON response
//   - Store models in this.availableModels
//   - Set this.isConnected = true
//   - Emit 'ollama:connected' event
//   - Emit 'ollama:models:discovered' event with models
// TODO: If failed:
//   - Set this.isConnected = false
//   - Emit 'ollama:connection:failed' event
//   - Don't crash - just emit event so UI can show "Ollama offline"
//
// EXAMPLE:
// ```
// async connect() {
//   try {
//     const response = await fetch(
//       `${this.config.ollamaApiUrl}/api/tags`,
//       { timeout: this.config.timeoutMs }
//     );
//     
//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}`);
//     }
//     
//     const data = await response.json();
//     this.availableModels = data.models || [];
//     this.isConnected = true;
//     
//     this.eventBus.emit('ollama:connected', {
//       apiUrl: this.config.ollamaApiUrl,
//       timestamp: Date.now()
//     });
//     
//     this.eventBus.emit('ollama:models:discovered', {
//       models: this.availableModels,
//       count: this.availableModels.length,
//       timestamp: Date.now()
//     });
//     
//   } catch (error) {
//     this.isConnected = false;
//     
//     this.eventBus.emit('ollama:connection:failed', {
//       error: error.message,
//       apiUrl: this.config.ollamaApiUrl,
//       timestamp: Date.now()
//     });
//   }
// }
// ```
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 6: Download Model
// ============================================================================
// TODO: Create async downloadModel(modelName) method
// TODO: Validate modelName parameter
// TODO: Emit 'ollama:download:initiated' event
// TODO: POST to `${this.config.ollamaApiUrl}/api/pull`
// TODO: Stream response to get progress updates
// TODO: Emit 'ollama:download:progress' events with percentage
// TODO: When complete, emit 'ollama:download:completed'
// TODO: If error, emit 'ollama:download:failed'
//
// STREAMING PATTERN:
// ```
// const response = await fetch(url, {
//   method: 'POST',
//   body: JSON.stringify({ name: modelName })
// });
//
// const reader = response.body.getReader();
// const decoder = new TextDecoder();
//
// while (true) {
//   const { done, value } = await reader.read();
//   if (done) break;
//   
//   const text = decoder.decode(value);
//   // Parse progress from text and emit event
// }
// ```
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 7: Switch Model
// ============================================================================
// TODO: Create switchModel(modelName) method
// TODO: Validate that model exists in this.availableModels
// TODO: If not, throw error
// TODO: Set this.activeModel = modelName
// TODO: Emit 'ollama:model:switched' event
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 8: Cleanup
// ============================================================================
// TODO: Create cleanup() method
// TODO: Unsubscribe from all events
// TODO: Reset state variables
// TODO: Emit 'ollama:disconnected' event
//
// YOUR IMPLEMENTATION:


// ============================================================================
// TODO 9: Export
// ============================================================================
// TODO: Export OllamaConnector as default
//
// YOUR IMPLEMENTATION:


// ============================================================================
// COMPLETION CHECKLIST
// ============================================================================
// [ ] Can connect to Ollama API at localhost:11434
// [ ] Discovers available models
// [ ] Emits ollama:connected event on success
// [ ] Emits ollama:connection:failed if Ollama offline
// [ ] Can download new models
// [ ] Emits progress events during download
// [ ] Can switch between models
// [ ] Handles errors without crashing
// [ ] Validates all inputs
// [ ] Uses this.config, not hardcoded values
// [ ] Unsubscribes in cleanup()
// [ ] No polling loops
//
// When complete, emit:
// this.eventBus.emit('agent:task:selfverified', {
//   file: 'OllamaConnector.js',
//   timestamp: Date.now()
// });
// ============================================================================
```

---

## Key Principles

### 1. Be Extremely Explicit

Local models struggle with ambiguity. Every TODO should be:
- **Specific**: Not "handle errors" but "wrap in try-catch and emit error event"
- **Actionable**: Not "implement method" but "create async method that accepts X and returns Y"
- **Complete**: Include what to do AND why to do it that way

### 2. Provide Code Examples

For every pattern, show a working example. The local model can copy/adapt examples much better than creating from scratch.

### 3. Break Down Complex Tasks

Don't give one TODO that says "implement entire feature." Break it into:
- Setup (TODO 1)
- Core logic (TODO 2-4)
- Error handling (TODO 5)
- Integration (TODO 6)
- Cleanup (TODO 7)

### 4. Include Success Criteria

Tell the model how to know when it's done correctly. This prevents incomplete implementations.

### 5. Explain WHY

Local models don't have the context we do. Explain why this file exists, why this approach was chosen, why this pattern matters.

---

## Agent Workflow

```
1. Claude Code creates TODO-annotated stub
2. Claude Code passes stub to local model via Ollama
3. Local model fills in implementation following TODOs
4. Local model emits 'agent:task:selfverified' when done
5. Supervisor monitors for stuck/loop states
6. Claude Code reviews completed implementation
7. Claude Code refactors to meet quality standards
8. Claude Code runs tests
9. If tests pass, mark as COMPLETE
10. If tests fail, create new TODOs to fix issues
11. Repeat until tests pass
```

---

## When to Escalate to Claude Code

Local model should emit 'agent:stuck' event when:
- Same error occurs 3+ times in a row
- Unclear how to implement a TODO after 2 attempts
- Test failures that it can't figure out
- Integration issues with other components

Supervisor watches for these and escalates automatically.

---

## Measuring Success

A well-written stub should:
- **Enable autonomous work** - Local model can complete with minimal help
- **Prevent common mistakes** - Examples show correct patterns
- **Produce quality code** - Follows all coding standards
- **Integrate cleanly** - Fits into existing architecture
- **Pass first review** - Minimal refactoring needed

If local model gets stuck repeatedly, the stub wasn't detailed enough. Add more examples and breakdown.

---

**Remember: The quality of your TODOs determines the quality of the local model's output. Make them legendary.** 🚀
