"""cut — a worked copy's difference from its rig, written as a quest's `* as code` body (the tangle shape apply-diffs and materialize read).
# limit: 4500 chars

    python3 .ikiro/methods/cut.py --rig <untouched copy> --base <worked copy> --tags <tags.json> [--move <from> <to> …] > body.org

Moves are named (`--move`), never guessed: the moved file's block diffs its OLD text on the NEW path. A file only in the base
is a whole block (`// <path>`, no `:line`); a file only in the rig and not moved is a Deletes row. A hunk's context grows
until its old side occurs once in the old file (the apply-diffs law). Headings: `***` system · `****` directory · `*****`
file, `ls` order; `--tags` maps a path to its rulings, written after the name. Skipped: node_modules · .ikiro · bak · out · snapshots.
"""
import difflib, json, os, sys

args = sys.argv[1:]
rig = args[args.index("--rig") + 1].rstrip("/")
base = args[args.index("--base") + 1].rstrip("/")
tags = json.load(open(args[args.index("--tags") + 1]))
moves = [(args[i + 1], args[i + 2]) for i, arg in enumerate(args) if arg == "--move"]
SKIP = {"node_modules", ".ikiro", "bak", "out", "snapshots", ".git", ".jj", "testament"}
LANGS = {".js": "js", ".jsx": "jsx", ".ts": "ts", ".jsonc": "jsonc", ".json": "jsonc"}


def files(root):
    found = set()
    for directory, names, leaves in os.walk(root):
        names[:] = [name for name in names if name not in SKIP]
        for leaf in leaves:
            if not leaf.endswith(".log"): found.add(os.path.relpath(os.path.join(directory, leaf), root))
    return found


def read(path):
    return open(path, encoding="utf-8").read().split("\n")


def hunks(old, new, path):
    out = []
    for group in difflib.SequenceMatcher(None, old, new, autojunk=False).get_grouped_opcodes(1):
        start, stop, first, last = group[0][1], group[-1][2], group[0][3], group[-1][4]
        while "\n".join(old[start:stop]).strip() == "" or "\n".join(old).count("\n".join(old[start:stop])) != 1:
            if start == 0 and stop == len(old): break
            start, first = max(0, start - 1), max(0, first - 1)
            stop, last = min(len(old), stop + 1), min(len(new), last + 1)
        lines = [f"// {path}:{start + 1}"]
        for tag, a, b, c, d in difflib.SequenceMatcher(None, old[start:stop], new[first:last], autojunk=False).get_opcodes():
            if tag == "equal": lines += [(" " + line) if line else "" for line in old[start + a : start + b]]
            else: lines += ["-" + line for line in old[start + a : start + b]] + ["+" + line for line in new[first + c : first + d]]
        out.append(lines)
    merged = []
    for lines in out: merged += (["…"] if merged else []) + lines
    return merged


moved = {to: source for source, to in moves}
rigged, based = files(rig), files(base)
changed = sorted(path for path in based if (path in moved or path in rigged) and open(f"{base}/{path}", "rb").read() != open(f"{rig}/{moved.get(path, path)}", "rb").read())
added = sorted(path for path in based - rigged if path not in moved)
deleted = sorted(path for path in rigged - based if path not in moved.values())

print("Moves (=mv= first, each block on the NEW path):\n\n| from | to | rides |\n|------|----|-------|")
for source, to in moves: print(f"| ={source}= | ={to}= | {tags.get(to, '')} |")
print("\nDeletes:\n\n| path | rides |\n|------|-------|")
for path in deleted: print(f"| ={path}= | {tags.get(path, '')} |")
print()

chain = [None, None]
for path in sorted(set(changed) | set(added)):
    parts = path.split("/")
    system = "/".join(parts[:2]) if parts[0] in ("systems", "subsystems", "commons") else parts[0]
    rest = path[len(system) + 1 :]
    directory = os.path.dirname(rest) or "(root)"
    if chain[0] != system: print(f"*** {system}"); chain = [system, None]
    if chain[1] != directory: print(f"**** {directory}"); chain[1] = directory
    rulings = tags.get(path, "")
    print(f"***** {os.path.basename(path)}{' — ' + rulings if rulings else ''}{' (new)' if path in added else ''}")
    if path in added:
        print(f"#+BEGIN_SRC {LANGS.get(os.path.splitext(path)[1], 'js')}\n// {path}")
        print("\n".join(read(f"{base}/{path}")).rstrip("\n"))
    else:
        print("#+BEGIN_SRC diff")
        print("\n".join(hunks(read(f"{rig}/{moved.get(path, path)}"), read(f"{base}/{path}"), path)))
    print("#+END_SRC")
