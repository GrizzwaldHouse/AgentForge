#!/usr/bin/env python3
# agentforge_control.py
# Developer: Marcus Daley
# Date: 2026-05-03
# Purpose: AgentForge multi-repo audit orchestrator with browser GUI control panel.
#          Double-click or run: python3 agentforge_control.py
#          Opens a browser GUI. No command line typing required.

import subprocess
import json
import os
import sys
import shutil
import threading
import time
import http.server
import socketserver
import webbrowser
import socket
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse, parse_qs
import urllib.request

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — edit this block only
# ─────────────────────────────────────────────────────────────────────────────

CONFIG = {
    # Where your repos live locally. Script will look for repos here.
    "repos_root": str(Path.home() / "Projects"),

    # All GrizzwaldHouse target repos
    "target_repos": [
        "AgentForge",           # NEW — create this repo first
        "cowork-skills",
        "BrightForge",
        "portfolio-website",
        "StructuredLogging",
        "Bob-AICompanion",
        "VetAssist",
        "grizz-optimizer",
    ],

    # Remote URLs for cloning if repos don't exist locally
    "remote_urls": {
        "cowork-skills":    "https://github.com/GrizzwaldHouse/cowork-skills.git",
        "BrightForge":      "https://github.com/GrizzwaldHouse/BrightForge.git",
        "portfolio-website":"https://github.com/GrizzwaldHouse/portfolio-website.git",
        "StructuredLogging":"https://github.com/GrizzwaldHouse/StructuredLogging.git",
        "Bob-AICompanion":  "https://github.com/GrizzwaldHouse/Bob-AICompanion.git",
        "VetAssist":        "https://github.com/GrizzwaldHouse/VetAssist.git",
        "grizz-optimizer":  "https://github.com/GrizzwaldHouse/grizz-optimizer.git",
    },

    # AgentForge biomechanical roles (PRD v2 mapping)
    "expected_roles": {
        "AgentForge":       "HEART + NERVOUS_SYSTEM + SKELETAL",
        "cowork-skills":    "BRAIN + SKELETAL",
        "BrightForge":      "MUSCLES + UI",
        "portfolio-website":"UI + SKIN",
        "StructuredLogging":"LYMPHATIC",
        "Bob-AICompanion":  "MUSCLES + NERVOUS_SYSTEM",
        "VetAssist":        "MUSCLES",
        "grizz-optimizer":  "ENDOCRINE + BRAIN",
    },

    # Max parallel Claude Code agents
    "max_parallel": 3,

    # Timeout per agent (seconds)
    "agent_timeout": 600,

    # GUI server port
    "gui_port": 8765,

    # Output directory for audit results
    "output_dir": str(Path.home() / "Projects" / ".agentforge_dashboard"),
}

# ─────────────────────────────────────────────────────────────────────────────
# GLOBAL STATE (thread-safe via lock)
# ─────────────────────────────────────────────────────────────────────────────

_state_lock = threading.Lock()
_state = {
    "status": "IDLE",          # IDLE | CLONING | SCANNING | COMPLETE | ERROR
    "repos": {},               # repo_name -> repo_state dict
    "log": [],                 # list of log line strings
    "started_at": None,
    "completed_at": None,
    "agentforge_gap_report": {},
}


def _log(message: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {message}"
    with _state_lock:
        _state["log"].append(line)
    print(line)


def _set_repo_state(repo_name: str, **kwargs):
    with _state_lock:
        if repo_name not in _state["repos"]:
            _state["repos"][repo_name] = {
                "name": repo_name,
                "status": "PENDING",
                "expected_role": CONFIG["expected_roles"].get(repo_name, "UNKNOWN"),
                "detected_role": None,
                "integration_status": None,
                "readiness": None,
                "compliance": {},
                "stats": {},
                "gaps": {},
                "error": None,
                "elapsed_seconds": 0,
                "functions_complete": 0,
                "functions_partial": 0,
                "functions_todo": 0,
                "functions_needs_test": 0,
                "open_todos": 0,
                "prd_violations": 0,
            }
        _state["repos"][repo_name].update(kwargs)


def _get_state_snapshot() -> dict:
    with _state_lock:
        return json.loads(json.dumps(_state))

# ─────────────────────────────────────────────────────────────────────────────
# REPO MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

def ensure_repo(repo_name: str, repos_root: Path) -> Path | None:
    """Return local path, cloning if needed. Returns None if unavailable."""
    local_path = repos_root / repo_name

    if local_path.exists() and (local_path / ".git").exists():
        _log(f"[{repo_name}] Found locally at {local_path}")
        return local_path

    if repo_name == "AgentForge":
        _log(f"[{repo_name}] NOTICE: AgentForge repo not found. "
             f"Create it at github.com/GrizzwaldHouse/AgentForge then re-run.")
        _set_repo_state(repo_name, status="MISSING",
                        error="Repo not created yet. Create on GitHub first.")
        return None

    remote = CONFIG["remote_urls"].get(repo_name)
    if not remote:
        _log(f"[{repo_name}] No remote URL configured and not found locally.")
        _set_repo_state(repo_name, status="MISSING",
                        error="Not found locally and no remote URL configured.")
        return None

    _log(f"[{repo_name}] Cloning from {remote}...")
    _set_repo_state(repo_name, status="CLONING")
    try:
        repos_root.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(
            ["git", "clone", remote, str(local_path)],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            _log(f"[{repo_name}] Clone successful.")
            return local_path
        else:
            _log(f"[{repo_name}] Clone failed: {result.stderr[:200]}")
            _set_repo_state(repo_name, status="ERROR",
                            error=f"Clone failed: {result.stderr[:200]}")
            return None
    except Exception as e:
        _log(f"[{repo_name}] Clone exception: {e}")
        _set_repo_state(repo_name, status="ERROR", error=str(e))
        return None

# ─────────────────────────────────────────────────────────────────────────────
# STATIC ANALYSIS (runs without Claude Code for instant results)
# ─────────────────────────────────────────────────────────────────────────────

def _grep(pattern: str, path: Path, include_exts: list[str]) -> list[str]:
    """Run grep and return matching lines."""
    args = ["grep", "-rn", pattern, str(path)]
    for ext in include_exts:
        args += ["--include", ext]
    args += ["--exclude-dir=.git", "--exclude-dir=node_modules",
             "--exclude-dir=__pycache__", "--exclude-dir=dist",
             "--exclude-dir=Binaries", "--exclude-dir=Intermediate"]
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=15)
        return [l for l in result.stdout.splitlines() if l.strip()]
    except Exception:
        return []


def static_analysis(repo_path: Path) -> dict:
    """Run fast static analysis without Claude Code."""
    source_exts = ["*.py", "*.ts", "*.tsx", "*.js", "*.cpp", "*.h", "*.cs"]

    # Count source files
    source_files = []
    for ext in ["*.py", "*.ts", "*.tsx", "*.cpp", "*.h", "*.cs"]:
        source_files += list(repo_path.rglob(ext))
    source_files = [
        f for f in source_files
        if not any(x in str(f) for x in
                   ["node_modules", ".git", "__pycache__", "dist", "Binaries", "Intermediate"])
    ]

    # Polling detection (PRD violation)
    polling_hits = _grep(
        r"setInterval\|while True\|time\.sleep\|\.poll(\|polling",
        repo_path, source_exts
    )

    # Hardcoded values (PRD violation)
    hardcoded_hits = _grep(
        r'= "http[s]\?://\|= "localhost:\|= [0-9][0-9][0-9][0-9]\b\|= "http',
        repo_path, source_exts
    )

    # Observer/event patterns
    observer_hits = _grep(
        r"EventEmitter\|event_bus\|owl_watcher\|\.on(\|\.emit(\|subscribe\|publish",
        repo_path, source_exts
    )

    # Config files
    config_files = (
        list(repo_path.rglob("*.config.json")) +
        list(repo_path.rglob(".env.example")) +
        [repo_path / "config.py", repo_path / "settings.py"]
    )
    config_files = [f for f in config_files if f.exists()]

    # VRAM watchdog
    vram_hits = _grep(
        r"nvidia-smi\|VramWatchdog\|memory\.free\|cuda\.mem",
        repo_path, source_exts
    )

    # EM dashes (AI generation signal)
    em_dash_hits = _grep(r" — \| – ", repo_path, ["*.py", "*.ts", "*.md", "*.cs"])

    # TODOs
    todo_hits = _grep(
        r"TODO\|FIXME\|HACK\|PLACEHOLDER\|NOT IMPLEMENTED",
        repo_path, source_exts
    )

    # Test files
    test_files = (
        list(repo_path.rglob("test_*.py")) +
        list(repo_path.rglob("*_test.py")) +
        list(repo_path.rglob("*.test.ts")) +
        list(repo_path.rglob("*.spec.ts")) +
        list(repo_path.rglob("*Test.cs"))
    )

    # Functions (rough count via grep)
    func_lines = (
        _grep(r"^def \|^    def \|^class ", repo_path, ["*.py"]) +
        _grep(r"^export \|^function \|^const .* = .*=>\|^class ", repo_path, ["*.ts", "*.tsx"]) +
        _grep(r"public \|private \|protected ", repo_path, ["*.cs"])
    )

    # Detect stack
    stack = []
    if list(repo_path.rglob("*.py")): stack.append("Python")
    if list(repo_path.rglob("*.ts")) or list(repo_path.rglob("*.tsx")): stack.append("TypeScript/React")
    if list(repo_path.rglob("*.cpp")) or list(repo_path.rglob("*.h")): stack.append("C++")
    if list(repo_path.rglob("*.cs")): stack.append("C#")
    if (repo_path / "package.json").exists(): stack.append("Node")
    if list(repo_path.rglob("*.uproject")): stack.append("Unreal Engine 5")

    # Detect AgentForge components already present
    has_event_bus = bool(observer_hits)
    has_config = bool(config_files)
    has_tests = bool(test_files)
    has_vram = bool(vram_hits)

    prd_violations = len(polling_hits) + len(hardcoded_hits) + len(em_dash_hits)

    # Readiness determination
    if prd_violations == 0 and has_event_bus and has_config and has_tests:
        readiness = "READY"
    elif has_event_bus or has_config:
        readiness = "PARTIAL"
    else:
        readiness = "NOT_READY"

    return {
        "files_scanned": len(source_files),
        "functions_found": len(func_lines),
        "stack": stack,
        "open_todos": len(todo_hits),
        "test_files": len(test_files),
        "prd_violations": prd_violations,
        "readiness": readiness,
        "compliance": {
            "no_polling_loops": len(polling_hits) == 0,
            "polling_violations": polling_hits[:5],
            "no_hardcoded_values": len(hardcoded_hits) == 0,
            "hardcoded_count": len(hardcoded_hits),
            "config_file_present": has_config,
            "config_files": [str(f.relative_to(repo_path)) for f in config_files[:3]],
            "observer_pattern_used": has_event_bus,
            "observer_evidence": observer_hits[:3],
            "vram_watchdog_present": has_vram,
            "no_em_dashes": len(em_dash_hits) == 0,
            "em_dash_count": len(em_dash_hits),
            "env_example_present": (repo_path / ".env.example").exists(),
        },
        "gaps": _detect_gaps(repo_path, polling_hits, hardcoded_hits,
                             has_event_bus, has_config, has_tests),
        "todos_sample": [t.split(":")[-1].strip() for t in todo_hits[:8]],
    }


def _detect_gaps(repo_path: Path, polling_hits: list, hardcoded_hits: list,
                 has_event_bus: bool, has_config: bool, has_tests: bool) -> dict:
    """Generate AgentForge gap report for this repo."""
    missing_components = []
    refactors_required = []
    config_files_needed = []
    event_contracts_needed = []
    prd_violations_list = []

    if not has_event_bus:
        missing_components.append({
            "component": "OwlWatcher integration",
            "layer": "NERVOUS_SYSTEM",
            "reason": "No event bus or observer pattern detected. Required by PRD v2."
        })
        event_contracts_needed.append({
            "event": "REPO_SPECIFIC_EVENT",
            "reason": "Need to define what events this repo emits/consumes"
        })

    if not has_config:
        missing_components.append({
            "component": "Config module",
            "layer": "ENDOCRINE",
            "reason": "No config file detected. All values must be config-driven per PRD v2."
        })
        config_files_needed.append({
            "filename": "config.json or config.py",
            "purpose": "All tunable values, API endpoints, model names, thresholds"
        })

    if not (repo_path / ".env.example").exists():
        config_files_needed.append({
            "filename": ".env.example",
            "purpose": "Secrets template. Required per PRD v2 secrets management rule."
        })

    if not has_tests:
        missing_components.append({
            "component": "Test suite",
            "layer": "LYMPHATIC",
            "reason": "No test files found. PRD v2 requires tests before SUPERVISOR-APPROVED."
        })

    for hit in polling_hits[:5]:
        prd_violations_list.append({
            "type": "POLLING_LOOP",
            "location": hit.split(":")[0] if ":" in hit else hit,
            "fix": "Replace with event listener on OwlWatcher event bus"
        })

    for hit in hardcoded_hits[:5]:
        prd_violations_list.append({
            "type": "HARDCODED_VALUE",
            "location": hit.split(":")[0] if ":" in hit else hit,
            "fix": "Move to config file or .env"
        })

    # Check for SESSION_HANDOFF.md and CLAUDE.md (required by Marcus standards)
    if not (repo_path / "SESSION_HANDOFF.md").exists():
        missing_components.append({
            "component": "SESSION_HANDOFF.md",
            "layer": "LYMPHATIC",
            "reason": "Required by Marcus Check-In Protocol for session continuity"
        })

    if not (repo_path / "CLAUDE.md").exists():
        missing_components.append({
            "component": "CLAUDE.md",
            "layer": "SKELETAL",
            "reason": "Required: coding standards, rules, agent behavior for this repo"
        })

    return {
        "missing_components": missing_components,
        "refactors_required": refactors_required,
        "config_files_needed": config_files_needed,
        "event_contracts_needed": event_contracts_needed,
        "prd_violations": prd_violations_list,
    }

# ─────────────────────────────────────────────────────────────────────────────
# CLAUDE CODE AGENT RUNNER
# ─────────────────────────────────────────────────────────────────────────────

def run_claude_agent(repo_path: Path) -> dict:
    """Deploy REPO_AUDIT_AGENT.md and fire Claude Code. Falls back to static analysis."""
    repo_name = repo_path.name
    start = time.time()

    # Deploy the prompt file
    prompt_src = Path(__file__).parent / "REPO_AUDIT_AGENT.md"
    prompt_dst = repo_path / "REPO_AUDIT_AGENT.md"
    if prompt_src.exists():
        shutil.copy2(prompt_src, prompt_dst)

    prompt_content = prompt_dst.read_text() if prompt_dst.exists() else ""

    _log(f"[{repo_name}] Running static analysis...")
    static = static_analysis(repo_path)

    # Try Claude Code if available
    claude_available = shutil.which("claude") is not None
    claude_output = ""

    if claude_available and prompt_content:
        _log(f"[{repo_name}] Claude Code found — running deep audit...")
        try:
            result = subprocess.run(
                ["claude", "--print", prompt_content],
                cwd=str(repo_path),
                capture_output=True, text=True,
                timeout=CONFIG["agent_timeout"]
            )
            claude_output = result.stdout
            _log(f"[{repo_name}] Claude Code audit complete.")
        except subprocess.TimeoutExpired:
            _log(f"[{repo_name}] Claude Code timed out — using static analysis only.")
        except Exception as e:
            _log(f"[{repo_name}] Claude Code error: {e} — using static analysis only.")
    else:
        _log(f"[{repo_name}] Static analysis mode (Claude Code not in PATH).")

    elapsed = round(time.time() - start, 1)

    # Write .agentforge/audit_result.json
    audit_dir = repo_path / ".agentforge"
    audit_dir.mkdir(exist_ok=True)
    audit_result = {
        "repo": repo_name,
        "auditTimestamp": datetime.now(timezone.utc).isoformat(),
        "agentforgeRole": CONFIG["expected_roles"].get(repo_name, "UNKNOWN"),
        "integrationStatus": "PARTIAL" if static["compliance"]["observer_pattern_used"] else "STANDALONE",
        "readiness": static["readiness"],
        "compliance": static["compliance"],
        "stats": {
            "filesScanned": static["files_scanned"],
            "functionsFound": static["functions_found"],
            "openTodos": static["open_todos"],
            "testFiles": static["test_files"],
            "prdViolations": static["prd_violations"],
            "stack": static["stack"],
        },
        "gaps": static["gaps"],
        "claudeCodeUsed": claude_available and bool(claude_output),
        "elapsedSeconds": elapsed,
    }
    (audit_dir / "audit_result.json").write_text(json.dumps(audit_result, indent=2))

    # Write STATUS.md
    _write_status_md(repo_path, audit_result, static)

    # Commit and push
    _commit_and_push(repo_path, repo_name)

    return {"repo": repo_name, "status": "SUCCESS", "result": audit_result, "elapsed": elapsed}


def _write_status_md(repo_path: Path, audit: dict, static: dict):
    """Write human-readable STATUS.md."""
    lines = [
        "# STATUS.md — AgentForge Repo Audit",
        "<!-- Auto-generated by GrizzwaldHouse AgentForge Audit System -->",
        "<!-- PRD v2 Reference: biomechanical architecture model -->",
        "<!-- Do NOT edit manually — overwritten on each audit run -->",
        "",
        f"**Repo:** {audit['repo']}",
        f"**Last Audit:** {audit['auditTimestamp']}",
        f"**AgentForge Role:** {audit['agentforgeRole']}",
        f"**Integration Status:** {audit['integrationStatus']}",
        f"**AgentForge Readiness:** {audit['readiness']}",
        f"**Stack:** {', '.join(static.get('stack', []))}",
        "",
        "---",
        "",
        "## AGENTFORGE COMPLIANCE SCORECARD",
        "",
        "| Check | Result |",
        "|---|---|",
        f"| No polling loops | {'PASS' if audit['compliance']['no_polling_loops'] else 'FAIL'} |",
        f"| No hardcoded values | {'PASS' if audit['compliance']['no_hardcoded_values'] else f\"FAIL ({audit['compliance']['hardcoded_count']} found)\"} |",
        f"| Config file present | {'PASS' if audit['compliance']['config_file_present'] else 'FAIL'} |",
        f"| Observer/event pattern | {'PASS' if audit['compliance']['observer_pattern_used'] else 'FAIL'} |",
        f"| VRAM watchdog | {'PASS' if audit['compliance']['vram_watchdog_present'] else 'N/A'} |",
        f"| No EM dashes | {'PASS' if audit['compliance']['no_em_dashes'] else f\"FAIL ({audit['compliance']['em_dash_count']} found)\"} |",
        f"| .env.example present | {'PASS' if audit['compliance']['env_example_present'] else 'FAIL'} |",
        "",
        "## OPEN TODOs",
        f"Found {static['open_todos']} open TODO/FIXME items.",
        "",
    ]

    if static.get("todos_sample"):
        for t in static["todos_sample"]:
            lines.append(f"- {t}")
        lines.append("")

    # Gaps section
    gaps = static.get("gaps", {})
    lines += ["## AGENTFORGE GAP REPORT", ""]

    missing = gaps.get("missing_components", [])
    if missing:
        lines.append("### Missing Components (must build)")
        for m in missing:
            lines.append(f"- [ ] **{m['component']}** [{m['layer']}] — {m['reason']}")
        lines.append("")

    prd_v = gaps.get("prd_violations", [])
    if prd_v:
        lines.append("### PRD Violations")
        for v in prd_v:
            lines.append(f"- [ ] **{v['type']}** in `{v['location']}` — Fix: {v['fix']}")
        lines.append("")

    config_needed = gaps.get("config_files_needed", [])
    if config_needed:
        lines.append("### Config Files Needed")
        for c in config_needed:
            lines.append(f"- [ ] `{c['filename']}` — {c['purpose']}")
        lines.append("")

    events_needed = gaps.get("event_contracts_needed", [])
    if events_needed:
        lines.append("### Event Contracts Needed")
        for e in events_needed:
            lines.append(f"- [ ] `{e['event']}` — {e['reason']}")
        lines.append("")

    (repo_path / "STATUS.md").write_text("\n".join(lines))


def _commit_and_push(repo_path: Path, repo_name: str):
    """Commit STATUS.md and audit_result.json."""
    try:
        subprocess.run(["git", "add", "STATUS.md", ".agentforge/audit_result.json",
                        "REPO_AUDIT_AGENT.md"],
                       cwd=str(repo_path), capture_output=True, timeout=30)
        result = subprocess.run(
            ["git", "commit", "-m",
             f"audit: AgentForge integration audit {datetime.now(timezone.utc).strftime('%Y-%m-%d')}\n\n[skip ci]"],
            cwd=str(repo_path), capture_output=True, text=True, timeout=30
        )
        if "nothing to commit" in result.stdout:
            _log(f"[{repo_name}] No changes to commit (already up to date).")
            return
        push = subprocess.run(
            ["git", "push", "origin", "HEAD"],
            cwd=str(repo_path), capture_output=True, text=True, timeout=60
        )
        if push.returncode == 0:
            _log(f"[{repo_name}] Pushed to remote.")
        else:
            # Try pull-rebase then push
            subprocess.run(["git", "pull", "--rebase", "origin", "HEAD"],
                           cwd=str(repo_path), capture_output=True, timeout=60)
            subprocess.run(["git", "push", "origin", "HEAD"],
                           cwd=str(repo_path), capture_output=True, timeout=60)
            _log(f"[{repo_name}] Push complete (after rebase).")
    except Exception as e:
        _log(f"[{repo_name}] Commit/push error: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# ORCHESTRATOR
# ─────────────────────────────────────────────────────────────────────────────

def run_full_audit():
    """Main orchestration function. Runs in background thread."""
    global _state
    repos_root = Path(CONFIG["repos_root"])
    output_dir = Path(CONFIG["output_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)

    with _state_lock:
        _state["status"] = "CLONING"
        _state["started_at"] = datetime.now(timezone.utc).isoformat()

    _log("=== AgentForge Audit Started ===")
    _log(f"Repos root: {repos_root}")
    _log(f"Target repos: {', '.join(CONFIG['target_repos'])}")

    # Initialize all repo states
    for name in CONFIG["target_repos"]:
        _set_repo_state(name)

    # Ensure repos exist (clone if needed)
    valid_paths = []
    for repo_name in CONFIG["target_repos"]:
        _set_repo_state(repo_name, status="CHECKING")
        path = ensure_repo(repo_name, repos_root)
        if path:
            valid_paths.append(path)
            _set_repo_state(repo_name, status="QUEUED")
        # Missing state already set inside ensure_repo

    with _state_lock:
        _state["status"] = "SCANNING"

    _log(f"Scanning {len(valid_paths)} repos with {CONFIG['max_parallel']} parallel agents...")

    # Run agents in parallel
    def _run_one(repo_path: Path):
        name = repo_path.name
        _set_repo_state(name, status="SCANNING")
        try:
            result = run_claude_agent(repo_path)
            audit = result["result"]
            _set_repo_state(name,
                status="COMPLETE",
                detected_role=audit.get("agentforgeRole"),
                integration_status=audit.get("integrationStatus"),
                readiness=audit.get("readiness"),
                compliance=audit.get("compliance", {}),
                stats=audit.get("stats", {}),
                gaps=audit.get("gaps", {}),
                elapsed_seconds=result["elapsed"],
                prd_violations=audit.get("stats", {}).get("prdViolations", 0),
                open_todos=audit.get("stats", {}).get("openTodos", 0),
            )
        except Exception as e:
            _log(f"[{name}] EXCEPTION: {e}")
            _set_repo_state(name, status="ERROR", error=str(e))

    with ThreadPoolExecutor(max_workers=CONFIG["max_parallel"]) as executor:
        futures = {executor.submit(_run_one, p): p for p in valid_paths}
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                _log(f"Executor exception: {e}")

    # Build AgentForge gap summary
    _build_agentforge_gap_summary(output_dir)

    with _state_lock:
        _state["status"] = "COMPLETE"
        _state["completed_at"] = datetime.now(timezone.utc).isoformat()

    _log("=== AgentForge Audit Complete ===")


def _build_agentforge_gap_summary(output_dir: Path):
    """Synthesize all repo gaps into an AgentForge build plan."""
    snapshot = _get_state_snapshot()
    repos = snapshot["repos"]

    all_missing = []
    all_violations = []
    all_refactors = []

    for repo_name, repo_state in repos.items():
        gaps = repo_state.get("gaps", {})
        for m in gaps.get("missing_components", []):
            all_missing.append({"repo": repo_name, **m})
        for v in gaps.get("prd_violations", []):
            all_violations.append({"repo": repo_name, **v})
        for r in gaps.get("refactors_required", []):
            all_refactors.append({"repo": repo_name, **r})

    # AgentForge monorepo readiness
    layers_covered = set()
    layers_missing = set([
        "HEART", "NERVOUS_SYSTEM", "BRAIN", "MUSCLES",
        "SKIN", "ENDOCRINE", "SKELETAL", "LYMPHATIC", "UI"
    ])

    for repo_name, repo_state in repos.items():
        role = repo_state.get("expected_role", "")
        for layer in layers_missing.copy():
            if layer in role:
                layers_covered.add(layer)
                layers_missing.discard(layer)

    gap_summary = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "monorepo_layers_covered": list(layers_covered),
        "monorepo_layers_missing": list(layers_missing),
        "total_prd_violations": sum(
            r.get("prd_violations", 0) for r in repos.values()
        ),
        "total_missing_components": len(all_missing),
        "repos_ready": [n for n, r in repos.items() if r.get("readiness") == "READY"],
        "repos_partial": [n for n, r in repos.items() if r.get("readiness") == "PARTIAL"],
        "repos_not_ready": [n for n, r in repos.items() if r.get("readiness") == "NOT_READY"],
        "repos_missing": [n for n, r in repos.items() if r.get("status") == "MISSING"],
        "all_missing_components": all_missing,
        "all_prd_violations": all_violations,
        "all_refactors": all_refactors,
        "agentforge_mvs_buildable": len(layers_missing) == 0,
        "build_priority": _compute_build_priority(repos, all_missing, layers_missing),
    }

    with _state_lock:
        _state["agentforge_gap_report"] = gap_summary

    (output_dir / "agentforge_gap_summary.json").write_text(
        json.dumps(gap_summary, indent=2)
    )
    _log(f"AgentForge gap summary written to {output_dir}/agentforge_gap_summary.json")


def _compute_build_priority(repos: dict, missing: list, layers_missing: set) -> list:
    """Generate an ordered build plan for AgentForge MVS."""
    priority = []

    # Layer 1: Always need SKELETAL (contracts) first
    if "SKELETAL" in layers_missing:
        priority.append({
            "priority": 1,
            "task": "Define AgentForge event contracts (SKELETAL layer)",
            "layer": "SKELETAL",
            "why": "All other layers depend on shared event types and interfaces"
        })

    # Layer 2: NERVOUS_SYSTEM (event bus)
    if "NERVOUS_SYSTEM" in layers_missing:
        priority.append({
            "priority": 2,
            "task": "Build OwlWatcher event bus (NERVOUS_SYSTEM layer)",
            "layer": "NERVOUS_SYSTEM",
            "why": "All agents communicate through this. Required before any agent can run."
        })

    # Layer 3: ENDOCRINE (config)
    if "ENDOCRINE" in layers_missing:
        priority.append({
            "priority": 3,
            "task": "Create config module (ENDOCRINE layer)",
            "layer": "ENDOCRINE",
            "why": "No hardcoded values. All settings must load from config."
        })

    # Layer 4: HEART (orchestrator)
    if "HEART" in layers_missing:
        priority.append({
            "priority": 4,
            "task": "Build AgenticOS state machine (HEART layer)",
            "layer": "HEART",
            "why": "Orchestrates all agents. Required for MVS pipeline to run."
        })

    # Layer 5: MUSCLES (execution)
    if "MUSCLES" in layers_missing:
        priority.append({
            "priority": 5,
            "task": "Implement execution layer - A1-A5 agents (MUSCLES layer)",
            "layer": "MUSCLES",
            "why": "This IS the MVS. A1-A5 = Find Money pipeline."
        })

    return priority

# ─────────────────────────────────────────────────────────────────────────────
# HTTP SERVER (serves the GUI)
# ─────────────────────────────────────────────────────────────────────────────

class AgentForgeHandler(http.server.BaseHTTPRequestHandler):
    """Simple HTTP server that serves the GUI and handles API calls."""

    def log_message(self, format, *args):
        pass  # Suppress server logs

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self._serve_html()
        elif self.path == "/api/state":
            self._serve_json(_get_state_snapshot())
        elif self.path == "/api/config":
            self._serve_json(CONFIG)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/run":
            # Start audit in background thread
            t = threading.Thread(target=run_full_audit, daemon=True)
            t.start()
            self._serve_json({"started": True})
        else:
            self.send_response(404)
            self.end_headers()

    def _serve_json(self, data: dict):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _serve_html(self):
        html_path = Path(__file__).parent / "gui" / "index.html"
        if html_path.exists():
            body = html_path.read_bytes()
        else:
            body = FALLBACK_HTML.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)


FALLBACK_HTML = """<!DOCTYPE html>
<html><head><title>AgentForge</title></head>
<body style="background:#0a0e14;color:#7ecfff;font-family:monospace;padding:40px">
<h1>AgentForge Control Panel</h1>
<p>GUI file not found. Run: python3 agentforge_control.py</p>
<p><a href="/api/state" style="color:#6bcb77">View raw state JSON</a></p>
</body></html>"""


def find_free_port(preferred: int) -> int:
    """Return preferred port if free, otherwise find a free one."""
    for port in [preferred, preferred + 1, preferred + 2, 9000, 9001]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("localhost", port)) != 0:
                return port
    return preferred


def start_server(port: int):
    """Start the HTTP server."""
    with socketserver.TCPServer(("", port), AgentForgeHandler) as httpd:
        httpd.serve_forever()


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def main():
    port = find_free_port(CONFIG["gui_port"])
    url = f"http://localhost:{port}"

    print("=" * 60)
    print("  AGENTFORGE CONTROL PANEL")
    print("  GrizzwaldHouse Multi-Repo Audit Orchestrator")
    print("=" * 60)
    print(f"  Starting GUI server at {url}")
    print(f"  Opening browser automatically...")
    print(f"  Press Ctrl+C to stop.")
    print("=" * 60)

    # Start HTTP server in daemon thread
    server_thread = threading.Thread(
        target=start_server, args=(port,), daemon=True
    )
    server_thread.start()
    time.sleep(0.5)

    # Open browser
    webbrowser.open(url)

    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nAgentForge Control Panel stopped.")


if __name__ == "__main__":
    main()
