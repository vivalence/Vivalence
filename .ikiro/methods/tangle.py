"""tangle — materialize a quest's `:tangle` blocks into the tree, or diff them against it.

    python3 .ikiro/methods/tangle.py <quest.org> [--prefix <path> …] [--write] [--root <dir>]

Default is a dry run: one line per block — `SAME · DIFF · NEW` against the file under --root (the repo
root, or a sandbox such as testament/m76-probe). --write materializes every selected block (mkdir -p).
--prefix narrows to blocks whose tangle path starts with one of the prefixes (a milestone's set).
`#+BEGIN_SRC diff` hunks are NOT applied — they are listed under `hunks` for the hand pass (Edit tool).
The block body is written byte-for-byte; the org IS the source (methods/quest.md, tangle convention).
"""
import argparse, os, re, sys

BLOCK = re.compile(r"^#\+BEGIN_SRC (\S+)(?: :tangle (\S+))?[^\n]*\n(.*?)^#\+END_SRC", re.S | re.M)
PATH_LINE = re.compile(r"^\s*// ([^\s:]+)(?::(\d+))?")

parser = argparse.ArgumentParser()
parser.add_argument("quest")
parser.add_argument("--prefix", action="append", default=[])
parser.add_argument("--write", action="store_true")
parser.add_argument("--root", default=".")
parser.add_argument("--absorb", action="store_true", help="the reverse: every selected block's body becomes the file under --root (the tree landed, the org follows)")
args = parser.parse_args()

text = open(args.quest, encoding="utf-8").read()

if args.absorb:
    absorbed = 0
    def absorb(match):
        global absorbed
        lang, target, body = match.groups()
        if lang == "diff" or not target: return match.group(0)
        clean = re.sub(r"^(\.\./)+", "", target)
        if args.prefix and not any(clean.startswith(p) for p in args.prefix): return match.group(0)
        path = os.path.join(args.root, clean)
        if not os.path.exists(path): print(f"ABSENT {clean}"); return match.group(0)
        live = open(path, encoding="utf-8").read()
        if live == body: return match.group(0)
        absorbed += 1
        print(f"ABSORB {clean}")
        return match.group(0)[: match.start(3) - match.start(0)] + live + "#+END_SRC"
    open(args.quest, "w", encoding="utf-8").write(BLOCK.sub(absorb, text))
    print(f"\nabsorbed {absorbed} blocks into {args.quest}")
    sys.exit(0)
blocks, hunks = [], []
for match in BLOCK.finditer(text):
    lang, target, body = match.groups()
    if lang == "diff":
        first = body.splitlines()[0] if body else ""
        at = PATH_LINE.match(first)
        hunks.append(at.group(1) + (":" + at.group(2) if at.group(2) else "") if at else "(no path line)")
    elif target:
        target = re.sub(r"^(\.\./)+", "", target)
        blocks.append((target, body))

if args.prefix:
    blocks = [(t, b) for t, b in blocks if any(t.startswith(p) for p in args.prefix)]
    hunks = [h for h in hunks if any(h.startswith(p) for p in args.prefix)]

verdicts = {"SAME": 0, "DIFF": 0, "NEW": 0}
for target, body in blocks:
    path = os.path.join(args.root, target)
    state = "NEW" if not os.path.exists(path) else ("SAME" if open(path, encoding="utf-8").read() == body else "DIFF")
    verdicts[state] += 1
    print(f"{state:5} {target}")
    if args.write and state != "SAME":
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "w", encoding="utf-8").write(body)

print(f"\nblocks {len(blocks)} · " + " · ".join(f"{k} {v}" for k, v in verdicts.items()) + (" · WRITTEN" if args.write else " · dry"))
if hunks:
    print(f"hunks {len(hunks)} (hand pass):")
    for hunk in hunks:
        print("  " + hunk)
sys.exit(0)
