"""compact-index — regenerate `.ikiro/compacts/index.md` with STABLE ids.

    python3 .ikiro/methods/compact-index.py

A compact's id is its `#+index:` property. The first run that sees a compact without one stamps
max+1 into the file, so an id never moves once assigned (alphabetical numbering rotted every numeric
citation in frontier · known-issues · memory within a day — two folds logged it). Cite compacts as
`#<id> <slug-prefix…>`; the id survives inserts and renames, the prefix survives a lost index.
"""
import os, re, collections

D = "/Users/finn/vivalence/code/vivalence/.ikiro/compacts"
files = sorted(f for f in os.listdir(D) if f.endswith(".org"))
docs = {}
for f in files:
    docs[f] = open(os.path.join(D, f), encoding="utf-8", errors="replace").read()
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
    m = re.search(r"^#\+filetags:.*$", t, re.M)
    line = f"#+index: {nxt}"
    t = t[:m.end()] + "\n" + line + t[m.end():] if m else line + "\n" + t
    open(os.path.join(D, f), "w", encoding="utf-8").write(t)
    docs[f] = t; ids[f] = nxt; nxt += 1; stamped += 1

tags = collections.defaultdict(list); notag = []
for f in files:
    i = ids[f]
    m = re.search(r"^#\+filetags:\s*(.+)$", docs[f], re.M | re.I)
    if not m: notag.append(i); continue
    for tag in [x for x in m.group(1).strip().strip(":").split(":") if x]:
        tags[tag].append(i)
for v in tags.values(): v.sort()

out = ["# compacts — tag index", "",
       "> Derived — `python3 .ikiro/methods/compact-index.py` regenerates it; never hand-patch. Ids are each compact's `#+index:` property and never move. Cite `#<id> <slug-prefix…>`. Enter by tag; a compact nobody can find is not a record.",
       "", "## by tag", ""]
for tag in sorted(tags, key=lambda t: (-len(tags[t]), t)):
    if len(tags[tag]) > 1: out.append(f"- **{tag}** — {', '.join(map(str, tags[tag]))}")
singles = sorted(t for t in tags if len(tags[t]) == 1)
out += ["", f"- *singletons* — {' · '.join(f'{t} {tags[t][0]}' for t in singles)}", ""]
if notag: out.append(f"> UNTAGGED (findable only by id): {', '.join(map(str, sorted(notag)))}\n")
out += ["## compacts", ""] + [f"{ids[f]}. `{os.path.splitext(f)[0]}`" for f in sorted(files, key=lambda f: ids[f])]
open(os.path.join(D, "index.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print(f"{len(files)} compacts · {len(tags)} tags · {len(notag)} untagged · {stamped} ids stamped · next id {nxt}")
