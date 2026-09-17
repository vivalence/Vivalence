"""compact-index — regenerate `.ikiro/compacts/index.md`: a roster of STABLE ids.

    python3 .ikiro/methods/compact-index.py

A compact's id is its `#+index:` property. The first run that sees a compact without one stamps
max+1 into the file, so an id never moves once assigned (alphabetical numbering rotted every numeric
citation in frontier · known-issues · memory within a day — two folds logged it). Cite compacts as
`#<id> <slug-prefix…>`; the id survives inserts and renames, the prefix survives a lost index.

The `## by tag` fold is GONE (beef: *"i no longer want to sustain this. too much time in updates,
not enough payback"* — `compacts/MARKERS.md`, executed at the 09-21 selfimprove). `#+filetags:` is
no longer required or read; existing ones are left alone. The index is now derivable from the
directory alone, so nothing here needs curating.
"""
import os, re, collections

D = "/Users/finn/vivalence/code/vivalence/.ikiro/compacts"
files = sorted(f for f in os.listdir(D) if f.endswith(".org"))
docs = {f: open(os.path.join(D, f), encoding="utf-8", errors="replace").read() for f in files}
ids = {}
for f, t in docs.items():
    m = re.search(r"^#\+index:\s*(\d+)\s*$", t, re.M)
    if m: ids[f] = int(m.group(1))
dupes = [i for i, c in collections.Counter(ids.values()).items() if c > 1]
assert not dupes, f"duplicate #+index ids: {dupes}"
nxt = max(ids.values(), default=0) + 1
stamped = 0
for f in files:
    if f in ids: continue
    t = docs[f]
    m = re.search(r"^#\+(?:filetags|title):.*$", t, re.M)   # after filetags if present, else title
    line = f"#+index: {nxt}"
    t = t[:m.end()] + "\n" + line + t[m.end():] if m else line + "\n" + t
    open(os.path.join(D, f), "w", encoding="utf-8").write(t)
    docs[f] = t; ids[f] = nxt; nxt += 1; stamped += 1

out = ["# compacts — the roster", "",
       "> Derived — `python3 .ikiro/methods/compact-index.py` regenerates it whole; never hand-patch. One line per compact: its `#+index:` id and its slug. The id is stamped once and never moves, so a citation `#<id> <slug-prefix…>` survives inserts, renames and a lost index. The tag fold was retired at the 09-21 selfimprove on beef's order — enter by id, by slug, or by grepping the directory.",
       "", "## compacts", ""]
out += [f"{ids[f]}. `{os.path.splitext(f)[0]}`" for f in sorted(files, key=lambda f: ids[f])]
open(os.path.join(D, "index.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print(f"{len(files)} compacts · {stamped} ids stamped · next id {nxt}")
