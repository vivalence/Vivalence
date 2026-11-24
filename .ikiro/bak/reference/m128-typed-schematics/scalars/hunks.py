"""the difference of two copies as the quest's diff blocks: python3 hunks.py <before> <after>

one block per file, a hunk per change, context above until the old text sits exactly once in the file,
before and after every earlier hunk of that file (the law of .ikiro/methods/apply-diffs.py).
"""
import difflib
import os
import sys

BEFORE, AFTER = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/")
HOME = "subsystems/typology/schematics"


def block(short):
    old = open(f"{BEFORE}/{HOME}/{short}").read().split("\n")
    new = open(f"{AFTER}/{HOME}/{short}").read().split("\n")
    if old == new:
        return None
    changes = [code for code in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes() if code[0] != "equal"]
    original = "\n".join(old)
    staged = original
    out = []
    floor = 0
    for _, i1, i2, j1, j2 in changes:
        above = 1 if i1 == i2 else 0
        while True:
            taken = old[i1 - above:i2]
            anchor = "\n".join(taken)
            if original.count(anchor) == 1 and staged.count(anchor) == 1:
                break
            above += 1
            if i1 - above < floor:
                raise SystemExit(f"{short}:{i1 + 1} no unique anchor below the hunk above it")
        context = old[i1 - above:i1]
        rows = [f"// {HOME}/{short}:{i1 - above + 1}"]
        rows += [(" " + row) if row else "" for row in context]
        rows += ["-" + row for row in old[i1:i2]]
        rows += ["+" + row for row in new[j1:j2]]
        out.append("\n".join(rows))
        staged = staged.replace(anchor, "\n".join(context + new[j1:j2]), 1)
        floor = i2
    return "#+BEGIN_SRC diff\n" + "\n…\n".join(out) + "\n#+END_SRC"


for folder, _, files in sorted(os.walk(f"{AFTER}/{HOME}")):
    if "/bak" in folder:
        continue
    for name in sorted(files):
        if not name.endswith(".js"):
            continue
        short = os.path.relpath(os.path.join(folder, name), f"{AFTER}/{HOME}")
        if not os.path.exists(f"{BEFORE}/{HOME}/{short}"):
            continue
        held = block(short)
        if held:
            print(held + "\n")
