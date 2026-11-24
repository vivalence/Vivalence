"""cast — the worked copy against the pristine copy, as the quest's blocks.

    python3 cast.py <pristine> <worked> <path> ...

A file absent from the pristine copy prints whole as a `:tangle` block; an edited one as one
`#+BEGIN_SRC diff` block, its sub-hunks split by `…`.
"""
import difflib, os, sys

base, worked, paths = sys.argv[1], sys.argv[2], sys.argv[3:]
for path in paths:
    new = open(os.path.join(worked, path), encoding="utf-8").read().split("\n")
    if not os.path.exists(os.path.join(base, path)):
        print(f"#+BEGIN_SRC js :tangle {path}")
        print("\n".join(new).rstrip("\n"))
        print("#+END_SRC\n")
        continue
    old = open(os.path.join(base, path), encoding="utf-8").read().split("\n")
    groups = list(difflib.SequenceMatcher(None, old, new, autojunk=False).get_grouped_opcodes(3))
    print("#+BEGIN_SRC diff")
    for index, group in enumerate(groups):
        if index: print("…")
        print(f"// {path}:{group[0][1] + 1}")
        for tag, i1, i2, j1, j2 in group:
            if tag == "equal":
                for line in old[i1:i2]: print(" " + line if line else "")
                continue
            for line in old[i1:i2]: print("-" + line)
            for line in new[j1:j2]: print("+" + line)
    print("#+END_SRC\n")
