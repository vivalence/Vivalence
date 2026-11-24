#!/usr/bin/env python3
"""usage.probe — skill frontmatter weight (in context every session) and how often a Bash call names each
method · hook · skill script. Read-only."""
import collections
import glob
import json
import os
import re

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
PROJECT = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")

print("## skill frontmatter — chars in context every session")
print("| skill | frontmatter | body | triggers (·) |")
print("|---|---|---|---|")
front_total = 0
for path in sorted(glob.glob(f"{ROOT}/skills/*/SKILL.md")):
    text = open(path, encoding="utf-8").read()
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    front = match.group(1) if match else ""
    front_total += len(front)
    name = os.path.basename(os.path.dirname(path))
    print(f"| {name} | {len(front)} | {len(text) - len(front)} | {front.count(' · ')} |")
print(f"\nfrontmatter total {front_total} chars")

names = (
    [os.path.basename(p) for p in glob.glob(f"{ROOT}/methods/*")]
    + [os.path.basename(p) for p in glob.glob(f"{ROOT}/skills/*/*") if not p.endswith(("SKILL.md", "LICENSE"))]
)
calls = collections.Counter()
last = {}
for path in sorted(glob.glob(f"{PROJECT}/*.jsonl")):
    with open(path, encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            if '"name":"Bash"' not in raw:
                continue
            try:
                row = json.loads(raw)
            except json.JSONDecodeError:
                continue
            for part in (row.get("message") or {}).get("content") or []:
                if not isinstance(part, dict) or part.get("name") != "Bash":
                    continue
                command = (part.get("input") or {}).get("command", "")
                for name in names:
                    if name in command:
                        calls[name] += 1
                        last[name] = (row.get("timestamp") or "")[:10]

print("\n## methods · skill scripts — Bash calls naming the file")
print("| file | calls | last |")
print("|---|---|---|")
for name in sorted(names, key=lambda n: -calls[n]):
    print(f"| {name} | {calls[name]} | {last.get(name, '-')} |")
