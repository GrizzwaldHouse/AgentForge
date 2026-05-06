# Quality Checklist for Code Review

## Purpose

This checklist ensures all code meets Marcus Daley's professional standards before being presented to the user. Claude Code (you) must verify EVERY item before considering work complete.

**Remember: This is portfolio-quality code that will be shown to hiring managers and clients.**

---

## Critical Requirements (NEVER VIOLATE)

### ✅ 1. Observer Pattern Everywhere

**Rule:** ALL state changes MUST use observer pattern. NEVER polling.

**Check:**
- [ ] No `setInterval()` or `setTimeout()` used for state checking
- [ ] All state changes emit events via eventBus
- [ ] All components subscribe to relevant events
- [ ] All subscriptions are cleaned up on component destruction

**Examples to look for:**
```javascript
// ❌ REJECT THIS
setInterval(() => {
  if (this.downloadComplete) updateUI();
}, 100);

// ✅ APPROVE THIS
this.eventBus.emit('download:completed', { ... });
this.eventBus.on('download:completed', () => updateUI());
```

---

### ✅ 2. Initialization Discipline

**Rule:** ALL default values set at construction in ONE place.

**Check:**
- [ ] All class defaults in constructor
- [ ] All function defaults in parameter list or at top of function
- [ ] No defaults scattered throughout code
- [ ] No defaults set in multiple locations

**Examples to look for:**
```javascript
// ❌ REJECT THIS
class Config {
  maxRetries; // undefined
  timeout = 5000; // set here
  
  initialize() {
    if (!this.maxRetries) this.maxRetries = 3; // set later
  }
}

// ✅ APPROVE THIS
class Config {
  constructor() {
    this.maxRetries = 3;
    this.timeout = 5000;
    // All defaults visible together
  }
}
```

---

### ✅ 3. No Hardcoded Values

**Rule:** Every configurable value MUST be accessible via GUI or config file.

**Check:**
- [ ] No magic numbers in code
- [ ] No hardcoded URLs, paths, or strings
- [ ] All configuration comes from config.json or user settings
- [ ] Constants are named and documented

**Examples to look for:**
```javascript
// ❌ REJECT THIS
if (retryCount > 3) { ... }
const API_URL = 'http://localhost:3000';

// ✅ APPROVE THIS
if (retryCount > this.config.maxRetries) { ... }
const API_URL = this.config.apiEndpoint;
```

---

### ✅ 4. Comment Standards

**Rule:** Use // line comments only. Explain WHY, not WHAT. No /* */ block comments.

**Check:**
- [ ] No /* */ block comments anywhere (except JSDoc on public APIs)
- [ ] Comments explain design decisions, not syntax
- [ ] No comments that just restate code
- [ ] Comments are helpful to future developers

**Examples to look for:**
```javascript
// ❌ REJECT THIS
/*
 * This function downloads a model
 * It takes a model name as parameter
 */
function downloadModel(name) {
  // Loop through models
  for (let model of models) { ... }
}

// ✅ APPROVE THIS
// Download model from Ollama registry
// Retries automatically if network fails to ensure reliability
// Emits progress events so UI can show download status
function downloadModel(name) {
  for (let model of models) { ... }
}
```

---

### ✅ 5. File Headers

**Rule:** Every file must have standard header.

**Check:**
- [ ] Every .js, .jsx, .ts, .tsx file has a header
- [ ] Header includes: filename, developer, date, purpose, dependencies, integration points

**Template:**
```javascript
// FileName.ext
// Developer: Claude Code + Agent Forge System
// Date: 2026-05-01
// Purpose: Brief description of what this file does and why it exists
// Dependencies: List key external dependencies (EventBus, React, etc.)
// Integration Points: How this connects to other parts of system
```

---

### ✅ 6. Error Handling at Boundaries

**Rule:** Validate all external input. Trust nothing that crosses a boundary.

**Check:**
- [ ] All user input is validated
- [ ] All API responses are validated
- [ ] All file reads are validated
- [ ] All config data is validated
- [ ] Helpful error messages for users

**Examples to look for:**
```javascript
// ❌ REJECT THIS
function loadConfig(data) {
  this.settings = data; // Trust it blindly
}

// ✅ APPROVE THIS
function loadConfig(data) {
  // Validate at boundary
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid config: must be an object');
  }
  
  // Validate each field with defaults
  this.settings = {
    modelName: typeof data.modelName === 'string' ? data.modelName : 'llama3.2',
    tokenBudget: Number.isInteger(data.tokenBudget) ? data.tokenBudget : 1000,
    // ... validate everything
  };
}
```

---

### ✅ 7. Separation of Concerns

**Rule:** Each file/class/function has ONE clear responsibility.

**Check:**
- [ ] Can describe file's purpose in one sentence
- [ ] Can describe class's purpose in one sentence
- [ ] Can describe function's purpose in one sentence
- [ ] No "god classes" that do everything
- [ ] Related functionality is grouped together

**Red flags:**
- File > 500 lines (probably doing too much)
- Class with > 20 methods (probably too many responsibilities)
- Function > 50 lines (probably should be broken up)

---

### ✅ 8. Composition Over Inheritance

**Rule:** Prefer composing small pieces over deep inheritance hierarchies.

**Check:**
- [ ] Inheritance depth ≤ 2 levels (rare exceptions for 3)
- [ ] Components use composition where possible
- [ ] Shared behavior via mixins, interfaces, or utility functions
- [ ] "Is-a" relationships only when truly appropriate

---

## Architecture Quality

### ✅ 9. Event-Driven Communication

**Check:**
- [ ] Components communicate via events, not direct calls
- [ ] No component has direct reference to another component
- [ ] EventBus used for all cross-component communication
- [ ] Clear event naming convention followed

---

### ✅ 10. Dependency Management

**Check:**
- [ ] Minimal dependencies in each file
- [ ] No circular dependencies
- [ ] Dependencies injected, not hard-instantiated
- [ ] Easy to mock dependencies for testing

---

### ✅ 11. State Management

**Check:**
- [ ] Single source of truth for each piece of state
- [ ] State changes are predictable
- [ ] State changes emit events
- [ ] No duplicate/conflicting state

---

### ✅ 12. Configuration System

**Check:**
- [ ] All config in config/ directory
- [ ] User config doesn't break on missing values (defaults work)
- [ ] Config validation on load
- [ ] Changes to config emit events

---

## Code Quality

### ✅ 13. Naming Conventions

**Check:**
- [ ] Classes: PascalCase
- [ ] Functions/methods: camelCase
- [ ] Constants: SCREAMING_SNAKE_CASE
- [ ] Private fields: _prefixUnderscore (if used)
- [ ] Names are descriptive, not abbreviated
- [ ] Event names follow domain:action:detail pattern

---

### ✅ 14. Function Quality

**Check:**
- [ ] Functions do one thing
- [ ] Function names describe what they do
- [ ] Parameters < 5 (consider object parameter if more)
- [ ] No side effects unless function name makes it obvious
- [ ] Return values are consistent type

---

### ✅ 15. Avoid Code Duplication

**Check:**
- [ ] No copy-pasted code blocks
- [ ] Shared logic extracted to utility functions
- [ ] Similar patterns use same helper functions
- [ ] DRY (Don't Repeat Yourself) principle followed

---

### ✅ 16. Modern JavaScript/TypeScript

**Check:**
- [ ] Use const/let, never var
- [ ] Use arrow functions where appropriate
- [ ] Use destructuring where it improves clarity
- [ ] Use async/await, not callback hell
- [ ] Use optional chaining (?.) where appropriate

---

## Integration Quality

### ✅ 17. Ollama Integration

**Check:**
- [ ] Models discovered via API, not hardcoded
- [ ] Model switching works dynamically
- [ ] Download progress uses observer pattern
- [ ] Errors handled gracefully
- [ ] Offline mode degrades gracefully

---

### ✅ 18. Claudeinator Integration

**Check:**
- [ ] Token usage monitored in real-time
- [ ] Context reset triggered before limit
- [ ] State preserved across resets
- [ ] Dashboard shows current usage
- [ ] Works when Claudeinator unavailable

---

### ✅ 19. aGenticOS Integration

**Check:**
- [ ] Service registration works
- [ ] Service discovery works
- [ ] Inter-service communication uses events
- [ ] File access requests permission
- [ ] Conflicts detected and handled

---

## Supervisor & Safety

### ✅ 20. Supervisor Agents Active

**Check:**
- [ ] Every agent has a supervisor
- [ ] Loop detection configured
- [ ] Timeout detection configured
- [ ] Token budget enforcement configured
- [ ] Escalation triggers defined

---

### ✅ 21. Error Recovery

**Check:**
- [ ] Errors don't crash the app
- [ ] Errors are logged with context
- [ ] User sees helpful error messages
- [ ] Automatic retry for transient failures
- [ ] Graceful degradation when features unavailable

---

## UI/UX Quality

### ✅ 22. Visual Interest

**Check:**
- [ ] Follows Cowork Skills design patterns
- [ ] Uses gradients, animations, dynamic content
- [ ] Not generic "AI slop" aesthetic
- [ ] Engaging for users with ADHD
- [ ] Professional game-dev look and feel

---

### ✅ 23. Accessibility

**Check:**
- [ ] Semantic HTML elements used
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets standards (4.5:1 minimum)
- [ ] Screen reader friendly

---

### ✅ 24. Responsiveness

**Check:**
- [ ] UI responds to clicks within 50ms
- [ ] No janky animations
- [ ] Smooth scrolling
- [ ] Works on different window sizes
- [ ] Loading states shown for async operations

---

## Testing

### ✅ 25. Testability

**Check:**
- [ ] Functions are pure where possible
- [ ] Dependencies can be mocked
- [ ] Event emissions can be tested
- [ ] Edge cases have tests
- [ ] Happy path has tests

---

### ✅ 26. Test Coverage

**Check:**
- [ ] Critical paths tested
- [ ] Error scenarios tested
- [ ] Integration points tested
- [ ] UI components have snapshot tests
- [ ] No untested complex logic

---

## Documentation

### ✅ 27. Code Documentation

**Check:**
- [ ] Complex algorithms explained
- [ ] WHY decisions documented
- [ ] Integration points documented
- [ ] Configuration options documented
- [ ] Event contracts documented

---

### ✅ 28. User Documentation

**Check:**
- [ ] README explains what this is
- [ ] Setup instructions clear
- [ ] Configuration options explained
- [ ] Troubleshooting section exists
- [ ] Examples provided

---

## Performance

### ✅ 29. Resource Usage

**Check:**
- [ ] Memory leaks prevented (subscriptions cleaned up)
- [ ] No unnecessary re-renders in React
- [ ] Expensive operations throttled/debounced
- [ ] Large lists virtualized
- [ ] Images optimized

---

### ✅ 30. Startup Time

**Check:**
- [ ] App starts quickly (< 3 seconds to UI)
- [ ] Lazy loading for non-critical features
- [ ] Config loaded asynchronously
- [ ] Models loaded on-demand
- [ ] Splash screen shows while loading

---

## Security

### ✅ 31. File Access Safety

**Check:**
- [ ] User explicitly grants file access
- [ ] File paths validated (no directory traversal)
- [ ] Permissions requested before each access
- [ ] File operations logged
- [ ] Read-only by default

---

### ✅ 32. API Key Security

**Check:**
- [ ] API keys stored encrypted
- [ ] API keys never logged
- [ ] API keys never transmitted except to API
- [ ] User can revoke keys
- [ ] No keys in source code

---

## Marcus's Specific Requirements

### ✅ 33. 95/5 Rule

**Check:**
- [ ] 95% of code is reusable across projects
- [ ] Only 5% is project-specific configuration
- [ ] Business logic separated from config
- [ ] Core algorithms framework-agnostic

---

### ✅ 34. Quality Over Speed

**Check:**
- [ ] No "quick and dirty" solutions
- [ ] No time-pressure language in comments
- [ ] Proper architecture even if takes longer
- [ ] Refactored for clarity, not just working

---

### ✅ 35. Navy Submarine Standards

**Check:**
- [ ] Quality assurance mindset
- [ ] Automated over manual
- [ ] Systems thinking
- [ ] Fault tolerance
- [ ] Clear chain of responsibility

---

## Pre-Submission Checklist

Before presenting work to Marcus:

### ✅ 36. Self-Review

- [ ] Read through all code as if you're a new developer
- [ ] Check for typos and inconsistencies
- [ ] Verify all TODOs are resolved or have tickets
- [ ] Run all tests and verify they pass
- [ ] Test manually in UI

---

### ✅ 37. Integration Testing

- [ ] All integrations work (Ollama, Claudeinator, aGenticOS)
- [ ] Event flow works end-to-end
- [ ] Supervisors trigger correctly
- [ ] Token management works
- [ ] Model switching works

---

### ✅ 38. Performance Testing

- [ ] App starts in < 3 seconds
- [ ] UI is responsive (< 50ms interactions)
- [ ] No memory leaks during extended use
- [ ] Event bus doesn't slow down over time

---

### ✅ 39. User Testing

- [ ] Can complete LLC formation workflow
- [ ] Progress saves and loads correctly
- [ ] AI chatbot works
- [ ] All 7 chapters display properly
- [ ] Checklists function correctly

---

### ✅ 40. Final Polish

- [ ] No console errors or warnings
- [ ] No broken images or UI elements
- [ ] All text is readable
- [ ] Colors are visually appealing
- [ ] Animations are smooth

---

## Rejection Criteria (Auto-Reject if Present)

**Immediate rejection - do not pass to Marcus:**

1. ❌ Any polling loops (`setInterval` checking state)
2. ❌ Hardcoded values without config option
3. ❌ Block comments `/* */` (except JSDoc)
4. ❌ Missing file headers
5. ❌ No error handling at system boundaries
6. ❌ Magic numbers or strings
7. ❌ Defaults scattered in multiple places
8. ❌ Direct component references (not using events)
9. ❌ Memory leaks (subscriptions not cleaned up)
10. ❌ Generic "AI slop" UI design

**Fix these issues before review.**

---

## Scoring System

Rate each requirement 0-2:
- 0 = Not met
- 1 = Partially met
- 2 = Fully met

**Minimum passing score: 75/80 (94%)**

Anything below 94% needs revision before presenting to Marcus.

---

## Example Review Process

```
File: src/agents/UIAgent.js

✅ Observer pattern: 2/2 - All state changes emit events
✅ Initialization: 2/2 - All defaults in constructor
✅ No hardcoding: 2/2 - Uses config.ui settings
✅ Comments: 2/2 - Explains WHY, not WHAT
✅ File header: 2/2 - Present and complete
✅ Error handling: 2/2 - Validates at boundaries
✅ Separation of concerns: 2/2 - Single responsibility
✅ Composition: 2/2 - No deep inheritance
... (continue for all 40 items)

Score: 80/80 (100%)
Status: ✅ APPROVED - Ready for Marcus
```

---

## Quality Improvement Suggestions

When reviewing code, look for opportunities to:

1. **Extract reusable utilities** - If code appears in 2+ places, extract it
2. **Simplify complex logic** - Break down large functions
3. **Add helpful comments** - Explain non-obvious decisions
4. **Improve error messages** - Make them actionable for users
5. **Optimize performance** - Remove unnecessary work
6. **Enhance UX** - Add visual feedback and transitions
7. **Increase testability** - Make functions pure where possible
8. **Document integration points** - Explain how pieces connect

---

## Remember

**This code represents:**
- Marcus's professional portfolio
- His transition to freelance business owner
- His commitment to quality over speed
- His Navy submarine quality assurance background

**Make every line count. Make it legendary.** 🚀
