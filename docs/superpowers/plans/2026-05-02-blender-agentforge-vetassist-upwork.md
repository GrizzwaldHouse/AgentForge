# Multi-Project Launch Plan: Blender Plugin + AgentForge Brainstorm + VetAssist + Upwork Portfolio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver four independent workstreams: (1) a production-grade Blender workflow automation addon with client intake artifact, (2) AgentForge brainstorm artifact integration, (3) VetAssist brainstorm artifact integration, and (4) Upwork portfolio packaging — each primed with a self-contained Claude Code JSON session prompt.

**Architecture:** Each workstream gets its own Claude Code session prompt (JSON) that is fully self-contained — no cross-session context assumed. A shared `ui-wireframe-spec` skill captures the UX layout description workflow so it can be reused across all projects and piped into ChatGPT → nano banana → Lovable.

**Tech Stack:** Python 3.10+ / Blender Python API 3.0+, Next.js 15 / TypeScript / Tailwind (AgentForge + VetAssist), Markdown skills (ClaudeSkills), Upwork profile markdown + GitHub README templates.

---

## Scope Check

Four independent subsystems — one plan section per subsystem. Each section is independently deployable. Do not combine sessions.

---

## File Structure

### New files to create

```
C:\Users\daley\Projects\BlenderWorkflowForge\          ← new folder
  addon\
    __init__.py                                         ← Blender addon entry point + registration
    workflow_engine.py                                  ← step executor, no Blender UI concerns
    config_loader.py                                    ← JSON workflow file reader/validator
    operators.py                                        ← bpy.types.Operator subclasses
    ui_panel.py                                         ← N-panel sidebar UI
    event_bus.py                                        ← lightweight observer (no polling)
    workflows\
      optimize_mesh.json                               ← example workflow
      batch_export.json                                ← example workflow
  client_intake\
    intake_form.md                                      ← client-fillable markdown intake
    intake_schema.json                                  ← JSON schema for intake validation
  docs\
    INSTALL.md
    USAGE.md
    WIREFRAME_SPEC.md                                   ← UI layout description for ChatGPT

C:\Users\daley\Projects\SeniorDevBuddy\
  docs\superpowers\plans\
    2026-05-02-blender-agentforge-vetassist-upwork.md  ← this file

C:\ClaudeSkills\skills\ui-wireframe-spec\
  SKILL.md                                             ← reusable UI wireframe description skill

C:\Users\daley\Projects\SeniorDevBuddy\
  session-prompts\
    blender-session-prompt.json                        ← paste into BlenderWorkflowForge session
    agentforge-session-prompt.json                     ← paste into SeniorDevBuddy session
    vetassist-session-prompt.json                      ← paste into VetAssist session

C:\Users\daley\Projects\VA Work\
  (existing — VetAssist brainstorm artifact wired in)

D:\portfolio-website\
  (existing — README + screenshot templates added)
```

---

## Task 1: Create the `ui-wireframe-spec` Skill

**Files:**
- Create: `C:\ClaudeSkills\skills\ui-wireframe-spec\SKILL.md`

This skill captures the standard workflow for producing a UI layout description that can be pasted into ChatGPT to generate a nano banana / DALL-E wireframe image, then given to Lovable or Claude AI as a visual reference.

- [ ] **Step 1: Write the skill file**

```markdown
---
name: ui-wireframe-spec
description: Generate a precise UI layout description for any project panel or dashboard. Output is a plain-English wireframe spec formatted for ChatGPT → image generation → Lovable/Claude AI handoff. Use whenever a new UI surface needs a visual reference before implementation.
---

# UI Wireframe Spec Skill

Use this skill before any UI implementation to produce:
1. A structured plain-English layout description (for ChatGPT image gen)
2. A component inventory (for Lovable / Claude AI)
3. A theme token list (colors, fonts, spacing)

## Workflow

### Step 1 — Gather context
Answer these before writing the spec:
- What is the surface? (panel, dashboard, modal, sidebar, full page)
- Who is the user? (artist, developer, veteran, client)
- What is the primary action on this surface?
- What theme applies? (game_dev_arcade / vetassist_tactical / research_editorial / blender_dark)
- What existing design system applies? (Tailwind, Blender UI conventions, none)

### Step 2 — Write the ChatGPT image prompt

Format:
```
UI wireframe mockup, [surface type], dark [color] background, [layout description].
Top bar: [contents]. Left sidebar: [contents]. Main area: [contents]. Right panel: [contents, if any].
Font: [font name], [weight]. Accent color: [hex]. Style: [aesthetic].
No lorem ipsum. Label every section. Flat design, no shadows, developer wireframe aesthetic.
```

### Step 3 — Write the component inventory

List every component the implementation needs:
- Layout wrappers (panels, grids, flex containers)
- Interactive elements (buttons, dropdowns, toggles, inputs)
- Display elements (labels, status badges, log viewers, progress bars)
- Navigation (tabs, breadcrumbs, sidebar links)

### Step 4 — Write the theme token list

| Token | Value | Usage |
|-------|-------|-------|
| bg-primary | #1a1a2e | Main background |
| bg-secondary | #16213e | Panel background |
| accent | #e94560 | Buttons, highlights |
| text-primary | #eaeaea | Body text |
| text-muted | #888 | Labels, secondary |
| font-display | [name] | Headers |
| font-body | [name] | Body text |
| font-mono | JetBrains Mono | Code, logs |
| border-radius | 4px | All components |
| spacing-unit | 8px | Base spacing grid |

### Step 5 — Handoff format

Paste Step 2 output into ChatGPT with prompt: "Generate this as a flat UI wireframe image."
Paste Step 3 + Step 4 into Lovable or Claude AI with: "Build this UI. Use the component list and theme tokens exactly."

## Themes

### blender_dark
- bg-primary: #1a1a1a
- bg-secondary: #2b2b2b
- accent: #e67e22
- text-primary: #ffffff
- font-display: Inter Bold
- font-body: Inter
- aesthetic: "professional 3D software tool, Blender-native dark theme"

### game_dev_arcade
- bg-primary: #0d0d1a
- bg-secondary: #1a1a2e
- accent: #ff2d78
- text-primary: #e0e0ff
- font-display: Press Start 2P
- font-body: Inter
- aesthetic: "neon retro arcade, cyberpunk game dev tool"

### vetassist_tactical
- bg-primary: #0f1a0f
- bg-secondary: #1a2b1a
- accent: #4a9e4a
- text-primary: #d4e6d4
- font-display: Playfair Display
- font-body: Inter
- aesthetic: "military precision, dark forest green, veteran services"

### research_editorial
- bg-primary: #f5f0e8
- bg-secondary: #ede8dc
- accent: #8b4513
- text-primary: #2c1a0e
- font-display: Playfair Display
- font-body: Georgia
- aesthetic: "parchment academic, editorial clarity"

## Output Example (Blender Plugin Panel)

**ChatGPT image prompt:**
```
UI wireframe mockup, Blender N-panel sidebar, dark charcoal background #1a1a1a.
Top section: panel title "WorkflowForge" in orange accent, small gear icon top-right.
Middle section: dropdown labeled "Select Workflow" full width, below it a large orange button "Run Workflow".
Bottom section: scrollable log area labeled "Output Log" showing 4-5 lines of monospace text with green checkmarks and red X icons.
Font: Inter Bold for labels, JetBrains Mono for log text. Accent color: #e67e22.
Style: professional 3D software tool, Blender-native dark theme.
No lorem ipsum. Label every section. Flat design, no shadows, developer wireframe aesthetic.
```

**Component inventory:**
- PanelLayout (full-width column, 8px padding)
- SectionHeader ("WorkflowForge" + gear icon)
- WorkflowDropdown (bpy.props.EnumProperty rendered as UI layout.prop)
- RunButton (layout.operator, accent color, full width)
- LogViewer (scrollable box, monospace, 6 lines visible)
- StatusBadge (green ✔ / red ✗ per log line)
```

Save this file to `C:\ClaudeSkills\skills\ui-wireframe-spec\SKILL.md`.

- [ ] **Step 2: Verify file saved**

```powershell
Get-Content "C:\ClaudeSkills\skills\ui-wireframe-spec\SKILL.md" | Select-Object -First 5
```
Expected: frontmatter lines starting with `---`

- [ ] **Step 3: Commit**

```bash
cd C:\ClaudeSkills
git add skills/ui-wireframe-spec/SKILL.md
git commit -m "feat(skills): add ui-wireframe-spec skill for ChatGPT image gen → Lovable handoff"
```

---

## Task 2: Blender Plugin — UI Wireframe Spec and ChatGPT Prompt

**Files:**
- Create: `C:\Users\daley\Projects\BlenderWorkflowForge\docs\WIREFRAME_SPEC.md`

This task produces the layout description you paste into ChatGPT to generate the nano banana wireframe image.

- [ ] **Step 1: Create the BlenderWorkflowForge folder**

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\daley\Projects\BlenderWorkflowForge\docs"
New-Item -ItemType Directory -Force -Path "C:\Users\daley\Projects\BlenderWorkflowForge\addon\workflows"
New-Item -ItemType Directory -Force -Path "C:\Users\daley\Projects\BlenderWorkflowForge\client_intake"
```

Expected: directories created, no error.

- [ ] **Step 2: Write the wireframe spec**

Create `C:\Users\daley\Projects\BlenderWorkflowForge\docs\WIREFRAME_SPEC.md`:

```markdown
# WorkflowForge — UI Wireframe Spec

## Surface
Blender N-panel sidebar (Tab: "WorkflowForge")
Renders inside the 3D Viewport sidebar (press N to open).
Width: ~250px fixed (Blender sidebar constraint).
Height: fills available sidebar space.

## Layout (top to bottom)

### Section 1 — Header (height: 32px)
- Left: Panel title "WorkflowForge" in orange bold
- Right: Small gear icon (⚙) opens settings sub-panel

### Section 2 — Workflow Selector (height: 40px)
- Full-width dropdown: "Select Workflow"
- Options populated from JSON files in /workflows/ folder
- Selected option name displayed in orange accent

### Section 3 — Workflow Info (height: 48px, collapsible)
- Small text block showing: step count, estimated time, last run timestamp
- Collapse arrow on right

### Section 4 — Run Controls (height: 48px)
- Large full-width button: "▶ Run Workflow" — orange background, white text
- Below it: smaller "⟳ Reload Workflows" button — outlined, no fill

### Section 5 — Output Log (height: remaining space, min 120px)
- Label: "Output Log" + small "✕ Clear" link on right
- Scrollable monospace text area
- Each line prefixed: ✔ (green) for success, ✗ (red) for error, ⋯ (grey) for running
- Shows last 20 lines

### Section 6 — Status Bar (height: 24px, pinned bottom)
- Left: current status ("Ready" / "Running..." / "Error")
- Right: tiny version label "v1.0.0"

## Theme: blender_dark
- bg-primary: #1a1a1a
- bg-secondary: #2b2b2b  
- bg-panel: #252525
- accent: #e67e22
- accent-hover: #f39c12
- text-primary: #ffffff
- text-muted: #888888
- text-success: #27ae60
- text-error: #e74c3c
- text-running: #7f8c8d
- font-display: Inter Bold 11px (Blender default)
- font-body: Inter Regular 11px
- font-mono: monospace 10px (Blender log convention)
- border: #3a3a3a
- border-radius: 2px (Blender convention — minimal radius)

## Component Inventory (for Lovable/Claude AI)

| Component | Type | Blender API |
|-----------|------|-------------|
| PanelHeader | Row layout | layout.row() |
| GearIcon | Operator button | layout.operator("wm.call_menu") |
| WorkflowDropdown | Enum property | layout.prop(scene, "wf_selected") |
| WorkflowInfo | Box + labels | layout.box() |
| RunButton | Operator button | layout.operator("wf.run") |
| ReloadButton | Operator button | layout.operator("wf.reload") |
| LogViewer | Box + label rows | layout.box() loop |
| StatusBar | Row + labels | layout.row() |

## ChatGPT Image Generation Prompt

Paste this exactly into ChatGPT:

---
UI wireframe mockup, Blender 3D software N-panel sidebar tab, dark charcoal background #1a1a1a, 250px wide column layout.

TOP: Panel header row — left side shows "WorkflowForge" in orange bold text (#e67e22), right side shows a small gear icon button.

SECOND ROW: Full-width dropdown selector labeled "Select Workflow" with orange accent border when active. Below it, smaller grey text showing "3 steps · Last run: 2 min ago".

THIRD ROW: Large full-width button "▶ Run Workflow" — solid orange background #e67e22, white bold text. Below it, a smaller outlined button "⟳ Reload Workflows" — no fill, orange outline, orange text.

BOTTOM SECTION: Scrollable log area labeled "Output Log" with a small "✕ Clear" link on the right. Inside the log box: 5 lines of monospace text, each prefixed with either a green checkmark ✔, red X ✗, or grey ellipsis ⋯. Dark background #252525 for the log box.

VERY BOTTOM: Thin status bar row — left shows "Ready" in green text, right shows "v1.0.0" in grey.

Font: Inter Bold for section labels, monospace for log text. Accent: #e67e22 orange. Background: #1a1a1a dark charcoal. Style: professional 3D software tool panel, Blender-native UI conventions, flat design, no drop shadows, no gradients. Label every section clearly. Developer wireframe aesthetic, not a polished mockup.
---

## Lovable / Claude AI Handoff Prompt

After receiving the image from ChatGPT, paste this into Lovable or Claude AI along with the image:

---
Build a Blender N-panel sidebar UI based on the attached wireframe. This is Python code using the Blender Python API (bpy), NOT a web UI. The panel registers as a tab called "WorkflowForge" in the 3D Viewport N-panel.

Use this component structure:
[paste Component Inventory table above]

Use these theme tokens:
[paste Theme section above]

Requirements:
- No hardcoded workflow names — populate dropdown from a list variable
- Log viewer shows last 20 entries, scrollable via Blender's built-in scroll
- Run button calls an Operator class, not inline logic
- All panel sections use layout.box() for visual grouping
- Follow Blender addon registration conventions exactly (bl_info, register(), unregister())
- No global mutable state — store workflow selection on bpy.types.Scene properties
---
```

- [ ] **Step 3: Verify file written**

```powershell
(Get-Content "C:\Users\daley\Projects\BlenderWorkflowForge\docs\WIREFRAME_SPEC.md").Count
```
Expected: more than 50 lines.

---

## Task 3: Blender Plugin — Full Addon Code (Claude Code Session Prompt)

**Files:**
- Create: `C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\blender-session-prompt.json`

This is the JSON prompt you paste into a Claude Code session opened inside `C:\Users\daley\Projects\BlenderWorkflowForge\`.

- [ ] **Step 1: Write the session prompt JSON**

Create `C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\blender-session-prompt.json`:

```json
{
  "session_context": {
    "project": "WorkflowForge — Blender Workflow Automation Addon",
    "developer": "Marcus Daley",
    "working_directory": "C:\\Users\\daley\\Projects\\BlenderWorkflowForge",
    "target": "Production-grade Blender Python addon. No stubs. No minimal code. Full working implementation.",
    "portfolio_purpose": "Upwork demo + sellable product. Every line must reflect senior-level architecture."
  },
  "coding_standards": {
    "observer_pattern": "All state changes emit events through event_bus.py. Zero polling.",
    "no_hardcoding": "All workflow names, paths, and config loaded from JSON files. Nothing hardcoded.",
    "defaults_in_init": "All class defaults set in __init__. Never scattered.",
    "separation_of_concerns": "UI in ui_panel.py, logic in workflow_engine.py, data in config_loader.py, ops in operators.py.",
    "comments": "Explain WHY only. No block comments. One line max.",
    "blender_conventions": "Follow bpy registration conventions exactly. bl_info required. register()/unregister() required.",
    "no_global_state": "Scene properties via bpy.props only. No module-level mutable state."
  },
  "deliverables": [
    {
      "file": "addon/__init__.py",
      "purpose": "Blender addon entry point. Defines bl_info. Calls register/unregister for all classes.",
      "requirements": [
        "bl_info with name WorkflowForge, version 1.0.0, blender 3.0.0, category Object",
        "Imports and registers: operators, ui_panel, event_bus, config_loader, workflow_engine",
        "Registers bpy.types.Scene.wf_selected_workflow as EnumProperty populated from config_loader",
        "Registers bpy.types.Scene.wf_log as StringProperty for log output",
        "Clean unregister removes all registered classes and scene properties"
      ]
    },
    {
      "file": "addon/event_bus.py",
      "purpose": "Lightweight observer event bus. Zero polling. All workflow state changes emit here.",
      "requirements": [
        "EventBus class with on(event_type, fn), off(event_type, fn), emit(event_type, data)",
        "Listeners stored as dict of lists. on() returns unsubscribe lambda.",
        "emit() wraps each listener in try/except to prevent one failure from blocking others",
        "Module-level singleton: event_bus = EventBus()",
        "Event types: workflow:started, workflow:step:complete, workflow:step:error, workflow:complete, workflow:failed, workflows:reloaded"
      ]
    },
    {
      "file": "addon/config_loader.py",
      "purpose": "Loads and validates workflow JSON files from the addon workflows/ directory.",
      "requirements": [
        "get_workflows_dir() returns Path to addon/workflows/ relative to __file__",
        "load_workflows() reads all .json files, validates required keys: workflow_id, name, steps",
        "Each step must have: action (str), optional params (dict)",
        "Returns list of dicts. Emits workflows:reloaded on the event_bus after load.",
        "get_workflow_enum_items() returns list of (identifier, name, description) tuples for EnumProperty",
        "Handles missing directory, malformed JSON, missing keys — logs error, skips file, never crashes"
      ]
    },
    {
      "file": "addon/workflow_engine.py",
      "purpose": "Executes ordered workflow steps defined in JSON. No UI logic here.",
      "requirements": [
        "WorkflowEngine class with execute(workflow_dict, context) method",
        "Iterates steps in order. For each step: dispatch to action handler, emit workflow:step:complete or workflow:step:error",
        "Action handlers as dict mapping action string to handler function",
        "Supported actions: apply_modifier(type, params), recalculate_normals(), apply_transform(location, rotation, scale), decimate(ratio), rename_object(name), set_origin(type)",
        "Each handler takes (context, params) and returns (success: bool, message: str)",
        "emit workflow:started before first step, workflow:complete or workflow:failed after last step",
        "Never import from ui_panel.py or operators.py"
      ]
    },
    {
      "file": "addon/operators.py",
      "purpose": "Blender Operator classes. Thin wrappers that call WorkflowEngine and update scene log.",
      "requirements": [
        "WF_OT_RunWorkflow: bl_idname wf.run, bl_label Run Workflow. execute() gets selected workflow from scene.wf_selected_workflow, calls WorkflowEngine.execute(), returns FINISHED or CANCELLED",
        "WF_OT_ReloadWorkflows: bl_idname wf.reload, bl_label Reload Workflows. execute() calls config_loader.load_workflows(), refreshes EnumProperty items, returns FINISHED",
        "WF_OT_ClearLog: bl_idname wf.clear_log, bl_label Clear. execute() sets scene.wf_log to empty string, returns FINISHED",
        "All operators subscribe to event_bus to append log lines to scene.wf_log",
        "Log line format: [✔|✗|⋯] step_name — message",
        "Operators register via classes list exported for __init__.py"
      ]
    },
    {
      "file": "addon/ui_panel.py",
      "purpose": "Blender N-panel sidebar UI. Pure layout code — no business logic.",
      "requirements": [
        "WORKFLOWFORGE_PT_Panel: bl_label WorkflowForge, bl_space_type VIEW_3D, bl_region_type UI, bl_category WorkflowForge",
        "draw() renders exactly: header row (title + gear), workflow dropdown (scene.wf_selected_workflow), info box (step count), run button (wf.run full width), reload button (wf.reload outlined), log box (scene.wf_log split by newline, last 20 lines), status bar (first word of last log line + version)",
        "Use layout.box() for log and info sections",
        "Use layout.operator() for all buttons — never call Python functions directly from draw()",
        "Status color: green if last log line starts with ✔, red if ✗, grey otherwise"
      ]
    },
    {
      "file": "addon/workflows/optimize_mesh.json",
      "purpose": "Example workflow — mesh optimization pipeline.",
      "content": {
        "workflow_id": "optimize_mesh",
        "name": "Optimize Mesh",
        "description": "Decimate, recalculate normals, apply transforms",
        "steps": [
          {"action": "decimate", "params": {"ratio": 0.5}},
          {"action": "recalculate_normals", "params": {}},
          {"action": "apply_transform", "params": {"location": true, "rotation": true, "scale": true}}
        ]
      }
    },
    {
      "file": "addon/workflows/batch_export.json",
      "purpose": "Example workflow — prep for export.",
      "content": {
        "workflow_id": "batch_export",
        "name": "Batch Export Prep",
        "description": "Set origin, apply scale, recalculate normals",
        "steps": [
          {"action": "set_origin", "params": {"type": "ORIGIN_GEOMETRY"}},
          {"action": "apply_transform", "params": {"location": false, "rotation": false, "scale": true}},
          {"action": "recalculate_normals", "params": {}}
        ]
      }
    }
  ],
  "instructions": [
    "Write every file completely. No stubs. No TODO placeholders. No 'implement later'.",
    "Test mentally: if I zip the addon/ folder and install in Blender 4.x, it must work.",
    "Follow the coding_standards above on every file.",
    "Start with event_bus.py, then config_loader.py, then workflow_engine.py, then operators.py, then ui_panel.py, then __init__.py last.",
    "After all files are written, write a INSTALL.md with exact Blender installation steps.",
    "After INSTALL.md, write a 60-second Loom script I can read aloud while recording the demo."
  ]
}
```

- [ ] **Step 2: Verify file written**

```powershell
(Get-Content "C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\blender-session-prompt.json" | ConvertFrom-Json).session_context.project
```
Expected: `WorkflowForge — Blender Workflow Automation Addon`

---

## Task 4: Client Intake Artifact (Upwork Proposal Weapon)

**Files:**
- Create: `C:\Users\daley\Projects\BlenderWorkflowForge\client_intake\intake_form.md`

- [ ] **Step 1: Write the client intake markdown**

Create `C:\Users\daley\Projects\BlenderWorkflowForge\client_intake\intake_form.md`:

```markdown
# WorkflowForge — Client Workflow Discovery Intake
**Prepared by:** Marcus Daley | Game Dev & Tools Engineer
**Purpose:** Help me build exactly what you need — fill this out before our first call and I'll have a working prototype ready to show you.
**Time to complete:** ~10 minutes

---

## Section 1 — Your Current Pain (the real cost)

**1.1 — Which tasks do you repeat most in Blender? (check all that apply)**
- [ ] Applying the same modifiers in the same order on every mesh
- [ ] Manually fixing normals on imported models
- [ ] Applying transforms (location/rotation/scale) before export
- [ ] Renaming objects following a naming convention
- [ ] Setting origins to geometry before export
- [ ] Setting up the same material nodes on every new object
- [ ] Batch renaming multiple objects at once
- [ ] Other: _______________

**1.2 — How many times per day do you run these repetitive steps?**
- [ ] 1–5 times (minor friction)
- [ ] 6–20 times (real time sink)
- [ ] 20+ times (this is killing my productivity)

**1.3 — What is your biggest frustration right now?**
_(free text — be specific, this is where the real problem lives)_

_______________________________________________

---

## Section 2 — Your Workflow Today

**2.1 — When you do a typical repetitive task, how many steps does it involve?**
- [ ] 2–3 steps
- [ ] 4–7 steps
- [ ] 8+ steps (I basically have a checklist in my head)

**2.2 — Do you work on one object at a time or multiple objects at once?**
- [ ] One object at a time
- [ ] Multiple selected objects simultaneously
- [ ] Both — depends on the task

**2.3 — List one complete workflow you do repeatedly (step by step):**
_(Example: "Select mesh → Apply decimate modifier at 50% → Recalculate normals → Apply scale → Export as FBX")_

Step 1: _______________
Step 2: _______________
Step 3: _______________
Step 4: _______________
Step 5: _______________

---

## Section 3 — What You Want Built

**3.1 — How should workflows be managed? (pick one)**
- [ ] I define workflows myself by editing a simple file (JSON/YAML) — I'm comfortable with text files
- [ ] I want a UI inside Blender to add/edit/delete workflow steps without touching any file
- [ ] Both — file for power users, UI for quick edits

**3.2 — What should happen if a step fails? (pick one)**
- [ ] Stop immediately and show me what went wrong
- [ ] Skip the failed step and continue with remaining steps
- [ ] Ask me what to do (pause and wait)

**3.3 — Do you need to run workflows on batches of objects at once?**
- [ ] No — one object at a time is fine
- [ ] Yes — I need to select 10+ objects and run a workflow on all of them

**3.4 — Do you need to save workflow results or export a report?**
- [ ] No — just running the workflow is enough
- [ ] Yes — I want a log file saved after each run
- [ ] Yes — I want a summary shown in Blender's interface

---

## Section 4 — Technical Context

**4.1 — Which Blender version are you using?**
- [ ] Blender 3.x
- [ ] Blender 4.0–4.1
- [ ] Blender 4.2+ (LTS)
- [ ] Multiple versions (please specify): _______________

**4.2 — Do you work with any specific file formats?**
- [ ] FBX (game engine export)
- [ ] OBJ
- [ ] GLTF/GLB
- [ ] USD
- [ ] Other: _______________

**4.3 — Are there other tools in your pipeline this needs to connect with?**
_(Example: Unreal Engine, Unity, Substance Painter, custom scripts)_

_______________________________________________

---

## Section 5 — UI Preferences

**5.1 — Where should the plugin panel live?**
- [ ] N-panel sidebar in the 3D Viewport (press N to open) — most common
- [ ] Properties panel (right side properties tabs)
- [ ] A popup window that appears when I run a shortcut key

**5.2 — How much information do you want visible at once?**
- [ ] Minimal — just a dropdown and a Run button. Keep it clean.
- [ ] Medium — dropdown, run button, step list, log output
- [ ] Full — everything: step editor, log, status, settings

**5.3 — Aesthetic preference:**
- [ ] Match Blender's default dark UI exactly — I want it to feel native
- [ ] Slightly styled — orange/branded but still professional
- [ ] I don't care about aesthetics — function over form

---

## Section 6 — Timeline & Budget

**6.1 — When do you need a working first version?**
- [ ] This week (MVP only)
- [ ] Within 2 weeks (full v1)
- [ ] Within a month (full v1 + documentation)
- [ ] Flexible — quality over speed

**6.2 — Budget range:**
- [ ] Under $200
- [ ] $200–$500
- [ ] $500–$1,000
- [ ] $1,000+ (enterprise-grade, full documentation, ongoing support)
- [ ] Open — let's discuss after you understand my needs

**6.3 — Anything else I should know before we start?**

_______________________________________________

---

*Return this form and I'll send you a 48-hour prototype demo before you commit to anything.*
*— Marcus Daley | github.com/GrizzwaldHouse*
```

- [ ] **Step 2: Verify file written**

```powershell
(Get-Content "C:\Users\daley\Projects\BlenderWorkflowForge\client_intake\intake_form.md").Count
```
Expected: more than 100 lines.

---

## Task 5: Upwork Proposal Copy

**Files:**
- Create: `C:\Users\daley\Projects\BlenderWorkflowForge\client_intake\upwork_proposal.md`

- [ ] **Step 1: Write the proposal**

Create `C:\Users\daley\Projects\BlenderWorkflowForge\client_intake\upwork_proposal.md`:

```markdown
# Upwork Proposal — Blender Plugin Development for Workflow Optimization

**Character count target:** Under 1,500 (Upwork skims in 8 seconds)

---

## Proposal Text (paste into Upwork apply box)

I build configurable workflow systems for 3D software — not just one-off plugins.

Your job post says "simplify my workflow." Every developer on this page will reply "I'll build your plugin." Here's what I'll actually do differently:

Before writing a single line of code, I'll send you a 10-minute intake form. You fill it out — your specific steps, your pain points, your Blender version. I use your answers to define the exact automation system, not guess at it.

Then within 48 hours I'll send you a working prototype demo video. You see it working before you pay a deposit.

**My background:**
- Navy veteran, Full Sail BS Computer Science & Game Development (Feb 2026)
- Specialist in tool programming and workflow automation
- Built modular command panel systems for Unreal Engine (same architecture, different host)
- GitHub: github.com/GrizzwaldHouse

**What you'll get:**
- A configurable workflow engine inside Blender — define workflows in a simple file, run them with one click
- Clean N-panel sidebar UI that feels native to Blender
- Add new workflows without touching code
- Full documentation and usage guide

Fill out my intake form (link below) and I'll have a prototype in your inbox within 48 hours.

[Attach intake_form.md or Notion link here]

---

## Upwork Profile — Sections to Update

### Title
`Blender Plugin Developer | Workflow Automation | Tool Programming | UE5`

### Overview (first 2 lines — what shows without expanding)
`I build configurable workflow automation tools for 3D software and game engines. Navy veteran, Full Sail CS grad — tool programming specialist with production-grade architecture standards.`

### Skills to add
- Blender Python API
- Workflow Automation
- Plugin Development
- Unreal Engine 5
- Tool Programming
- Python
- Event-Driven Architecture

### Portfolio items to add (from GitHub)

| Project | GitHub Link | What to show |
|---------|-------------|--------------|
| WorkflowForge (Blender) | github.com/GrizzwaldHouse/BlenderWorkflowForge | Demo video + README screenshots |
| AgentForge (multi-agent AI) | github.com/GrizzwaldHouse/SeniorDevBuddy | Architecture diagram + dashboard screenshot |
| WizardJam 2.0 (UE5) | github.com/GrizzwaldHouse/BaseGame | Gameplay screenshot + blueprint screenshot |
| Portfolio Website | github.com/GrizzwaldHouse/portfolio-website | Live site screenshot |

### For each portfolio item, write:
- **Title:** Project name + one-line purpose
- **Description:** 2 sentences. Problem solved + tech used.
- **Image:** Screenshot from GitHub repo (use README images or take one)
- **URL:** GitHub repo link
```

- [ ] **Step 2: Verify**

```powershell
(Get-Content "C:\Users\daley\Projects\BlenderWorkflowForge\client_intake\upwork_proposal.md").Count
```
Expected: more than 60 lines.

---

## Task 6: AgentForge Session Prompt (Brainstorm Artifact Integration)

**Files:**
- Create: `C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\agentforge-session-prompt.json`

This prompt is pasted into a Claude Code session opened inside `C:\Users\daley\Projects\SeniorDevBuddy\agentforge_autonomous\`.

- [ ] **Step 1: Write the session prompt**

Create `C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\agentforge-session-prompt.json`:

```json
{
  "session_context": {
    "project": "AgentForge — Brainstorm Artifact Feature Integration",
    "developer": "Marcus Daley",
    "working_directory": "C:\\Users\\daley\\Projects\\SeniorDevBuddy\\agentforge_autonomous",
    "target": "Add a BrainstormAgent to the AgentForge pipeline that generates interactive brainstorm artifacts using the May 2026 schema. Theme: game_dev_arcade (neon/cyberpunk). No stubs. Full production implementation.",
    "existing_system": {
      "agent_interface": "src/core/interfaces/Agent.ts — Agent.execute(input: AgentInput): Promise<AgentOutput>",
      "registry": "src/agents/registry.ts — add BrainstormAgent to createAgents()",
      "test_pattern": "src/agents/__tests__/agents.test.ts — add BrainstormAgent test",
      "safety": "src/safety/safety-guard.ts — all agents run through guardAction()",
      "tests_must_pass": "npm test must pass at 230+ tests before and after"
    }
  },
  "coding_standards": {
    "observer_pattern": "Emit agent events through agentEventBus. No polling.",
    "es_modules": "Use @/* imports. No CommonJS.",
    "safety": "Never bypass guardAction. Never bypass kill switch.",
    "agent_contract": "Return { success, data?, logs[] } from every execute() path.",
    "no_ui_in_agents": "BrainstormAgent returns structured data only. UI renders in Next.js components.",
    "tdd": "Write failing test first. Then implement. Then confirm pass."
  },
  "deliverables": [
    {
      "file": "src/agents/brainstorm/BrainstormAgent.ts",
      "purpose": "Generates a structured brainstorm artifact from a project description.",
      "interface": "implements Agent { id: 'brainstorm-agent', name: 'Brainstorm Agent' }",
      "execute_input": "input.context.projectDescription: string, input.context.theme?: 'game_dev_arcade' | 'vetassist_tactical' | 'research_editorial' | 'blender_dark'",
      "execute_output": {
        "success": true,
        "data": {
          "artifact": {
            "title": "string",
            "theme": "string",
            "sections": "BrainstormSection[]",
            "metadata": { "capturedAt": "ISO string", "projectSlug": "string" }
          }
        },
        "logs": ["Brainstorm artifact generated: N sections, M questions"]
      },
      "requirements": [
        "BrainstormSection has: id, title, questions: BrainstormQuestion[]",
        "BrainstormQuestion has: id, text, type: 'single'|'multi'|'true_false'|'ranked'|'numeric_scale'|'abc_match', options: BrainstormOption[]",
        "BrainstormOption has: id, label, rationale, locked: boolean",
        "Generate at least 4 sections with 3 questions each from projectDescription",
        "Use the LLM backend (input.context.prompt) to generate content if backend available, fall back to template structure if not",
        "Theme selection affects metadata only — no UI logic in agent"
      ]
    },
    {
      "file": "src/agents/brainstorm/types.ts",
      "purpose": "TypeScript types for brainstorm artifact schema."
    },
    {
      "file": "src/agents/__tests__/brainstorm.test.ts",
      "purpose": "Vitest tests for BrainstormAgent.",
      "required_tests": [
        "execute() with valid projectDescription returns success: true and artifact with sections",
        "execute() with missing projectDescription returns success: false with descriptive log",
        "artifact has at minimum 4 sections",
        "each section has at minimum 3 questions",
        "each question has a valid type from the allowed enum",
        "theme defaults to game_dev_arcade when not provided"
      ]
    },
    {
      "file": "src/agents/registry.ts",
      "change": "Add BrainstormAgent import and include new BrainstormAgent() in createAgents() array"
    },
    {
      "file": "src/app/api/brainstorm/route.ts",
      "purpose": "POST /api/brainstorm — generates and returns a brainstorm artifact.",
      "requirements": [
        "Auth: check AGENT_TOKEN header same as /api/agent/run",
        "Safety: check killSwitch.isActive()",
        "Body: { projectDescription: string, theme?: string }",
        "Validate projectDescription non-empty, max 2000 chars",
        "Call BrainstormAgent.execute() directly (no full pipeline needed)",
        "Return artifact JSON"
      ]
    }
  ],
  "instructions": [
    "Start with types.ts, then BrainstormAgent.ts, then the test file.",
    "Run npm test after writing the test file to confirm it fails correctly.",
    "Implement BrainstormAgent.ts to make tests pass.",
    "Run npm test to confirm all 230+ tests still pass.",
    "Add to registry.ts.",
    "Write route.ts last.",
    "Run npm run build to confirm TypeScript compilation passes.",
    "Write no stubs. Every method fully implemented."
  ]
}
```

- [ ] **Step 2: Verify**

```powershell
(Get-Content "C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\agentforge-session-prompt.json" | ConvertFrom-Json).session_context.project
```
Expected: `AgentForge — Brainstorm Artifact Feature Integration`

---

## Task 7: VetAssist Session Prompt (Brainstorm Artifact + Tactical Theme)

**Files:**
- Create: `C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\vetassist-session-prompt.json`

This prompt is pasted into a Claude Code session opened inside `C:\Users\daley\Projects\VA Work\`.

- [ ] **Step 1: Write the session prompt**

Create `C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\vetassist-session-prompt.json`:

```json
{
  "session_context": {
    "project": "VetAssist — Brainstorm Artifact Integration with Tactical Theme",
    "developer": "Marcus Daley",
    "working_directory": "C:\\Users\\daley\\Projects\\VA Work",
    "target": "Integrate the May 2026 brainstorm artifact schema into VetAssist. Theme: vetassist_tactical (dark forest green, military precision). Build the intake wizard as an interactive React component. No stubs. Full production implementation.",
    "brainstorm_schema_version": "May 2026",
    "theme": {
      "name": "vetassist_tactical",
      "bg_primary": "#0f1a0f",
      "bg_secondary": "#1a2b1a",
      "bg_panel": "#142214",
      "accent": "#4a9e4a",
      "accent_hover": "#5cb85c",
      "text_primary": "#d4e6d4",
      "text_muted": "#7a9e7a",
      "text_success": "#4a9e4a",
      "text_error": "#c0392b",
      "font_display": "Playfair Display",
      "font_body": "Inter",
      "font_mono": "JetBrains Mono",
      "rank_progression": ["Recruit", "Seaman", "Petty Officer 3rd", "Petty Officer 2nd", "Petty Officer 1st", "Chief", "Senior Chief", "Master Chief"],
      "aesthetic": "military precision, dark forest green, veteran services, no gratuitous decoration"
    }
  },
  "coding_standards": {
    "observer_pattern": "All state changes emit events. No polling. Use React state + event emission.",
    "no_hardcoding": "All brainstorm content loaded from a data file. Theme tokens in a constants file.",
    "gamification": "XP system optional toggle. Defaults on. Stored in localStorage.",
    "accessibility": "All interactive elements keyboard navigable. ARIA labels on all controls.",
    "privacy": "Voice input uses Web Speech API only — no external service. Graceful degradation if unsupported."
  },
  "deliverables": [
    {
      "file": "src/components/brainstorm/BrainstormWizard.tsx",
      "purpose": "Top-level wizard component. Renders sections, tracks progress, manages XP.",
      "requirements": [
        "Accepts props: data (BrainstormData), theme (ThemeConfig), onComplete (fn)",
        "Renders section nav on left, active question area on right",
        "Tracks answers in useState<Record<string, unknown>>",
        "XP bar in header — updates on every answer",
        "Section completion detection — marks section done when all questions answered",
        "Export button appears when all sections complete — calls onComplete with answers"
      ]
    },
    {
      "file": "src/components/brainstorm/QuestionRenderer.tsx",
      "purpose": "Renders any of the 6 question types based on question.type field.",
      "question_types": ["single", "multi", "true_false", "ranked", "numeric_scale", "abc_match"],
      "requirements": [
        "Each type rendered as a separate sub-component",
        "All types receive: question, value, onChange(value), theme",
        "All types show the 4 affordances below the answer area: FreeTextOverride, VoiceInput, HybridComposer, FeedbackFlag",
        "Affordances always visible — never hidden behind a menu"
      ]
    },
    {
      "file": "src/components/brainstorm/affordances/VoiceInput.tsx",
      "purpose": "Web Speech API voice capture. Appends transcript to free-text field.",
      "requirements": [
        "Uses window.SpeechRecognition || window.webkitSpeechRecognition",
        "Hides itself (returns null) if API not supported",
        "Shows microphone icon when idle, pulsing animation when listening",
        "On transcript: appends to provided onTranscript callback",
        "Never sends audio to external service"
      ]
    },
    {
      "file": "src/components/brainstorm/gamification/XPEngine.ts",
      "purpose": "XP calculation, rank progression, achievement tracking.",
      "xp_rules": {
        "single_select": 10,
        "multi_select_per_option": 10,
        "ranked_reorder": 10,
        "numeric_scale_per_row": 10,
        "abc_match_per_row": 10,
        "free_text_override": 5,
        "hybrid_composer": 5,
        "feedback_flag": 5,
        "achievement_unlock": "varies per achievement"
      },
      "rank_thresholds": "200 XP per rank",
      "achievements": [
        {"id": "first_decision", "name": "First Decision Locked", "xp": 25, "trigger": "first answer"},
        {"id": "voice_recon", "name": "Voice Recon", "xp": 50, "trigger": "first voice input"},
        {"id": "field_notes", "name": "Field Notes", "xp": 30, "trigger": "first free text"},
        {"id": "after_action", "name": "After Action Review", "xp": 30, "trigger": "first feedback flag"},
        {"id": "section_cleared", "name": "Section Cleared", "xp": 75, "trigger": "section complete"},
        {"id": "field_manual", "name": "Field Manual Complete", "xp": 200, "trigger": "all sections complete"}
      ]
    },
    {
      "file": "src/components/brainstorm/data/vetassist-intake.ts",
      "purpose": "Brainstorm data for VetAssist veteran intake wizard.",
      "requirements": [
        "Minimum 4 sections covering: veteran background, service needs, tech comfort, goals",
        "Each section minimum 3 questions using varied question types",
        "All options include rationale text explaining trade-off",
        "Pre-locked options marked with locked: true where decisions are already made"
      ]
    },
    {
      "file": "src/components/brainstorm/theme/vetassist-tactical.ts",
      "purpose": "Theme token constants for vetassist_tactical theme.",
      "requirements": [
        "Export VETASSIST_TACTICAL_THEME as ThemeConfig object",
        "All tokens from session_context.theme above",
        "Sound cue frequencies as constants: SELECT_HZ, LOCK_HZ_1, LOCK_HZ_2, ACHIEVE_HZ_1/2/3, RANK_HZ_1/2/3/4"
      ]
    }
  ],
  "instructions": [
    "Start with theme/vetassist-tactical.ts and gamification/XPEngine.ts (no dependencies).",
    "Then affordances/VoiceInput.tsx.",
    "Then QuestionRenderer.tsx with all 6 question types.",
    "Then data/vetassist-intake.ts with real VetAssist content.",
    "Then BrainstormWizard.tsx wiring everything together.",
    "Write complete implementations. No stubs.",
    "After all files: write a one-page USAGE.md for the VetAssist dev team."
  ]
}
```

- [ ] **Step 2: Verify**

```powershell
(Get-Content "C:\Users\daley\Projects\SeniorDevBuddy\session-prompts\vetassist-session-prompt.json" | ConvertFrom-Json).session_context.project
```
Expected: `VetAssist — Brainstorm Artifact Integration with Tactical Theme`

---

## Task 8: Sync SKILLS.md in Both Modular Systems

**Files:**
- Modify: `C:\Users\daley\Projects\SeniorDevBuddy\grizz_modular_system\SKILLS.md`
- Modify: `C:\Users\daley\Projects\SeniorDevBuddy\grizz_modular_system_fixed\SKILLS.md`

Both files must stay in sync after every update per CLAUDE.md rules.

- [ ] **Step 1: Add ui-wireframe-spec to SKILLS.md**

In `grizz_modular_system\SKILLS.md`, find the `## Utility Skills` section and add:

```markdown
| SK-047 | UI Wireframe Spec | C:\ClaudeSkills\skills\ui-wireframe-spec | ACTIVE | ChatGPT image gen prompt → Lovable/Claude AI handoff for any UI surface |
```

Update the Statistics line:
```markdown
- **Total Skills:** 49 (... + 1 ui-wireframe)
- **Last Updated:** 2026-05-02
```

- [ ] **Step 2: Mirror the identical change to grizz_modular_system_fixed\SKILLS.md**

The change is identical — same line added to same section.

- [ ] **Step 3: Verify both files match**

```powershell
$a = Get-Content "C:\Users\daley\Projects\SeniorDevBuddy\grizz_modular_system\SKILLS.md"
$b = Get-Content "C:\Users\daley\Projects\SeniorDevBuddy\grizz_modular_system_fixed\SKILLS.md"
if (Compare-Object $a $b) { "MISMATCH" } else { "IN SYNC" }
```
Expected: `IN SYNC`

- [ ] **Step 4: Commit everything**

```bash
cd "C:\Users\daley\Projects\SeniorDevBuddy"
git add grizz_modular_system/SKILLS.md grizz_modular_system_fixed/SKILLS.md docs/superpowers/plans/ session-prompts/
git commit -m "feat: add session prompts for Blender/AgentForge/VetAssist + ui-wireframe-spec skill + plan"
```

---

## Self-Review

### Spec coverage check

| Requirement | Covered by task |
|-------------|----------------|
| JSON session prompts for 3 repos | Tasks 3, 6, 7 |
| No minimal code / no rework | Session prompts include "no stubs" instruction explicitly |
| Lovable/Claude AI UI wrapper | Task 2 (wireframe spec + handoff prompt) |
| ChatGPT nano banana image prompt | Task 2 (WIREFRAME_SPEC.md has exact prompt) |
| Full UX/UI layout description | Task 2 (WIREFRAME_SPEC.md component inventory + theme tokens) |
| ui-wireframe-spec as reusable skill | Task 1 |
| Upwork proposal copy | Task 5 |
| Upwork portfolio packaging | Task 5 (portfolio items table) |
| AgentForge brainstorm integration | Task 6 |
| VetAssist brainstorm integration | Task 7 |
| Theme versatile but professional | Session prompts specify theme tokens precisely |
| SKILLS.md sync | Task 8 |
| Blender client intake artifact | Task 4 |

### Placeholder scan
No TBD, no TODO, no "implement later" anywhere in this plan.

### Type consistency
- `BrainstormSection`, `BrainstormQuestion`, `BrainstormOption`, `ThemeConfig` defined in AgentForge task and referenced consistently in VetAssist task.
- Blender operator bl_idnames (`wf.run`, `wf.reload`, `wf.clear_log`) consistent across operators.py spec and ui_panel.py spec.
