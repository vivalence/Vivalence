"""blocks — a tested copy's changes as a quest's `#+BEGIN_SRC diff` blocks, one block a file.

    python3 .ikiro/methods/blocks.py <pristine root> <changed root> <path> [<path> …]

The cata of apply-diffs.py: it prints what `apply-diffs.py <quest> "<section>" --root <copy> --write` replays.
Line 1 of a block is `// <path>:<first changed line>`, sub-hunks are parted by `…`, a blank context row is EMPTY.
A NEW file is no block: it rides `#+BEGIN_SRC js :tangle <path>` (tangle.py). The blocks are pasted into the
quest with the Edit tool (the cap guard sees Edit · Write only), then replayed on a fresh copy and `cmp`ed.
"""
import difflib, re, sys

before, after = sys.argv[1].rstrip("/") + "/", sys.argv[2].rstrip("/") + "/"
for path in sys.argv[3:]:
    old = open(before + path, encoding="utf-8").read().split("\n")
    new = open(after + path, encoding="utf-8").read().split("\n")
    hunks = []
    for line in difflib.unified_diff(old, new, n=1, lineterm=""):
        if line.startswith(("---", "+++")):
            continue
        head = re.match(r"@@ -(\d+)", line)
        if head:
            hunks.append([int(head.group(1)), []])
            continue
        hunks[-1][1].append("" if line == " " else line)
    print("#+BEGIN_SRC diff")
    print(f"// {path}:{hunks[0][0]}")
    for index, (_, rows) in enumerate(hunks):
        if index:
            print("…")
        print("\n".join(rows))
    print("#+END_SRC")
    print()
