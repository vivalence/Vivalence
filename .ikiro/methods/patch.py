"""patch — atomic multi-hunk text edits. The fix for the ledger's second-largest recurrent failure
(9 compacts: anchors asserted against text that had moved; a batch that applied HALF before failing).

    python3 .ikiro/methods/patch.py <spec.json>

spec = {"file": "<abs path>", "hunks": [{"old": "…", "new": "…"}, …]}

Reads the file FRESH, checks every anchor (present, exactly once) before touching anything, applies
all hunks, writes once, then re-reads and prints the `new` strings' counts — the survivor check from
methods/generated.md. Nothing lands unless everything lands.
"""
import json, sys

spec = json.load(open(sys.argv[1], encoding="utf-8"))
path, hunks = spec["file"], spec["hunks"]
text = open(path, encoding="utf-8").read()
faults = []
for i, h in enumerate(hunks):
    n = text.count(h["old"])
    if n != 1: faults.append(f"hunk {i}: anchor found {n}× — {h['old'][:70]!r}")
if faults:
    print("\n".join(faults)); print("NOTHING WRITTEN"); sys.exit(1)
for h in hunks:
    text = text.replace(h["old"], h["new"], 1)
open(path, "w", encoding="utf-8").write(text)
after = open(path, encoding="utf-8").read()
for i, h in enumerate(hunks):
    if h["new"] and after.count(h["new"]) < 1: print(f"hunk {i}: new text NOT FOUND after write"); sys.exit(2)
print(f"{len(hunks)} hunks landed · {len(after)} chars · {path}")
