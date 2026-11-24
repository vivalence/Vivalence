#!/usr/bin/env python3
"""yap.probe — per harness document: chars, fenced-code share, dated incidents, REJECTED rows, his quotes,
the longest bullets. Read-only."""
import glob
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
FILES = (
    ["codestyle.md", "README.md"]
    + sorted(glob.glob(os.path.join(ROOT, "world/codemap/*.md")))
    + sorted(glob.glob(os.path.join(ROOT, "skills/*/SKILL.md")))
)
DATED = re.compile(r"\b(?:0?[1-9]|1[0-2])-[0-3]\d\b")
QUOTE = re.compile(r'/"[^"]+"/')
INCIDENT = re.compile(r"\((?:REJECTED )?(?:0?[1-9]|1[0-2])-[0-3]\d[^()]*(?:\([^()]*\)[^()]*)*\)")
FENCE = re.compile(r"^```.*?^```", re.M | re.S)

print("| file | chars | code % | dated | REJECTED | quotes | incident chars | incident % | longest bullet |")
print("|---|---|---|---|---|---|---|---|---|")
total = [0, 0]
longest = []
for path in FILES:
    full = path if os.path.isabs(path) else os.path.join(ROOT, path)
    if os.path.islink(full) or not os.path.exists(full):
        continue
    text = open(full, encoding="utf-8").read()
    name = os.path.relpath(full, ROOT)
    code = sum(len(m.group(0)) for m in FENCE.finditer(text))
    prose = FENCE.sub("", text)
    incidents = sum(len(m.group(0)) for m in INCIDENT.finditer(prose))
    bullets = [b for b in re.split(r"\n(?=- |\*\*|\n)", prose) if b.strip()]
    top = max(bullets, key=len) if bullets else ""
    longest.append((len(top), name, top.strip()[:90]))
    total[0] += len(text)
    total[1] += incidents
    print(
        f"| {name} | {len(text)} | {100 * code // max(len(text), 1)} | {len(DATED.findall(prose))} | "
        f"{prose.count('REJECTED')} | {len(QUOTE.findall(prose))} | {incidents} | "
        f"{100 * incidents // max(len(text), 1)} | {len(top)} |"
    )
print(f"\ntotal chars {total[0]} · incident chars {total[1]} ({100 * total[1] // total[0]}%)")
print("\n## longest bullets")
for size, name, head in sorted(longest, reverse=True)[:14]:
    print(f"{size:6d}  {name}  {head}")
