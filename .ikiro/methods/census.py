#!/usr/bin/env python3
"""census — per file: exports · direct importers · reach through barrels · test use by exported name.

usage: python3 .ikiro/methods/census.py systems/runtime [--json]
Resolves relative imports and @vivalence/<pkg>[/<sub>] through each workspace member's deno.jsonc exports.
"""
import json, os, re, sys
from collections import defaultdict

ROOT = os.environ.get("CLAUDE_PROJECT_DIR", ".")
ROOTS = ["systems", "subsystems", "commons", "testament"]
SKIP = re.compile(r"(^|/)(bak[^/]*|todo|node_modules|out|snapshots|static|\.git|\.jj|\.svelte-kit)(/|$)")
SRC = (".js", ".ts", ".jsx", ".mjs", ".svelte")
SPEC = re.compile(r'(?:^|\n)\s*(?:import|export)\b[^;]*?\bfrom\s*["\']([^"\']+)["\']|(?:^|\n)\s*import\s*["\']([^"\']+)["\']|import\(\s*["\']([^"\']+)["\']\s*\)')
EXPORT = re.compile(r"^export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([\w$]+)", re.M)
EXPORT_DEFAULT = re.compile(r"^export\s+default\b", re.M)
EXPORT_LIST = re.compile(r"^export\s+\{([^}]+)\}\s*;?\s*$", re.M)
REEXPORT = re.compile(r'^export\s+(?:\*\s+as\s+([\w$]+)|\{([^}]+)\}|\*)\s+from\s+["\']([^"\']+)["\']', re.M)
BARREL = re.compile(r"(^|/)(index\.(js|ts|jsx|mjs)|mod\.(js|ts)|mod\.client\.js|typology\.js|index\.client\.js)$")


def jsonc(path):
    text = open(path, encoding="utf-8").read()
    text = re.sub(r'("(?:\\.|[^"\\])*")|//[^\n]*|/\*.*?\*/', lambda m: m.group(1) or "", text, flags=re.S)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text, strict=False)


def packages():
    table = {}
    for member in jsonc(os.path.join(ROOT, "deno.jsonc")).get("workspace", []):
        cfg = os.path.join(ROOT, member, "deno.jsonc")
        if not os.path.exists(cfg):
            continue
        data = jsonc(cfg)
        name, exports = data.get("name"), data.get("exports", {})
        if not name:
            continue
        if isinstance(exports, str):
            exports = {".": exports}
        table[name] = {sub: os.path.normpath(os.path.join(member, target)) for sub, target in exports.items()}
    return table


def walk():
    for base in ROOTS:
        for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, base)):
            rel = os.path.relpath(dirpath, ROOT)
            if SKIP.search(rel + "/"):
                dirnames[:] = []
                continue
            for name in filenames:
                if name.endswith(SRC):
                    yield os.path.join(rel, name)


def probe(path):
    for candidate in (path, path + ".js", path + ".ts", path + ".jsx", path + ".mjs", os.path.join(path, "index.js"), os.path.join(path, "index.ts")):
        if os.path.isfile(os.path.join(ROOT, candidate)):
            return candidate
    return None


def resolve(spec, importer, table):
    if spec.startswith("."):
        return probe(os.path.normpath(os.path.join(os.path.dirname(importer), spec)))
    for name, exports in table.items():
        if spec == name or spec.startswith(name + "/"):
            sub = "." + spec[len(name):]
            if sub in exports:
                return probe(exports[sub])
            return None
    return None


def is_test(path):
    return "/tests/" in path or path.endswith(".test.js") or path.endswith(".test.ts")


def main():
    container = sys.argv[1].rstrip("/")
    table = packages()
    files = list(walk())
    text = {f: open(os.path.join(ROOT, f), encoding="utf-8", errors="replace").read() for f in files}
    importers = defaultdict(set)
    for f in files:
        for m in SPEC.finditer(text[f]):
            spec = m.group(1) or m.group(2) or m.group(3)
            target = resolve(spec, f, table)
            if target and target != f:
                importers[target].add(f)

    def reach(path):
        seen, frontier = set(), [path]
        while frontier:
            here = frontier.pop()
            for user in importers.get(here, ()):
                if user in seen:
                    continue
                seen.add(user)
                if BARREL.search(user):
                    frontier.append(user)
        return seen

    rows = []
    for f in sorted(files):
        if not (f == container or f.startswith(container + "/")) or (is_test(f) and "--tests" not in sys.argv):
            continue
        names = EXPORT.findall(text[f]) + (["default"] if EXPORT_DEFAULT.search(text[f]) else [])
        names += [n.strip().split(" as ")[-1] for m in EXPORT_LIST.finditer(text[f]) for n in m.group(1).split(",") if n.strip()]
        reexports = ["*" + (m.group(1) or "") if not m.group(2) else "{" + ",".join(n.strip().split(" as ")[-1] for n in m.group(2).split(",")) + "}" for m in REEXPORT.finditer(text[f])]
        direct = sorted(u for u in importers.get(f, ()) if not is_test(u))
        tests = sorted(u for u in reach(f) if is_test(u))
        used = []
        for name in names:
            if name == "default":
                continue
            pattern = re.compile(r"\b" + re.escape(name) + r"\b")
            for t in tests:
                hit = next((i + 1 for i, line in enumerate(text[t].splitlines()) if pattern.search(line)), None)
                if hit:
                    used.append(f"{name}@{t}:{hit}")
                    break
        rows.append({"file": f, "exports": names + reexports, "direct": direct, "reach": len(reach(f) - set(tests)), "tests": len(tests), "used": used})
    if "--json" in sys.argv:
        print(json.dumps(rows, indent=1))
        return
    for r in rows:
        used = r["used"][0].split("@")[1].split("/tests/")[-1] + " (" + r["used"][0].split("@")[0] + ")" if r["used"] else "-"
        d = r["direct"][0].replace(container + "/", "") if r["direct"] else "-"
        print(f'{r["file"].replace(container + "/", ""):<48} direct={len(r["direct"]):<3} reach={r["reach"]:<4} use={used:<48} first={d:<40} {" ".join(r["exports"])[:60]}')


main()
