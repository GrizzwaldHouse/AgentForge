#!/usr/bin/env python3
"""
AgentForge Baseline Analysis Pipeline
Produces 14 output files in AgentForge_Baseline/
"""

import os
import sys
import json
import re
import hashlib
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT        = Path(r"C:\Users\daley\Projects\SeniorDevBuddy")
SOURCE_A    = ROOT / "AgentForge"
SOURCE_B    = ROOT / "agentforge_autonomous" / "src"
OUTPUT_DIR  = ROOT / "AgentForge_Baseline"
OUTPUT_DIR.mkdir(exist_ok=True)

SKIP_DIRS   = {"node_modules", ".git", "graphify-out", "__pycache__", ".next"}
BINARY_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff",
               ".woff2", ".ttf", ".eot", ".pdf", ".zip", ".db", ".sqlite"}

def log(msg):
    print(f"  {msg}", flush=True)

def write_json(name, data):
    path = OUTPUT_DIR / name
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    log(f"  -> wrote {name}")
    return path

def write_md(name, content):
    path = OUTPUT_DIR / name
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    log(f"  -> wrote {name}")
    return path

def safe_read(path, max_bytes=200_000):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read(max_bytes)
    except Exception:
        return ""

def scan_dir(base: Path, origin: str):
    """Yield dicts for every non-binary file under base."""
    entries = []
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            fpath = Path(root) / fname
            ext = fpath.suffix.lower()
            if ext in BINARY_EXTS:
                continue
            try:
                size = fpath.stat().st_size
            except Exception:
                size = 0
            # type classification
            if ext in {".ts", ".tsx", ".js", ".jsx"}:
                ftype = "code"
            elif ext == ".md":
                ftype = "doc"
            elif ext == ".json":
                ftype = "config"
            elif ext in {".yaml", ".yml"}:
                ftype = "config"
            elif ext in {".graphql", ".gql", ".prisma"}:
                ftype = "schema"
            else:
                ftype = "doc" if ext in {".txt", ".rst"} else "other"

            entries.append({
                "path": str(fpath),
                "size_bytes": size,
                "extension": ext,
                "type": ftype,
                "origin": origin,
            })
    return entries

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 1: INDEX_ALL_FILES ===")
all_files = []
all_files += scan_dir(SOURCE_A, "AgentForge_zip")
all_files += scan_dir(SOURCE_B, "agentforge_autonomous")
write_json("file_index.json", all_files)
log(f"Total files indexed: {len(all_files)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 2: CLASSIFY_ARTIFACTS ===")
def classify(entry):
    p = entry["path"]
    name = Path(p).name.upper()
    ext  = entry["extension"]
    cat  = "UNKNOWN"
    if ext in {".ts", ".tsx", ".js", ".jsx"}:
        cat = "CODE"
    elif ext == ".md":
        if any(k in name for k in ("PRD",)):
            cat = "PRD"
        elif any(k in name for k in ("ARCH", "SEQUENCE", "ARCHITECTURE")):
            cat = "ARCHITECTURE"
        elif any(k in name for k in ("CLAUDE_", "_PROMPT", "PROMPT_", "SYSTEM_PROMPT")):
            cat = "PROMPT"
        elif "CHAT" in name or "LOG" in name:
            cat = "CHAT_LOG"
        else:
            cat = "ARCHITECTURE"
    elif ext == ".json":
        content = safe_read(p, 2000)
        cat = "SCHEMA" if ('"$schema"' in content or '"type"' in content and '"properties"' in content) else "CONFIG"
    elif ext in {".yaml", ".yml"}:
        cat = "CONFIG"
    elif any(k in name for k in ("CLAUDE_", "_PROMPT", "PROMPT_")):
        cat = "PROMPT"
    entry["category"] = cat
    return entry

classified = [classify(dict(e)) for e in all_files]
write_json("classification.json", classified)

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 3: DETECT_ENTRY_POINTS ===")
entry_points = []
patterns = [
    (r"src[/\\]app[/\\]api", "api_route"),
    (r"src[/\\]orchestrator", "orchestrator"),
    (r"src[/\\]backend[/\\]services", "service"),
    (r"AgentForge[/\\]runtime", "runtime"),
    (r"src[/\\]agents[/\\][^/\\]+[/\\][^/\\]+\.ts$", "agent"),
]
for entry in all_files:
    p = entry["path"]
    if not p.endswith((".ts", ".tsx")):
        continue
    for pat, etype in patterns:
        if re.search(pat, p.replace("\\", "/")):
            name = Path(p).name
            desc = f"{etype}: {name}"
            if "Orchestrat" in name:
                etype = "orchestrator"
            elif "route" in name.lower():
                etype = "api_route"
            entry_points.append({"path": p, "type": etype, "description": desc})
            break
write_json("entry_points.json", entry_points)
log(f"Entry points found: {len(entry_points)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 4: EXTRACT_SYSTEM_COMPONENTS ===")
ORGAN_HINTS = {
    "orchestrat": "Heart",
    "event": "Nervous_System",
    "bus": "Nervous_System",
    "knowledge": "Brain",
    "graph": "Brain",
    "playwright": "Muscles",
    "n8n": "Muscles",
    "execut": "Muscles",
    "valid": "Skin",
    "auth": "Skin",
    "safety": "Skin",
    "config": "Endocrine",
    "env": "Endocrine",
    "contract": "Skeletal",
    "interface": "Skeletal",
    "type": "Skeletal",
    "log": "Lymphatic",
    "observ": "Lymphatic",
    "metric": "Lymphatic",
    "heal": "Lymphatic",
    "monitor": "Lymphatic",
}

def guess_organ(path_str, name):
    lower = (path_str + name).lower()
    for kw, organ in ORGAN_HINTS.items():
        if kw in lower:
            return organ
    return "Unmapped"

components = []
comp_dirs = [
    (SOURCE_B / "agents",          "agent"),
    (SOURCE_B / "backend" / "services", "service"),
    (SOURCE_B / "safety",          "service"),
    (SOURCE_B / "healing",         "service"),
    (SOURCE_B / "orchestrator",    "orchestrator"),
    (SOURCE_B / "routing",         "service"),
    (SOURCE_B / "job-system",      "service"),
    (SOURCE_B / "core",            "contract"),
    (SOURCE_A / "runtime",         "runtime"),
    (SOURCE_A / "contracts",       "contract"),
]
for base, cat in comp_dirs:
    if not base.exists():
        continue
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not f.endswith((".ts", ".tsx")):
                continue
            fpath = Path(root) / f
            components.append({
                "name": f,
                "path": str(fpath),
                "category": cat,
                "organ_hint": guess_organ(str(fpath), f),
            })
write_json("system_components.json", components)
log(f"Components found: {len(components)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 5: EVENT_FLOW_DETECTION ===")
EVENT_PATTERNS = [
    (r'eventBus\.publish\s*\(\s*["\']([^"\']+)["\']', "publish"),
    (r'bus\.emit\s*\(\s*["\']([^"\']+)["\']',         "emit"),
    (r'\.subscribe\s*\(\s*["\']([^"\']+)["\']',       "subscribe"),
    (r'EventEmitter',                                   "emitter"),
    (r'ReadableStream',                                 "SSE"),
    (r'new\s+EventSource',                              "SSE"),
    (r'res\.write\s*\(',                                "SSE"),
    (r'setInterval|setTimeout',                         "polling"),
]
flows = []
for entry in all_files:
    if entry["extension"] not in {".ts", ".tsx", ".js", ".jsx"}:
        continue
    content = safe_read(entry["path"])
    if not content:
        continue
    for pat, flow_type in EVENT_PATTERNS:
        for m in re.finditer(pat, content):
            event_name = m.group(1) if m.lastindex and m.lastindex >= 1 else flow_type
            transport = "SSE" if flow_type == "SSE" else ("in-memory" if flow_type in ("publish","emit","subscribe","emitter") else "polling")
            flows.append({
                "event_name_or_type": event_name,
                "producer_file": entry["path"],
                "consumer_file": "UNKNOWN",
                "transport": transport,
                "status": "DETECTED",
                "flow_type": flow_type,
            })
write_json("event_flows.json", flows)
log(f"Event flows detected: {len(flows)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 6: DEPENDENCY_GRAPH ===")
nodes = []
edges = []
node_ids = {}

ts_files = [e for e in all_files if e["origin"] == "agentforge_autonomous" and e["extension"] in {".ts",".tsx"}]
for entry in ts_files:
    p = entry["path"]
    if p not in node_ids:
        node_ids[p] = len(nodes)
        nodes.append({"id": node_ids[p], "path": p})

for entry in ts_files:
    content = safe_read(entry["path"])
    for m in re.finditer(r'(?:import|from)\s+["\']([^"\']+)["\']', content):
        imp = m.group(1)
        # resolve relative imports
        if imp.startswith("."):
            base = Path(entry["path"]).parent
            resolved = str((base / imp).resolve())
            # try .ts extension
            for ext in [".ts", ".tsx", ""]:
                candidate = resolved + ext
                if candidate in node_ids:
                    edges.append({"from": entry["path"], "to": candidate, "import_path": imp})
                    break
            else:
                edges.append({"from": entry["path"], "to": resolved, "import_path": imp})
        else:
            edges.append({"from": entry["path"], "to": imp, "import_path": imp})

dep_graph = {"nodes": nodes, "edges": edges}
write_json("dependency_graph.json", dep_graph)
log(f"Nodes: {len(nodes)}, Edges: {len(edges)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 7: DUPLICATION_ANALYSIS ===")
# Group by filename
by_name = defaultdict(list)
for entry in all_files:
    by_name[Path(entry["path"]).name.upper()].append(entry["path"])

# Find PRD variants
prd_variants = [e for e in all_files if "PRD" in Path(e["path"]).name.upper()]

duplicates = []
for name, paths in by_name.items():
    if len(paths) > 1:
        duplicates.append({
            "canonical": paths[0],
            "duplicates": paths[1:],
            "recommendation": "Review and consolidate — keep the most recent version",
        })

# PRD version duplicates
prd_names = [Path(e["path"]).name for e in prd_variants]
if prd_names:
    duplicates.append({
        "canonical": "See PRD version list",
        "duplicates": [e["path"] for e in prd_variants],
        "recommendation": "Multiple PRD versions detected — establish single source of truth",
        "note": "PRD variants found",
    })

dup_report = {"duplicates": duplicates, "total_duplicate_groups": len(duplicates)}
write_json("duplication_report.json", dup_report)
log(f"Duplicate groups: {len(duplicates)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 8: CONFIG_EXTRACTION ===")
hardcoded = []
env_driven = []
config_files_found = []

config_candidates = [e for e in all_files if e["extension"] in {".json", ".ts", ".tsx", ".js"} and
                     any(k in Path(e["path"]).name.lower() for k in ["config", "env", "constant", "next.config"])]

for entry in config_candidates:
    content = safe_read(entry["path"])
    config_files_found.append(entry["path"])
    # find process.env references
    for m in re.finditer(r'process\.env\.(\w+)', content):
        env_driven.append({"var": m.group(1), "file": entry["path"]})
    # find string literals that look like secrets/URLs (naive)
    for m in re.finditer(r'(?:url|key|secret|token|host|port)\s*[=:]\s*["\']([^"\']{4,})["\']', content, re.IGNORECASE):
        val = m.group(1)
        if not val.startswith("${") and "process.env" not in val:
            hardcoded.append({"value_preview": val[:40], "file": entry["path"]})

config_analysis = {
    "hardcoded_values": hardcoded[:50],
    "env_driven": env_driven[:100],
    "config_files": config_files_found,
}
write_json("config_analysis.json", config_analysis)
log(f"Config files: {len(config_files_found)}, Hardcoded: {len(hardcoded)}, Env-driven: {len(env_driven)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 9: SCHEMA_AND_CONTRACT_DISCOVERY ===")
interfaces = []
event_types_found = []
schemas_found = []

ts_all = [e for e in all_files if e["extension"] in {".ts", ".tsx"}]
for entry in ts_all:
    content = safe_read(entry["path"])
    # Find interface declarations
    for m in re.finditer(r'(?:export\s+)?interface\s+(\w+)\s*(?:extends\s+[\w,\s]+)?\{([^}]{0,500})', content, re.DOTALL):
        iname = m.group(1)
        body  = m.group(2)
        fields = re.findall(r'(\w+)\s*[?!]?\s*:', body)
        interfaces.append({"name": iname, "file": entry["path"], "fields": fields[:20]})
    # Find type aliases
    for m in re.finditer(r'(?:export\s+)?type\s+(\w+)\s*=', content):
        event_types_found.append({"name": m.group(1), "file": entry["path"]})

# JSON schemas
for entry in all_files:
    if entry["extension"] == ".json":
        content = safe_read(entry["path"], 500)
        if '"$schema"' in content or ('"type"' in content and '"properties"' in content):
            schemas_found.append({"file": entry["path"], "type": "json-schema"})

contracts = {
    "interfaces": interfaces,
    "event_types": event_types_found,
    "schemas": schemas_found,
}
write_json("contracts.json", contracts)
log(f"Interfaces: {len(interfaces)}, Types: {len(event_types_found)}, Schemas: {len(schemas_found)}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 10: ARCHITECTURE_PATTERN_DETECTION ===")
patterns_found = []
violations = []

all_content_map = {}
for entry in all_files:
    if entry["extension"] in {".ts", ".tsx", ".js", ".jsx"}:
        all_content_map[entry["path"]] = safe_read(entry["path"])

# Event-driven
pub_count = sum(1 for c in all_content_map.values() if "eventBus" in c or "bus.emit" in c or "bus.publish" in c)
if pub_count > 0:
    patterns_found.append({"pattern": "event-driven", "evidence_file_count": pub_count, "confidence": "MEDIUM"})

# Polling
poll_count = sum(1 for c in all_content_map.values() if "setInterval" in c or "setTimeout" in c)
if poll_count > 0:
    patterns_found.append({"pattern": "polling", "evidence_file_count": poll_count, "confidence": "HIGH"})

# REST
rest_count = sum(1 for p in all_content_map if "route.ts" in p or "route.tsx" in p)
if rest_count > 0:
    patterns_found.append({"pattern": "REST-api", "evidence_file_count": rest_count, "confidence": "HIGH"})

# SSE
sse_count = sum(1 for c in all_content_map.values() if "ReadableStream" in c or "text/event-stream" in c)
if sse_count > 0:
    patterns_found.append({"pattern": "SSE", "evidence_file_count": sse_count, "confidence": "HIGH"})

# Modular vs monolith
agent_dirs = len([e for e in all_files if "/agents/" in e["path"].replace("\\","/")])
patterns_found.append({"pattern": "modular" if agent_dirs > 5 else "monolith", "evidence_file_count": agent_dirs, "confidence": "MEDIUM"})

# Violations: CommonJS require() in TS files
cjs_files = [p for p,c in all_content_map.items() if re.search(r'\brequire\s*\(', c) and p.endswith(".ts")]
if cjs_files:
    violations.append({"violation": "CommonJS require() in TypeScript files", "files": cjs_files[:10], "severity": "MEDIUM"})

arch_patterns = {
    "patterns_found": patterns_found,
    "violations": violations,
    "recommendation": "Consolidate event bus into a single Nervous System module; move all polling to event-driven triggers.",
}
write_json("architecture_patterns.json", arch_patterns)

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 11: ORGAN_MAPPING ===")
organ_map = {
    "Heart": [],
    "Nervous_System": [],
    "Brain": [],
    "Muscles": [],
    "Skin": [],
    "Endocrine": [],
    "Skeletal": [],
    "Lymphatic": [],
    "Unmapped": [],
}

PATH_ORGAN_RULES = [
    (r"orchestrat",         "Heart"),
    (r"event[_-]?bus|EventBus|bus\.emit|bus\.publish", "Nervous_System"),
    (r"src[/\\]core[/\\]events", "Nervous_System"),
    (r"knowledge|graph|brain", "Brain"),
    (r"playwright|n8n|execut", "Muscles"),
    (r"src[/\\]safety|src[/\\]auth|valid", "Skin"),
    (r"src[/\\]config|env\.ts|constants", "Endocrine"),
    (r"src[/\\]core[/\\]interfaces|contracts[/\\]|interface\.", "Skeletal"),
    (r"src[/\\]healing|log|observ|metric|monitor", "Lymphatic"),
    (r"AgentForge[/\\]contracts", "Skeletal"),
    (r"AgentForge[/\\]runtime", "Heart"),
    (r"AgentForge[/\\]schemas", "Skeletal"),
]

for entry in all_files:
    p_norm = entry["path"].replace("\\", "/")
    assigned = False
    for pat, organ in PATH_ORGAN_RULES:
        if re.search(pat, p_norm, re.IGNORECASE):
            organ_map[organ].append(entry["path"])
            assigned = True
            break
    if not assigned:
        organ_map["Unmapped"].append(entry["path"])

write_json("organ_mapping.json", organ_map)
for organ, files in organ_map.items():
    log(f"  {organ}: {len(files)} files")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 12: COMPLETENESS_ASSESSMENT ===")

def assess_organ(organ, files):
    count = len(files)
    ts_files_in_organ = [f for f in files if f.endswith((".ts", ".tsx"))]
    # Check for stub/placeholder indicators
    stub_indicators = []
    for f in ts_files_in_organ[:20]:
        content = safe_read(f, 3000)
        if re.search(r'TODO|FIXME|stub|placeholder|throw new Error|not implemented', content, re.IGNORECASE):
            stub_indicators.append(f)
    if count == 0:
        return {"status": "MISSING", "files": [], "notes": "No files found for this organ"}
    elif stub_indicators and len(stub_indicators) > len(ts_files_in_organ) * 0.5:
        return {"status": "PARTIAL", "files": files[:10], "notes": f"{len(stub_indicators)} stub/placeholder files out of {len(ts_files_in_organ)} TS files"}
    elif count < 2:
        return {"status": "PARTIAL", "files": files, "notes": "Very few files — likely incomplete"}
    else:
        return {"status": "EXISTS", "files": files[:10], "notes": f"{count} total files, {len(ts_files_in_organ)} TypeScript"}

organs_assessment = {}
total_exists = 0
total_organs = len(organ_map) - 1  # exclude Unmapped

for organ, files in organ_map.items():
    if organ == "Unmapped":
        continue
    assessment = assess_organ(organ, files)
    organs_assessment[organ] = assessment
    if assessment["status"] == "EXISTS":
        total_exists += 1

completeness_pct = round((total_exists / total_organs) * 100) if total_organs > 0 else 0

completeness_report = {
    "organs": organs_assessment,
    "overall_completeness_pct": completeness_pct,
    "assessed_at": datetime.now().isoformat(),
}
write_json("completeness_report.json", completeness_report)
for organ, a in organs_assessment.items():
    log(f"  {organ}: {a['status']}")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 13: INCONSISTENCY_DETECTION ===")
inconsistencies = []

# 1. Duplicate interface names across files
iface_by_name = defaultdict(list)
for iface in interfaces:
    iface_by_name[iface["name"]].append(iface["file"])
for iname, ifiles in iface_by_name.items():
    if len(ifiles) > 1:
        inconsistencies.append({
            "type": "DUPLICATE_INTERFACE",
            "description": f"Interface '{iname}' defined in {len(ifiles)} files",
            "files": ifiles,
            "severity": "HIGH",
        })

# 2. Files in both AgentForge and agentforge_autonomous with same name
af_names = {Path(e["path"]).name: e["path"] for e in all_files if e["origin"] == "AgentForge_zip"}
src_names = {Path(e["path"]).name: e["path"] for e in all_files if e["origin"] == "agentforge_autonomous"}
conflict_names = set(af_names) & set(src_names)
for cname in sorted(conflict_names):
    inconsistencies.append({
        "type": "CROSS_SOURCE_CONFLICT",
        "description": f"File '{cname}' exists in both AgentForge/ and agentforge_autonomous/src/",
        "files": [af_names[cname], src_names[cname]],
        "severity": "MEDIUM",
    })

# 3. Multiple PRD versions
if len(prd_variants) > 1:
    inconsistencies.append({
        "type": "MULTIPLE_PRD_VERSIONS",
        "description": f"{len(prd_variants)} PRD files found — no single source of truth",
        "files": [e["path"] for e in prd_variants],
        "severity": "HIGH",
    })

# 4. Agent interface mismatches — check if agents implement Agent interface
agent_files = [e for e in all_files if "/agents/" in e["path"].replace("\\","/") and e["extension"] == ".ts"]
no_interface = []
for entry in agent_files:
    content = safe_read(entry["path"])
    if content and "class " in content and "implements" not in content and "Agent" not in content:
        no_interface.append(entry["path"])
if no_interface:
    inconsistencies.append({
        "type": "AGENT_INTERFACE_MISMATCH",
        "description": f"{len(no_interface)} agent files have class definitions not explicitly implementing Agent interface",
        "files": no_interface[:10],
        "severity": "MEDIUM",
    })

# 5. Missing organ implementations
for organ, assessment in organs_assessment.items():
    if assessment["status"] == "MISSING":
        inconsistencies.append({
            "type": "MISSING_ORGAN",
            "description": f"Organ '{organ}' has no implementation files",
            "files": [],
            "severity": "HIGH",
        })

incons_report = {
    "inconsistencies": inconsistencies,
    "total": len(inconsistencies),
    "by_severity": {
        "HIGH":   len([i for i in inconsistencies if i["severity"] == "HIGH"]),
        "MEDIUM": len([i for i in inconsistencies if i["severity"] == "MEDIUM"]),
        "LOW":    len([i for i in inconsistencies if i["severity"] == "LOW"]),
    }
}
write_json("inconsistencies.json", incons_report)
log(f"Inconsistencies: {len(inconsistencies)} total")

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== STEP 14: BASELINE_SUMMARY ===")

organ_lines = []
for organ, a in organs_assessment.items():
    count = len(organ_map.get(organ, []))
    organ_lines.append(f"| {organ:<18} | {a['status']:<8} | {count:>5} files | {a['notes'][:60]} |")

top_incons = sorted(inconsistencies, key=lambda x: {"HIGH":0,"MEDIUM":1,"LOW":2}.get(x["severity"],3))[:3]
top_incons_lines = []
for i, inc in enumerate(top_incons, 1):
    top_incons_lines.append(f"{i}. [{inc['severity']}] {inc['type']}: {inc['description'][:80]}")

# Gaps = MISSING or PARTIAL organs
gaps = [(organ, a) for organ, a in organs_assessment.items() if a["status"] in ("MISSING","PARTIAL")]
gap_lines = []
for i, (organ, a) in enumerate(gaps[:3], 1):
    gap_lines.append(f"{i}. {organ} ({a['status']}): {a['notes'][:80]}")

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

summary_md = f"""# AgentForge Baseline Summary
Generated: {now}

## File Counts

| Source | Files Indexed |
|--------|--------------|
| AgentForge/ (canonical artifacts) | {len([e for e in all_files if e['origin']=='AgentForge_zip'])} |
| agentforge_autonomous/src/ (TypeScript impl) | {len([e for e in all_files if e['origin']=='agentforge_autonomous'])} |
| **Total** | **{len(all_files)}** |

### By Category
| Category | Count |
|----------|-------|
| CODE (.ts/.tsx) | {len([e for e in classified if e['category']=='CODE'])} |
| ARCHITECTURE (.md arch/seq) | {len([e for e in classified if e['category']=='ARCHITECTURE'])} |
| CONFIG (.json/.yaml) | {len([e for e in classified if e['category']=='CONFIG'])} |
| SCHEMA | {len([e for e in classified if e['category']=='SCHEMA'])} |
| PRD | {len([e for e in classified if e['category']=='PRD'])} |
| PROMPT | {len([e for e in classified if e['category']=='PROMPT'])} |
| UNKNOWN | {len([e for e in classified if e['category']=='UNKNOWN'])} |

## Completeness by Organ

Overall: **{completeness_pct}%**

| Organ | Status | Files | Notes |
|-------|--------|-------|-------|
{chr(10).join(organ_lines)}

## Top 3 Inconsistencies

{chr(10).join(top_incons_lines) if top_incons_lines else "None detected."}

## Top 3 Gaps

{chr(10).join(gap_lines) if gap_lines else "No gaps detected."}

## Architecture Patterns Detected

{chr(10).join(f"- {p['pattern']} (confidence: {p['confidence']}, {p['evidence_file_count']} files)" for p in patterns_found)}

## Entry Points

- Total entry points found: {len(entry_points)}
- API routes: {len([e for e in entry_points if e['type']=='api_route'])}
- Orchestrators: {len([e for e in entry_points if e['type']=='orchestrator'])}
- Agents: {len([e for e in entry_points if e['type']=='agent'])}
- Services: {len([e for e in entry_points if e['type']=='service'])}
- Runtime (AgentForge/): {len([e for e in entry_points if e['type']=='runtime'])}

## Event Flows

- Total event flow signals: {len(flows)}
- Transports detected: {', '.join(sorted(set(f['transport'] for f in flows))) if flows else 'none'}

## Key Findings (Zero Speculation)

1. SOURCE_A (AgentForge/) contains {len([e for e in all_files if e['origin']=='AgentForge_zip'])} files across {len(set(str(Path(e['path']).parent) for e in all_files if e['origin']=='AgentForge_zip'))} directories.
2. SOURCE_B (agentforge_autonomous/src/) contains {len([e for e in all_files if e['origin']=='agentforge_autonomous'])} files.
3. {len(interfaces)} TypeScript interfaces found; {len([i for i in iface_by_name.values() if len(i)>1])} have duplicate definitions.
4. {len(conflict_names)} filenames appear in both sources ({', '.join(sorted(conflict_names)[:5])}).
5. Violations detected: {len(violations)} (CommonJS usage, etc.).
"""

write_md("baseline_summary.md", summary_md)

# ─────────────────────────────────────────────────────────────────────────────
print("\n=== VERIFICATION ===")
expected = [
    "file_index.json", "classification.json", "entry_points.json",
    "system_components.json", "event_flows.json", "dependency_graph.json",
    "duplication_report.json", "config_analysis.json", "contracts.json",
    "architecture_patterns.json", "organ_mapping.json", "completeness_report.json",
    "inconsistencies.json", "baseline_summary.md",
]
all_ok = True
for fname in expected:
    fpath = OUTPUT_DIR / fname
    if fpath.exists():
        size = fpath.stat().st_size
        print(f"  [OK]  {fname} ({size:,} bytes)")
    else:
        print(f"  [MISSING] {fname}")
        all_ok = False

print(f"\n{'All 14 files produced successfully.' if all_ok else 'SOME FILES MISSING — check errors above.'}")
print(f"Output directory: {OUTPUT_DIR}")
