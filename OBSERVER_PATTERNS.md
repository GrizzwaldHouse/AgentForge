# Observer Pattern Implementation Guide

## Philosophy

**Observer Pattern = Publish/Subscribe = Event-Driven Architecture**

The core idea: Components broadcast what happened. Other components that care listen and react. The broadcaster doesn't know or care who's listening.

This is the ONLY acceptable way to handle state changes in Agent Forge.

---

## The Golden Rule

```
IF state changes → EMIT an event
IF you care about state → LISTEN for events
NEVER → Poll in a loop to detect changes
```

---

## Bad vs. Good Examples

### ❌ BAD: Polling Pattern

```javascript
// NEVER DO THIS
class ModelDownloader {
  constructor() {
    this.downloadComplete = false;
    this.progress = 0;
  }
  
  async downloadModel(modelName) {
    // Start download...
    this.downloadComplete = false;
    
    // Simulate download
    for (let i = 0; i <= 100; i++) {
      await sleep(100);
      this.progress = i;
    }
    
    this.downloadComplete = true;
  }
}

class UI {
  constructor(downloader) {
    this.downloader = downloader;
    
    // BAD: Polling to check status
    setInterval(() => {
      if (this.downloader.downloadComplete) {
        this.showCompletionMessage();
      }
      this.updateProgressBar(this.downloader.progress);
    }, 100); // Wasteful checking every 100ms
  }
}
```

**Problems:**
- Wastes CPU checking state every 100ms
- UI checks even when nothing is happening
- Hard to know optimal polling interval
- Tight coupling between ModelDownloader and UI
- Difficult to add new UI components that care about download

---

### ✅ GOOD: Observer Pattern

```javascript
// ModelDownloader.js
// Developer: Claude Code + Agent Forge System
// Date: [Auto-generated]
// Purpose: Download models from Ollama with progress tracking
// Dependencies: EventBus
// Integration Points: Emits events for UI and supervisors

class ModelDownloader {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  
  async downloadModel(modelName) {
    // Broadcast that download is starting
    this.eventBus.emit('ollama:download:initiated', {
      modelName,
      timestamp: Date.now()
    });
    
    // Simulate download with progress updates
    for (let progress = 0; progress <= 100; progress++) {
      await sleep(100);
      
      // Broadcast progress update
      this.eventBus.emit('ollama:download:progress', {
        modelName,
        progress,
        timestamp: Date.now()
      });
    }
    
    // Broadcast completion
    this.eventBus.emit('ollama:download:completed', {
      modelName,
      timestamp: Date.now()
    });
  }
}

// UI.jsx
// Developer: Claude Code + Agent Forge System
// Date: [Auto-generated]
// Purpose: Display download progress to user
// Dependencies: EventBus, React
// Integration Points: Listens to ollama:download:* events

function DownloadUI({ eventBus }) {
  const [progress, setProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  
  React.useEffect(() => {
    // Subscribe to progress events
    const unsubscribeProgress = eventBus.on('ollama:download:progress', (data) => {
      setProgress(data.progress);
    });
    
    // Subscribe to completion event
    const unsubscribeComplete = eventBus.on('ollama:download:completed', (data) => {
      setIsComplete(true);
    });
    
    // Cleanup subscriptions when component unmounts
    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
    };
  }, [eventBus]);
  
  return (
    <div>
      <ProgressBar value={progress} />
      {isComplete && <CompletionMessage />}
    </div>
  );
}
```

**Benefits:**
- No wasted CPU - UI only updates when there's actual progress
- ModelDownloader doesn't know UI exists - clean separation
- Easy to add new components that listen to download events
- Supervisor agents can also listen to detect stuck downloads
- Logger can listen to create audit trail
- No tight coupling

---

## Event Bus Implementation Pattern

### Singleton Pattern for Event Bus

```javascript
// EventBus.js
// Developer: Claude Code + Agent Forge System
// Date: [Auto-generated]
// Purpose: Central event broadcasting and subscription system
// Dependencies: None (standalone)
// Integration Points: Used by ALL components

class EventBus {
  constructor() {
    // Map: event type → array of listener functions
    this.listeners = new Map();
    
    // Event history for debugging
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    
    // Performance metrics
    this.metrics = {
      totalEvents: 0,
      eventCounts: new Map(),
      slowListeners: []
    };
  }
  
  /**
   * Subscribe to an event type
   * @param {string} eventType - Event to listen for (e.g., 'ollama:download:progress')
   * @param {function} listenerFn - Callback function to execute when event occurs
   * @returns {function} Unsubscribe function for cleanup
   */
  on(eventType, listenerFn) {
    // Validate inputs at system boundary
    if (typeof eventType !== 'string' || !eventType) {
      throw new Error('eventType must be a non-empty string');
    }
    
    if (typeof listenerFn !== 'function') {
      throw new Error('listenerFn must be a function');
    }
    
    // Create listener array if this is first subscription to this event type
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    // Add listener to array
    this.listeners.get(eventType).push(listenerFn);
    
    // Return unsubscribe function
    // This allows clean cleanup: const unsub = eventBus.on(...); unsub();
    return () => this.off(eventType, listenerFn);
  }
  
  /**
   * Unsubscribe from an event type
   * @param {string} eventType - Event type to stop listening to
   * @param {function} listenerFn - Specific listener to remove
   */
  off(eventType, listenerFn) {
    if (!this.listeners.has(eventType)) return;
    
    const listeners = this.listeners.get(eventType);
    const index = listeners.indexOf(listenerFn);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    // Clean up empty listener arrays to prevent memory leaks
    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }
  }
  
  /**
   * Broadcast an event to all subscribers
   * @param {string} eventType - Type of event occurring
   * @param {object} data - Event data payload
   */
  emit(eventType, data = {}) {
    const startTime = performance.now();
    
    // Update metrics
    this.metrics.totalEvents++;
    this.metrics.eventCounts.set(
      eventType,
      (this.metrics.eventCounts.get(eventType) || 0) + 1
    );
    
    // Add to history for debugging
    this.addToHistory({
      eventType,
      data,
      timestamp: Date.now()
    });
    
    // Get all listeners for this event type
    if (!this.listeners.has(eventType)) {
      // No listeners - that's okay, not an error
      return;
    }
    
    const listeners = this.listeners.get(eventType);
    
    // Call each listener with the event data
    // Use try-catch so one failing listener doesn't break others
    listeners.forEach(listenerFn => {
      const listenerStartTime = performance.now();
      
      try {
        listenerFn(data);
      } catch (error) {
        console.error(`Error in listener for ${eventType}:`, error);
        
        // Emit error event so supervisors can handle it
        // Don't recursively emit to prevent infinite loops
        if (eventType !== 'system:listener:error') {
          this.emit('system:listener:error', {
            eventType,
            error: error.message,
            stack: error.stack
          });
        }
      }
      
      const listenerDuration = performance.now() - listenerStartTime;
      
      // Track slow listeners (> 100ms) for performance debugging
      if (listenerDuration > 100) {
        this.metrics.slowListeners.push({
          eventType,
          duration: listenerDuration,
          timestamp: Date.now()
        });
      }
    });
    
    const totalDuration = performance.now() - startTime;
    
    // Warn if event broadcasting is slow (> 50ms)
    // This could indicate too many listeners or expensive operations
    if (totalDuration > 50) {
      console.warn(`Slow event broadcast for ${eventType}: ${totalDuration.toFixed(2)}ms`);
    }
  }
  
  /**
   * Add event to history, maintaining size limit
   */
  addToHistory(event) {
    this.eventHistory.push(event);
    
    // Maintain max history size to prevent memory growth
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift(); // Remove oldest
    }
  }
  
  /**
   * Get recent events for debugging
   * @param {number} count - Number of recent events to retrieve
   * @returns {Array} Recent events
   */
  getRecentEvents(count = 50) {
    return this.eventHistory.slice(-count);
  }
  
  /**
   * Get performance metrics
   * @returns {object} Metrics about event bus usage
   */
  getMetrics() {
    return {
      totalEvents: this.metrics.totalEvents,
      uniqueEventTypes: this.metrics.eventCounts.size,
      topEvents: Array.from(this.metrics.eventCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      slowListeners: this.metrics.slowListeners.slice(-10)
    };
  }
  
  /**
   * Clear all listeners (use for testing or shutdown)
   */
  removeAllListeners() {
    this.listeners.clear();
  }
}

// Export singleton instance
// All components import and use the same event bus
export const eventBus = new EventBus();
```

---

## Common Patterns

### Pattern 1: Component Lifecycle with Events

```javascript
// Component that needs to subscribe and unsubscribe properly

class MyComponent {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.unsubscribers = []; // Track all subscriptions for cleanup
  }
  
  initialize() {
    // Subscribe to multiple events
    this.unsubscribers.push(
      this.eventBus.on('data:updated', (data) => this.handleDataUpdate(data))
    );
    
    this.unsubscribers.push(
      this.eventBus.on('config:changed', (config) => this.handleConfigChange(config))
    );
    
    this.unsubscribers.push(
      this.eventBus.on('system:shutdown', () => this.cleanup())
    );
  }
  
  // Called when component is destroyed
  cleanup() {
    // Unsubscribe from all events to prevent memory leaks
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
  
  handleDataUpdate(data) {
    // React to data change
  }
  
  handleConfigChange(config) {
    // React to config change
  }
}
```

### Pattern 2: React Component with Events

```javascript
import React from 'react';
import { eventBus } from '../core/EventBus';

function MyReactComponent() {
  const [data, setData] = React.useState(null);
  
  React.useEffect(() => {
    // Subscribe when component mounts
    const unsubscribe = eventBus.on('data:updated', (newData) => {
      setData(newData);
    });
    
    // Unsubscribe when component unmounts
    // This prevents memory leaks and errors from updating unmounted component
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array = only run once on mount
  
  return (
    <div>
      {data ? <DataDisplay data={data} /> : <LoadingSpinner />}
    </div>
  );
}
```

### Pattern 3: Agent with Progress Reporting

```javascript
// Agent that performs long-running task and reports progress

class DataProcessingAgent {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  
  async processData(items) {
    const total = items.length;
    
    // Broadcast start event
    this.eventBus.emit('agent:data:processing:started', {
      total,
      timestamp: Date.now()
    });
    
    const results = [];
    
    for (let i = 0; i < total; i++) {
      // Process item
      const result = await this.processSingleItem(items[i]);
      results.push(result);
      
      // Broadcast progress after each item
      // UI can update progress bar
      // Supervisor can verify agent is making progress (not stuck)
      this.eventBus.emit('agent:data:processing:progress', {
        processed: i + 1,
        total,
        percentComplete: ((i + 1) / total) * 100,
        timestamp: Date.now()
      });
    }
    
    // Broadcast completion
    this.eventBus.emit('agent:data:processing:completed', {
      total,
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  async processSingleItem(item) {
    // Actual processing logic
    return item;
  }
}
```

### Pattern 4: Supervisor Monitoring Agent

```javascript
// Supervisor that watches an agent for problems

class SupervisorAgent {
  constructor(agentName, eventBus, config) {
    this.agentName = agentName;
    this.eventBus = eventBus;
    this.config = config;
    
    // State tracking
    this.lastProgressTime = Date.now();
    this.iterationCount = 0;
    this.isStuck = false;
    
    // Subscribe to agent's progress events
    this.eventBus.on(`agent:${agentName}:progress`, () => {
      this.handleProgress();
    });
    
    this.eventBus.on(`agent:${agentName}:iteration`, () => {
      this.handleIteration();
    });
    
    // Start timeout monitoring
    this.startTimeoutMonitor();
  }
  
  handleProgress() {
    // Agent made real progress - reset tracking
    this.lastProgressTime = Date.now();
    this.iterationCount = 0;
    this.isStuck = false;
  }
  
  handleIteration() {
    // Agent completed an iteration
    this.iterationCount++;
    
    // Detect infinite loop - too many iterations without progress
    if (this.iterationCount > this.config.maxIterations) {
      this.detectLoop();
    }
  }
  
  detectLoop() {
    this.isStuck = true;
    
    // Broadcast that agent is stuck in a loop
    this.eventBus.emit('supervisor:loop:detected', {
      agentName: this.agentName,
      iterations: this.iterationCount,
      timestamp: Date.now()
    });
    
    // Request escalation
    this.requestEscalation('infinite_loop');
  }
  
  startTimeoutMonitor() {
    // Check for timeout every 10 seconds
    this.timeoutInterval = setInterval(() => {
      const timeSinceProgress = Date.now() - this.lastProgressTime;
      
      // Agent hasn't made progress in too long
      if (timeSinceProgress > this.config.timeoutMs && !this.isStuck) {
        this.detectTimeout();
      }
    }, 10000);
  }
  
  detectTimeout() {
    this.isStuck = true;
    
    // Broadcast timeout
    this.eventBus.emit('supervisor:timeout:detected', {
      agentName: this.agentName,
      timeSinceProgress: Date.now() - this.lastProgressTime,
      timestamp: Date.now()
    });
    
    // Request escalation
    this.requestEscalation('timeout');
  }
  
  requestEscalation(reason) {
    // Broadcast escalation request
    this.eventBus.emit('supervisor:escalation:needed', {
      agentName: this.agentName,
      reason,
      timestamp: Date.now()
    });
  }
  
  cleanup() {
    // Stop timeout monitoring
    if (this.timeoutInterval) {
      clearInterval(this.timeoutInterval);
    }
  }
}
```

---

## Event Naming Conventions

### Format: `<domain>:<action>:<detail>`

**Examples:**
```
agent:task:started
agent:task:completed
agent:task:failed

ollama:model:discovered
ollama:model:downloading
ollama:model:downloaded
ollama:model:switched

claudeinator:token:update
claudeinator:token:warning
claudeinator:token:critical
claudeinator:reset:initiated
claudeinator:reset:completed

supervisor:loop:detected
supervisor:timeout:triggered
supervisor:escalation:needed

ui:chapter:changed
ui:task:toggled
ui:progress:updated

data:config:loaded
data:config:saved
data:progress:saved

system:startup:complete
system:shutdown:initiated
system:error:occurred
```

### Levels of Detail

**Generic → Specific**

```
agent:task:started                    (any agent, any task)
agent:ui:task:started                 (UI agent specifically)
agent:ui:component:task:started       (UI agent, component creation task)
```

**Listen at appropriate level:**
- Supervisor watches `agent:*` (all agents)
- UI listens to `ui:*` (only UI events)
- Logger listens to `*` (everything)

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Polling Disguised as Events

```javascript
// BAD: This is still polling, just using setInterval
setInterval(() => {
  eventBus.emit('check:status'); // Don't do this!
}, 1000);
```

**Fix:** Emit events when state actually changes, not on a timer.

---

### ❌ Anti-Pattern 2: Synchronous Blocking in Listeners

```javascript
// BAD: Blocking the event loop
eventBus.on('data:received', (data) => {
  // Don't do expensive synchronous work here
  for (let i = 0; i < 1000000; i++) {
    heavyComputation();
  }
});
```

**Fix:** Do expensive work asynchronously or in a worker thread.

```javascript
// GOOD: Non-blocking
eventBus.on('data:received', async (data) => {
  // Offload to worker or do async
  await processDataAsync(data);
});
```

---

### ❌ Anti-Pattern 3: Not Cleaning Up Subscriptions

```javascript
// BAD: Memory leak - listener never unsubscribed
class TemporaryComponent {
  constructor(eventBus) {
    eventBus.on('some:event', () => {
      this.handleEvent();
    });
    // Component is destroyed but listener remains!
  }
}
```

**Fix:** Always unsubscribe when component is destroyed.

```javascript
// GOOD: Proper cleanup
class TemporaryComponent {
  constructor(eventBus) {
    this.unsubscribe = eventBus.on('some:event', () => {
      this.handleEvent();
    });
  }
  
  destroy() {
    this.unsubscribe(); // Clean up listener
  }
}
```

---

### ❌ Anti-Pattern 4: Direct Component References

```javascript
// BAD: Tight coupling
class ComponentA {
  constructor(componentB) {
    this.componentB = componentB;
  }
  
  doSomething() {
    // Directly calling another component
    this.componentB.update();
  }
}
```

**Fix:** Use events for communication.

```javascript
// GOOD: Loose coupling via events
class ComponentA {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  
  doSomething() {
    // Emit event, don't care who listens
    this.eventBus.emit('component:a:action:completed');
  }
}

class ComponentB {
  constructor(eventBus) {
    eventBus.on('component:a:action:completed', () => {
      this.update();
    });
  }
  
  update() {
    // React to ComponentA's event
  }
}
```

---

## Testing Event-Driven Code

```javascript
// Testing event emissions
describe('ModelDownloader', () => {
  it('emits progress events during download', async () => {
    const eventBus = new EventBus();
    const downloader = new ModelDownloader(eventBus);
    
    const progressEvents = [];
    
    // Subscribe to track events
    eventBus.on('ollama:download:progress', (data) => {
      progressEvents.push(data);
    });
    
    // Execute download
    await downloader.downloadModel('llama3.2');
    
    // Verify events were emitted
    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents[0]).toHaveProperty('progress');
    expect(progressEvents[progressEvents.length - 1].progress).toBe(100);
  });
});
```

---

## Performance Considerations

### Event Bus is Fast
- Map lookups are O(1)
- Array iteration over listeners is O(n) where n = number of listeners
- Typical event broadcast < 1ms

### When to Worry
- > 100 listeners for a single event type (unusual)
- Listeners doing expensive synchronous work (use async)
- Emitting thousands of events per second (redesign to batch)

### Optimization Strategies
- Batch related events (don't emit progress every millisecond)
- Debounce rapid events (UI doesn't need 60fps updates)
- Throttle if necessary (limit to reasonable frequency)

---

## Debugging Events

### Enable Event Logging

```javascript
// Add global event logger during development
if (process.env.NODE_ENV === 'development') {
  eventBus.on('*', (data, eventType) => {
    console.log(`[EVENT] ${eventType}:`, data);
  });
}
```

### View Event History

```javascript
// In browser console or Node REPL
const recent = eventBus.getRecentEvents(20);
console.table(recent);
```

### Monitor Performance

```javascript
const metrics = eventBus.getMetrics();
console.log('Total events:', metrics.totalEvents);
console.log('Top events:', metrics.topEvents);
console.log('Slow listeners:', metrics.slowListeners);
```

---

## Summary: Observer Pattern Checklist

✅ **Do:**
- Emit events when state changes
- Listen to events you care about
- Unsubscribe when component is destroyed
- Use descriptive event names (domain:action:detail)
- Keep listeners fast and non-blocking
- Handle errors in listeners gracefully

❌ **Don't:**
- Poll in loops to detect changes
- Store direct references to other components
- Forget to unsubscribe
- Do expensive synchronous work in listeners
- Emit events more frequently than needed
- Use generic event names like 'update' or 'change'

**The observer pattern is not optional. It's mandatory for all state changes in Agent Forge.**

This ensures:
- Loose coupling between components
- Easy to add new features without breaking existing ones
- Supervisors can monitor all agent activity
- Clean, testable, maintainable code

**Build it right. Build it with observers.** 🚀
