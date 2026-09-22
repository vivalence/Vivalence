#!/usr/bin/env python3
"""sweep — after deleting or moving anything, grep live canon for its name in the same turn.

    python3 .ikiro/methods/sweep.py <name> [<name>…]     # hits in self/ world/ methods/ skills/ ikiro.md manual.md + memory

Scoped to the deletion EVENT on purpose: a general path-existence checker was built, measured at seven false
positives on a clean tree, and binned. Records (zettelkasten Callouts · compacts · known-issues · loop-backlog)
are out of scope — a ledger describing a path that was wrong IS the record working. A hit here is a lead to
edit, never auto-fixed; naming a dead thing in link syntax re-creates it (derived-canon-drift).
The deletion sweep — MECHANICAL, and shipped as prose until now.
"""
import glob, os, re, subprocess, sys

ROOT = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".ikiro")
MEM = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence/memory")
SURFACES = [f"{ROOT}/self", f"{ROOT}/world", f"{ROOT}/methods", f"{ROOT}/skills", f"{ROOT}/ikiro.md", f"{ROOT}/manual.md", f"{ROOT}/quests/index.md", f"{ROOT}/compacts/index.md", MEM]

if __name__ == "__main__":
    names = [a for a in sys.argv[1:] if not a.startswith("-")]
    if not names:
        print(__doc__); sys.exit(2)
    total = 0
    for name in names:
        out = subprocess.run(["grep", "-rnF", "--include=*.md", "--include=*.org", "--include=*.py", "--include=*.sh", "--include=*.txt", name, *SURFACES], capture_output=True, text=True).stdout
        hits = [l for l in out.splitlines() if l.strip()]
        total += len(hits)
        print(f"{name}: {len(hits)} hit(s)")
        for h in hits:
            print("  " + h[:200])
    sys.exit(1 if total else 0)
