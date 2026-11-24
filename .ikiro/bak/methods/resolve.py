"""resolve — every relative import/export/dynamic-import/new URL specifier in the given trees must name a file that exists.

python3 -I resolve.py <dir>...   → prints UNRESOLVED rows, then a tally
"""
import os, re, sys

REPO = os.environ.get("CLAUDE_PROJECT_DIR", "/Users/finn/vivalence/code/vivalence")
SKIP = re.compile(r"(^|/)(bak[^/]*|node_modules|out|build|dist|\.svelte-kit|snapshots)(/|$)")
SRC = (".js", ".ts", ".jsx", ".tsx", ".mjs", ".svelte")
SPEC = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(?\s*|new URL\(\s*)["'](\.{1,2}/[^"'?#]+)""")
COMMENT = re.compile(r"^\s*(//|\*|/\*)")

bad, seen = [], 0
for root in sys.argv[1:]:
    for d, dirs, files in os.walk(os.path.join(REPO, root)):
        rel = os.path.relpath(d, REPO)
        if SKIP.search(rel + "/"):
            dirs[:] = []
            continue
        for f in files:
            if not f.endswith(SRC):
                continue
            path = os.path.join(d, f)
            for n, line in enumerate(open(path, encoding="utf-8", errors="replace"), 1):
                if COMMENT.match(line):
                    continue
                for m in SPEC.finditer(line):
                    seen += 1
                    target = os.path.normpath(os.path.join(d, m.group(1)))
                    if not any(os.path.exists(target + ext) for ext in ("", ".js", ".ts", ".jsx", ".svelte", "/index.js", "/index.ts")):
                        bad.append(f"{os.path.relpath(path, REPO)}:{n}  {m.group(1)}")
for b in bad:
    print("UNRESOLVED", b)
print(f"specifiers {seen} · unresolved {len(bad)}")
