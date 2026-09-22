#!/usr/bin/env python3
"""codemap — a shard is two halves: the GENERATED surface of its territory, and the AUTHORED traps (m69 2.2).

    python3 .ikiro/methods/codemap.py                 # regenerate the generated half of every shard, in place
    python3 .ikiro/methods/codemap.py runtime ghost   # only these shards
    python3 .ikiro/methods/codemap.py --check         # exit 1 on DRIFT (generated ≠ the tree) or an UNGROUNDED trap
    python3 .ikiro/methods/codemap.py --check -v      # + every ungrounded trap, verbatim

GENERATED — between `<!-- generated … -->` and `<!-- /generated -->`, never hand-edited: the container's
`deno.jsonc` (package · exports · tasks), the names every export barrel exports, the test layout; for a registry
package its manifest, modes, domain files and whether it carries VCS. Code and data, because what loads first
primes what comes out. `--check` re-derives it in memory and diffs.

AUTHORED — every `- ` line above the generated block is a trap, and a trap is GROUNDED when at least one anchor
in it resolves (a pasted excerpt rotted three times; an anchor either resolves or is reported):
    `path:LINE` · `file.js:symbol`   a code line / a symbol the file still contains (container root, repo, ~/.viva)
    `ki <id>`                        a `* <id>` heading in known-issues.org
    `ledger <MM-DD>`                 a `### <YYYY->MM-DD` heading in zettelkasten.md ## Callouts
    `compact <slug-prefix>`          a compacts/*.org file
    `quest <name>`                   a quest file anywhere under quests/
    `project_*` · `feedback_*`       a memory captured at the 09-23 fold (~/.viva/bak/ikiro/memory-20260923/)
    /"beef verbatim"/                the quote found word for word in the record (ledger · compacts · quests · known-issues)
"""
import glob, json, os, re, sys

PROJECT = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
IKIRO = os.path.join(PROJECT, ".ikiro")
CODEMAP = os.path.join(IKIRO, "world", "codemap")
HOME = os.path.expanduser("~")
REGISTRY = os.path.join(HOME, ".viva", "registry")
MEMORY = os.path.join(HOME, ".viva", "bak", "ikiro", "memory-20260923")
SHARDS = {
    "runtime": ["systems/runtime"],
    "ghost": ["systems/ghost"],
    "anima": ["systems/anima", "subsystems/dapper", "subsystems/drapes"],
    "typology": ["subsystems/typology"],
    "paladin": ["subsystems/paladin"],
    "commons": ["commons"],
    "testament": ["testament"],
    "assembly": ["~/.viva/registry/assembly", "~/.viva/registry/droneaid"],
    "education": ["~/.viva/registry/education"],
    "invariants": [],
    "map": ["."],
    "ledger": ["~/.viva", "systems/ghost/trajectories", "subsystems/paladin/prototypes/ledger"],
    "connoisseur": ["subsystems/typology"],
}
# the connoisseur's canon, EXTRACTED at stamp time — a pasted excerpt rotted three times (m69 2.3)
CANON = [
    ("shape.object", "subsystems/typology/gestalten/shape/object.js", "export const object"),
    ("steer.fold", "subsystems/typology/gestalten/steer/trie.js", "export function fold"),
    ("middleware.compose", "subsystems/typology/gestalten/belt/middleware.js", "export function compose"),
    ("atom.chain → bind", "subsystems/typology/gestalten/belt/atom.js", "function bind"),
    ("Pool", "subsystems/typology/prototypes/pool.js", "export class Pool"),
]
OPEN, CLOSE = "<!-- generated: python3 .ikiro/methods/codemap.py {shard} — never hand-edited -->", "<!-- /generated -->"
SKIP = {"node_modules", ".git", ".jj", ".astro", "static", "bak", ".svelte-kit", "__pycache__"}


def absolute(root):
    return os.path.expanduser(root) if root.startswith("~") else os.path.join(PROJECT, root)


def jsonc(path):
    text = open(path, encoding="utf-8").read()
    text = re.sub(r'("(?:\\.|[^"\\])*")|//[^\n]*', lambda m: m.group(1) or "", text)
    return json.loads(re.sub(r",(\s*[}\]])", r"\1", text))


def exported(path):
    """the names a JS/TS module exports, in source order — `* from x` and `* as n from x` kept as written."""
    if not os.path.isfile(path):
        return ["(missing)"]
    text = re.sub(r"/\*.*?\*/|^\s*//[^\n]*", "", open(path, encoding="utf-8").read(), flags=re.S | re.M)
    names = []
    for m in re.finditer(r"export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)"
                         r"|export\s*\{([^}]*)\}(?:\s*from\s*['\"]([^'\"]+)['\"])?"
                         r"|export\s*\*\s*(?:as\s+([\w$]+)\s*)?from\s*['\"]([^'\"]+)['\"]"
                         r"|export\s+default\b", text):
        if m.group(1):
            names.append(m.group(1))
        elif m.group(2) is not None:
            names += [part.split(" as ")[-1].strip() for part in m.group(2).split(",") if part.strip()]
        elif m.group(5):
            names.append(f"* as {m.group(4)} from {m.group(5)}" if m.group(4) else f"* from {m.group(5)}")
        else:
            names.append("default")
    return list(dict.fromkeys(names))


def tests(root):
    counts = {}
    for path in glob.glob(os.path.join(root, "**", "*.test.*"), recursive=True):
        rel = os.path.relpath(path, root)
        if set(rel.split(os.sep)) & SKIP:
            continue
        folder = os.path.dirname(rel) or "."
        counts[folder] = counts.get(folder, 0) + 1
    return dict(sorted(counts.items()))


def children(root, depth=1):
    found = {}
    for entry in sorted(os.listdir(root)):
        path = os.path.join(root, entry)
        if entry.startswith(".") or entry in SKIP or not os.path.isdir(path):
            continue
        found[entry] = children(path, depth - 1) if depth > 1 else len([e for e in os.listdir(path) if not e.startswith(".")])
    return found


def workspace_member(root):
    manifest = jsonc(os.path.join(root, "deno.jsonc"))
    tasks = manifest.get("tasks", {})
    per_file = sorted(name for name, command in tasks.items() if re.search(r"--watch\s+\S+\.test\.\w+$", command))
    return {
        "package": manifest.get("name"),
        "exports": manifest.get("exports", {}),
        "barrels": {target.lstrip("./"): exported(os.path.join(root, target)) for target in manifest.get("exports", {}).values()},
        "tasks": {name: command for name, command in tasks.items() if name not in per_file},
        "tasks, one file each (all --watch)": len(per_file),
        "tests": tests(root),
    }


def registry_package(root):
    manifest = next((os.path.basename(p) for p in sorted(glob.glob(os.path.join(root, "*.viva.js")))), None)
    modes = sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, "modes", "*", "*")) if os.path.isdir(p))
    return {
        "manifest": manifest,
        "vcs": "git" if os.path.isdir(os.path.join(root, ".git")) else "NONE — capture before delete",
        "modes": modes,
        "domain": sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, "domain", "**", "*.js"), recursive=True)),
        "folders": children(root),
        "tests": tests(root),
    }


def plain_tree(root):
    manifest = next((os.path.basename(p) for p in sorted(glob.glob(os.path.join(root, "*.viva.js")))), None)
    return {"manifest": manifest, "folders": children(root, 2), "tests": tests(root)}


def compact(value, depth=0):
    """JSON with one key per line and every leaf inline — dense enough to read as data, stable enough to diff."""
    inline = json.dumps(value, ensure_ascii=False)
    if not isinstance(value, dict) or len(inline) <= 110:
        return inline
    pad = " " * (depth + 1)
    rows = [f"{pad}{json.dumps(k, ensure_ascii=False)}: {compact(v, depth + 1)}" for k, v in value.items()]
    return "{\n" + ",\n".join(rows) + "\n" + " " * depth + "}"


def workspace():
    """the repo at L2: members, the packages that are not members, and what each root task delegates to."""
    root = jsonc(os.path.join(PROJECT, "deno.jsonc"))
    grouped = {}
    for name, command in root.get("tasks", {}).items():
        container, _, verb = name.partition("/")
        grouped.setdefault(container, []).append(verb or "(root)")
    return {
        "workspace": [member.lstrip("./") for member in root.get("workspace", [])],
        "not members": {path: os.path.basename(m) for path in ("commons", "testament")
                        for m in (glob.glob(os.path.join(PROJECT, path, "*.viva.js")) or [os.path.join(PROJECT, path, "(no manifest)")])[:1]},
        "excluded": root.get("exclude", []),
        "root tasks by container": grouped,
    }


def viva():
    """~/.viva as the ledger holds it: the verbs that write it, the instance record, the registry and its VCS."""
    home = os.path.join(HOME, ".viva")
    trajectories = os.path.join(PROJECT, "systems", "ghost", "trajectories")
    verbs = sorted(os.path.relpath(p, trajectories).removesuffix("/index.js").removesuffix(".js")
                   for p in glob.glob(os.path.join(trajectories, "**", "*.js"), recursive=True)
                   if not re.search(r"(tests|text-select|Help)", p) and not p.endswith("trajectories/index.js"))
    instances = json.load(open(os.path.join(home, "instances.json"))) if os.path.isfile(os.path.join(home, "instances.json")) else {}
    tapped = json.load(open(os.path.join(home, "registry.json"))) if os.path.isfile(os.path.join(home, "registry.json")) else []
    packages = sorted(e for e in os.listdir(REGISTRY) if os.path.isdir(os.path.join(REGISTRY, e)) and not e.startswith("."))
    return {
        "~/.viva": sorted(e for e in os.listdir(home) if not e.startswith(".")),
        "verbs (systems/ghost/trajectories)": verbs,
        "instances.json — slug → mount": {slug: record.get("mount", "").replace(HOME, "~") for slug, record in instances.items()},
        "registry — package: tapped · vcs": {p: f"{'tapped' if p in tapped else 'untapped'} · {'git' if os.path.isdir(os.path.join(REGISTRY, p, '.git')) else 'NO VCS'}" for p in packages},
        "registry.json, off-registry taps": [t.replace(HOME, "~").replace(PROJECT, "<repo>") for t in tapped if t not in packages],
    }


def excerpt(path, opening, limit=16):
    lines = open(os.path.join(PROJECT, path), encoding="utf-8").read().split("\n")
    start = next(i for i, line in enumerate(lines) if line.startswith(opening))
    taken = [lines[start]]
    for line in lines[start + 1:start + limit]:
        taken.append(line)
        if line and not line[0].isspace():
            break
    return start + 1, "\n".join(taken)


def canon():
    blocks = []
    for label, path, opening in CANON:
        try:
            line, code = excerpt(path, opening)
            blocks.append(f"```js\n// {path}:{line} — {label}\n{code}\n```")
        except (OSError, StopIteration):
            blocks.append(f"```js\n// {path} — {label}: `{opening}` NOT FOUND — the canon moved\n```")
    return "\n".join(blocks)


def generate(shard):
    if shard in ("map", "ledger"):
        data = workspace() if shard == "map" else viva()
        return OPEN.format(shard=shard) + "\n```jsonc\n// " + ("deno.jsonc — the workspace" if shard == "map" else "~/.viva") + "\n" + compact(data) + "\n```\n" + CLOSE
    if shard == "connoisseur":
        return OPEN.format(shard=shard) + "\n" + canon() + "\n" + CLOSE
    blocks = []
    for root in SHARDS[shard]:
        path = absolute(root)
        if not os.path.isdir(path):
            blocks.append(f"// {root} — ABSENT on this machine")
            continue
        if os.path.isfile(os.path.join(path, "deno.jsonc")):
            data = workspace_member(path)
        elif root.startswith("~/.viva/registry"):
            data = registry_package(path)
        else:
            data = plain_tree(path)
        blocks.append(f"// {root}\n" + compact(data))
    if not blocks:
        return None
    return OPEN.format(shard=shard) + "\n```jsonc\n" + "\n".join(blocks) + "\n```\n" + CLOSE


def split(text):
    start = text.find("<!-- generated:")
    if start < 0:
        return text, None
    end = text.find(CLOSE, start)
    return text[:start], text[start:end + len(CLOSE)]


RECORD = None


def record():
    global RECORD
    if RECORD is None:
        paths = [os.path.join(IKIRO, "zettelkasten.md"), os.path.join(IKIRO, "known-issues.org")]
        paths += glob.glob(os.path.join(IKIRO, "compacts", "*.org")) + glob.glob(os.path.join(IKIRO, "quests", "**", "*.org"), recursive=True)
        RECORD = "\n".join(open(p, encoding="utf-8", errors="replace").read() for p in paths)
        RECORD = re.sub(r"\s+", " ", RECORD)
    return RECORD


def resolve_code(token, roots):
    """`path:LINE` · `path:symbol` · `path` — true when the file exists under a root and holds the line / symbol."""
    # longest extension first and nothing word-like after it: with `js` before `jsonc`, `deno.jsonc` read as `deno.js`
    # and `Form.jsx` as `Form.js`, and neither could ever resolve (the 09-23 re-grounding pass caught it); `+` is a
    # path character (`+layout.svelte`)
    match = re.match(r"^([~\w@./{}+-]*[\w-]\.(?:jsonc|json|jsx|js|mjs|cjs|tsx|ts|svelte|mdx|md|org|py|sh|sql|css|html|yaml|toml|env)(?!\w))(?::(\w+))?", token)
    if not match or "{" in match.group(1):
        return False
    target, anchor = match.group(1), match.group(2)
    bases = [absolute(r) for r in roots] + [PROJECT, REGISTRY, os.path.join(HOME, ".viva"), HOME]
    candidates = [os.path.expanduser(target)] if target.startswith("~") else [os.path.join(b, target.removeprefix("registry/")) for b in bases]
    found = [c for c in candidates if os.path.isfile(c)]
    if not found and "/" not in target:
        for base in [absolute(r) for r in roots]:
            found += [p for p in glob.glob(os.path.join(base, "**", target), recursive=True) if "node_modules" not in p][:3]
    for path in found:
        if anchor is None:
            return True
        lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
        if anchor.isdigit() and int(anchor) <= len(lines):
            return True
        if not anchor.isdigit() and re.search(rf"\b{re.escape(anchor)}\b", "\n".join(lines)):
            return True
    return False


def grounded(trap, roots):
    anchors = []
    for token in re.findall(r"`([^`]+)`", trap):
        if resolve_code(token.strip(), roots):
            anchors.append(f"code {token}")
    for kind, name in re.findall(r"\b(ki|ledger|compact|quest) ([\w./-]+)", trap):
        if kind == "ki" and re.search(rf"^\* {re.escape(name)}\b", open(os.path.join(IKIRO, "known-issues.org"), encoding="utf-8").read(), re.M):
            anchors.append(f"ki {name}")
        if kind == "ledger" and re.search(rf"^### (20\d\d-)?{re.escape(name)}", open(os.path.join(IKIRO, "zettelkasten.md"), encoding="utf-8").read(), re.M):
            anchors.append(f"ledger {name}")
        if kind == "compact" and glob.glob(os.path.join(IKIRO, "compacts", f"{name}*.org")):
            anchors.append(f"compact {name}")
        if kind == "quest" and glob.glob(os.path.join(IKIRO, "quests", "**", f"{name}*.org"), recursive=True):
            anchors.append(f"quest {name}")
    for memory in re.findall(r"\b((?:project|feedback|reference|user)_[a-z0-9_]+)\b", trap):
        if os.path.isfile(os.path.join(MEMORY, memory + ".md")):
            anchors.append(f"memory {memory}")
    for quote in re.findall(r'/"(.+?)"/', trap):
        if len(quote) > 12 and re.sub(r"\s+", " ", quote) in record():
            anchors.append("quote")
    return anchors


def traps(authored):
    body = re.sub(r"^---\n.*?\n---\n", "", authored, flags=re.S)
    return [line for line in body.split("\n") if line.startswith("- ")]


if __name__ == "__main__":
    wanted = [a for a in sys.argv[1:] if not a.startswith("-")] or list(SHARDS)
    check, verbose = "--check" in sys.argv, "-v" in sys.argv
    failing = 0
    for shard in wanted:
        path = os.path.join(CODEMAP, f"{shard}.md")
        text = open(path, encoding="utf-8").read()
        authored, current = split(text)
        fresh = generate(shard)
        roots = SHARDS[shard]
        lines = traps(authored)
        loose = [line for line in lines if not grounded(line, roots)]
        drift = fresh is not None and current != fresh
        if not check and fresh is not None and drift:
            open(path, "w", encoding="utf-8").write(authored.rstrip("\n") + "\n\n" + fresh + "\n")
            drift = False
        state = "DRIFT" if drift else "ok" if fresh else "no territory"
        failing += bool(drift) + len(loose)
        print(f"{shard:11} generated {state:12} traps {len(lines):3} · grounded {len(lines) - len(loose):3} · ungrounded {len(loose)}")
        if verbose:
            for line in loose:
                print(f"    UNGROUNDED {line[:160]}")
    sys.exit(1 if check and failing else 0)
