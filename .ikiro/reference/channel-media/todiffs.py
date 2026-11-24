"""todiffs — the difference between the tree and a built copy, as the quest's diff blocks.

    python3 todiffs.py <tree> <copy> <path> [<path> ...]   → org `#+begin_src diff` blocks on stdout

Each hunk grows its context until its old text stands exactly once in the tree's file (the apply-diffs law).
"""
import difflib, sys

tree, copy, paths = sys.argv[1].rstrip("/") + "/", sys.argv[2].rstrip("/") + "/", sys.argv[3:]

def hunks(old, new, path):
    matcher = difflib.SequenceMatcher(None, old, new, autojunk=False)
    changes = [op for op in matcher.get_opcodes() if op[0] != "equal"]
    out, text = [], "\n".join(old)
    for tag, i1, i2, j1, j2 in changes:
        for context in range(1, 40):
            a, b = max(0, i1 - context), min(len(old), i2 + context)
            before = "\n".join(old[a:b])
            if before and text.count(before) == 1: break
        else: raise SystemExit(f"no unique anchor: {path}:{i1 + 1}")
        out.append([a, b, i1, i2, j1, j2])
    merged = []
    for hunk in out:
        if merged and hunk[0] <= merged[-1][1]:
            last = merged[-1]
            last[1] = max(last[1], hunk[1]); last[5].append((hunk[2], hunk[3], hunk[4], hunk[5]))
        else: merged.append([hunk[0], hunk[1], None, None, None, [(hunk[2], hunk[3], hunk[4], hunk[5])]])
    blocks = []
    for a, b, _, _, _, edits in merged:
        rows, at = [], a
        for i1, i2, j1, j2 in edits:
            rows += [(" ", line) for line in old[at:i1]]
            rows += [("-", line) for line in old[i1:i2]]
            rows += [("+", line) for line in new[j1:j2]]
            at = i2
        rows += [(" ", line) for line in old[at:b]]
        blocks.append((a + 1, rows))
    return blocks

for path in paths:
    old = open(tree + path, encoding="utf-8").read().split("\n")
    new = open(copy + path, encoding="utf-8").read().split("\n")
    for line, rows in hunks(old, new, path):
        print("#+begin_src diff")
        print(f"// {path}:{line}")
        for sign, text in rows:
            print("" if sign == " " and text == "" else sign + text)
        print("#+end_src")
        print()
