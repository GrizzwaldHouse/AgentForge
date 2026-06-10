# WizardJam Audit Plan
**Version:** 2.0
**Generated:** 2026-06-10 (Claude Code -- 249 source files + 15 log files available)
**Status:** GENERATE_NOW (upgraded from partial -- source found at Source/END2507/)

---

## Project Identity

| Attribute | Value |
|---|---|
| Project name | WizardJam 2.0 |
| UE version | 5.4.4-35576357 (Release-5.4) |
| Source module | END2507 |
| Source path | C:/Users/daley/UnrealProjects/BaseGame/Source/END2507/ |
| Solution | WizardJam2.0.sln |
| Build target | END2507Editor (Development, Win64) |
| Compiler | Visual Studio 2022 14.38.33145 |
| Hardware | AMD Ryzen 7 9800X3D, 8 physical / 16 logical cores |

---

## Source File Inventory

| Type | Count | Notes |
|---|---|---|
| .h (headers) | 115 | Class declarations, interfaces |
| .cpp (implementations) | 101 | |
| No extension | 32 | Build scripts, generated files |
| .cs | 1 | UnrealBuildTool module rules |
| **Total** | **249** | Exceeds 64-file estimate from architecture PDF |

The codebase has grown substantially since the PDF audit was written. 249 files suggests
a full-featured game with multiple gameplay systems beyond what the PDF documented.

---

## Confirmed Architecture Files

| File | Confirmed | Evidence |
|---|---|---|
| AIC_QuidditchController.h | YES | Forward declaration found in 5 other headers |
| AIC_QuidditchController.cpp | YES | Build error at line 651 (C4458) |
| QuidditchGameMode (class) | YES | Referenced from AIC_QuidditchController.h, BTDecorator_IsSeeker.h, BTService_FindStagingZone.h, QuidditchDebugWidget.h, WizardJamQuidditchWidget.h |
| BTDecorator_IsSeeker.h | YES | Direct filename match |
| BTService_FindStagingZone.h | YES | Direct filename match |
| QuidditchDebugWidget.h | YES | Direct filename match |
| WizardJamQuidditchWidget.h | YES | Direct filename match |

---

## Confirmed Build Error (C4458)

**Source:** build_20260607.log
**File:** AIC_QuidditchController.cpp, line 651
**Error:** `error C4458: declaration of 'Pawn' hides class member`
**Reference:** `AController::Pawn` declared at Controller.h:70

This is a concrete instance of the C2 pitfall from the architecture PDF. The local variable
`Pawn` in `AIC_QuidditchController::SomeMethod()` at line 651 shadows `AController::Pawn`.

**Risk:** Code compiles (C4458 is a warning promoted to error by `-WarningsAsErrors`).
The shadowing means the local variable is used instead of the class member wherever
both are in scope. If the intent was to modify the controller's Pawn reference, this
silently operates on the wrong variable.

**Fix:** Rename the local variable (e.g., `TargetPawn`, `ControlledPawn`) to avoid shadowing.

---

## Confirmed Runtime Issues (From WizardJam2.0.log)

### Cast Failures: BaseCharacter

```
[2026.06.09-05.44.30:783][662]LogTemp: Error: Failed to cast pawn to BaseCharacter
```

This error appears 5 times in rapid succession at frame 662, then 5 more times 5 seconds
later at frame 104 (PIE restart), then once more at frame 656.

**Pattern:** Multiple cast failures per PIE session, at frames that suggest agent initialization.
**Cause:** A pawn actor in the level is not a `BaseCharacter` subclass, but the code
(likely in `AIC_QuidditchController` or a BP derivative) assumes all pawns are.

**Evidence connection:** The same `AIC_QuidditchController.cpp` where C4458 occurs (line 651)
is the most likely location of the `Cast<ABaseCharacter>(GetPawn())` call that fails.

### Delegate Binding Success: Death Events

```
LogTemp: Death delegate bound for BP_QuidditchAgent_C_0
LogTemp: Death delegate bound for BP_QuidditchAgent_C_1
LogTemp: Death delegate bound for BP_QuidditchAgent_C_2
```

These appear immediately after PIE starts. The death delegate system is working for the
three active quidditch agents. This is the positive counterpart to the cast failures:
agents that successfully initialize bind their death delegates.

**Architecture implication:** The level contains BP_QuidditchAgent actors (a BP subclass
of the C++ AI controller) and at least one non-BaseCharacter pawn. The cast failures
occur before delegate binding succeeds, suggesting initialization order matters.

### MCP Bridge Active

```
LogTemp: EpicUnrealMCPBridge: Server started on 127.0.0.1:55557
LogTemp: MCPCommandPanel: Server URL: http://127.0.0.1:8000
LogTemp: MCPCommandPanel: Polling interval: 1.5 seconds
LogTemp: MCPCommandPanel: Project: WizardJam2.0
```

The Unreal MCP bridge is running. This enables external tooling (including Claude Code via
MCP) to issue commands to the editor. The MCPCommandPanel polls an external server at
`http://127.0.0.1:8000` every 1.5 seconds. This is the AgentForge-to-UE communication path.

---

## Architecture Analysis (From v1 PDF + v2 Source Confirmation)

### AI Controller Hierarchy

```
AController (UE)
  -> AIC_QuidditchController (END2507)
       -> BP_QuidditchAgent_C (Blueprint subclass, 3 instances in level)
```

The controller class is confirmed present. The Blueprint subclass is confirmed via runtime log.

### BT (Behavior Tree) System

| File | Confirmed | Purpose |
|---|---|---|
| BTDecorator_IsSeeker | YES | Seeker role check in BT |
| BTService_FindStagingZone | YES | Locates staging zones (C2 pitfall related) |

The v1 PDF identified a staging zone threshold gap (C2): the BT service may not handle
the edge case where no staging zone is within range. With `BTService_FindStagingZone.h`
confirmed present, the implementation can now be read to verify this claim.

### C1, C2, C3 Verification Status

| Pitfall | PDF Claim | v2 Status |
|---|---|---|
| C1: BroomComponent early-return physics bug | SetFlightEnabled early return drops physics state | UNVERIFIED -- AC_BroomComponent.cpp not yet read |
| C2: StagingZone bridge gap | BTService_FindStagingZone threshold logic missing | PARTIALLY VERIFIED -- file confirmed present, content not read |
| C3: Perception radius missing | AIC_QuidditchController sight/hearing config absent | PARTIALLY VERIFIED -- C4458 error confirms file present and actively compiled |

Full C1/C2/C3 verification requires reading the specific source files. This is the next
analysis step.

---

## Build System

| Attribute | Value |
|---|---|
| Build tool | UnrealBuildTool (dotnet SDK 6.0.302) |
| Unity build | Adaptive (recent files excluded from unity for faster incremental builds) |
| Max parallel actions | 6 (limited by 3GB/action requirement, 19.71GB available) |
| Build time (8 actions, 2026-06-07) | 20.07 seconds total, 12.83 seconds parallel |

The adaptive build system excluded several plugin modules from unity on 2026-06-07:
- GHStaminaCore, GHModularSpawner, GHPickupSystem, GHTeleportKit, GHDestructibleSystem, GHFadeVFX

These are GH-prefix plugins (GrizzwaldHouse plugins) that were recently modified.

---

## Plugin Inventory (From LogPluginManager)

GH-prefix plugins active in WizardJam 2.0:
- GHTeleportKit (recently modified -- adaptive build excluded)
- GHStaminaCore (recently modified)
- GHModularSpawner (recently modified)
- GHPickupSystem (recently modified)
- GHDestructibleSystem (recently modified)
- GHFadeVFX (recently modified)

Engine plugins active (selection):
- EnhancedInput, ChaosCloth, ControlRig, IKRig, Paper2D, GLTFExporter, ActorSequence,
  TemplateSequence, ACLPlugin, AnimationModifierLibrary, BlendSpaceMotionAnalysis

---

## Recommended Next Analysis Steps

In priority order for V2 completeness:

1. Read `AC_BroomComponent.cpp` -- verify C1 (SetFlightEnabled early return)
2. Read `BTService_FindStagingZone.cpp` -- verify C2 (threshold logic presence/absence)
3. Read `AIC_QuidditchController.cpp` lines 640-660 -- verify C2/C3, fix C4458
4. Search source for `GetPawn()` + cast patterns -- identify all cast failure locations
5. Read `AQuidditchGameMode.h/.cpp` -- verify game loop and AI spawn logic
6. Score full WizardJam2.0.log -- PIE session durations, compile frequencies, crash events

---

## Log Quality Score

**Primary log:** WizardJam2.0.log (490,399 bytes, 2026-06-09)
**Score: GOOD** (meets SSM extraction threshold of 10/18)

| Criterion | Result |
|---|---|
| DPT output present | PASS |
| Crash recovery logged | PASS |
| PIE evidence present | PASS (cast errors occur during PIE) |
| Compile error evidence | PASS (build_20260607.log) |
| Delegate binding | PASS |
| Timestamp precision | PASS (millisecond) |
| Signal-to-noise | ACCEPTABLE |
