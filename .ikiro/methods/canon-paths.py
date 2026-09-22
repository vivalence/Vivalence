#!/usr/bin/env python3
"""canon-paths — the canon path audit: container-rooted paths asserted as CURRENT in live canon that miss on disk.

    python3 .ikiro/methods/canon-paths.py          # one row per lead: <file> <path>

A LEAD GENERATOR, never a verdict — the same status the kernel gives a codemap claim. Four skip classes make it
survivable (measured 94 raw → 35, then 56 → 25): RECORDS assert the past (zettelkasten · loop-backlog ·
known-issues · compacts/ are out of scope) · context marks it gone (emigrated · deleted · renamed · …) · a prefix
that is not repo-rooted is not a lead (`registry/` names the INSTANCE, `docs/` is `documentation/`) · design that
was never built (sketch · dormant · DESIGNED · …, or 3+ such markers file-wide). Never suggest a successor from a
basename match — a wrong repoint reads as freshly verified. Spec: methods/compact.md ## the canon path audit.
"""
import os, re

PATH = re.compile(r"`((?:systems|subsystems|commons|testament|documentation)/[A-Za-z0-9_@./-]+)`")
GONE = re.compile(r"\b(emigrat|deleted|removed|renamed|no longer|used to|dead|slop|moved|replaced|former|superseded|pre-M11|was at|killed|dissolv|gone|left|old)\w*", re.I)
DESIGN = re.compile(r"\b(sketch|dormant|DESIGNED|not built|planned|proposed|WITHDRAWN|deferred|parked)\w*", re.I)
RECORDS = {"zettelkasten.md", "loop-backlog.md", "known-issues.org"}
ROOT = os.environ.get("CLAUDE_PROJECT_DIR", ".")
MEM = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence/memory")


def sources():
    yield from (os.path.join(MEM, f) for f in sorted(os.listdir(MEM)) if f.endswith(".md"))
    for root, _, files in os.walk(os.path.join(ROOT, ".ikiro")):
        if "/compacts" in root:
            continue
        yield from (os.path.join(root, f) for f in files if f.endswith((".md", ".org")) and f not in RECORDS)


if __name__ == "__main__":
    os.chdir(ROOT)
    leads = 0
    for sp in sources():
        t = open(sp, encoding="utf-8", errors="replace").read()
        wide = len(DESIGN.findall(t)) >= 3
        for m in PATH.finditer(t):
            p = m.group(1).rstrip("/.")
            if os.path.exists(p) or re.search(r"<|\.\.\.|\*|\{", p):
                continue
            ctx = " ".join(t[max(0, m.start() - 160): m.end() + 160].split())
            if GONE.search(ctx) or DESIGN.search(ctx) or wide:
                continue
            leads += 1
            print(f"{os.path.basename(sp):46} {p}")
    print(f"leads {leads}")
