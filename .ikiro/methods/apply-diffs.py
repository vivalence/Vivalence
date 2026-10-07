"""apply-diffs — every `#+BEGIN_SRC diff` hunk of one quest section as an exact-text replacement.

    python3 apply-diffs.py <quest.org> "<section heading>" [--write] [--root <dir>] [--skip path ...]

`--root` lands on a COPY (the replay law: a fresh copy, never the repo); without it the root is the repo.
REJECTED 10-08: a hard-coded root — a replay run from a copy with --write landed 11 ghost files in the repo.

A block's first line is `// <path>:<line> …`; `…` lines split sub-hunks; `-`/`+`/` ` prefixes are old/new/context,
an empty line is empty context. Per file: every anchor must match exactly once BEFORE anything is written
(apply-diffs law). Misses are listed by file and hunk head.
"""
import re, sys

ROOT = (sys.argv[sys.argv.index("--root") + 1].rstrip("/") + "/") if "--root" in sys.argv else "/Users/finn/vivalence/code/vivalence/"
quest, section = sys.argv[1], sys.argv[2]
write = "--write" in sys.argv
skip = set(sys.argv[sys.argv.index("--skip") + 1 :]) - {"--root"} if "--skip" in sys.argv else set()

text = open(quest, encoding="utf-8").read().split("\n")
start = next(i for i, line in enumerate(text) if line.strip() == section)
depth = len(section) - len(section.lstrip("*"))
end = next((i for i in range(start + 1, len(text)) if re.match(r"^\*{1,%d} " % depth, text[i])), len(text))
body = text[start:end]

blocks, i = [], 0
while i < len(body):
    if body[i].strip().lower() == "#+begin_src diff":
        j = i + 1
        while body[j].strip().lower() != "#+end_src": j += 1
        blocks.append(body[i + 1 : j]); i = j
    i += 1

def hunks(block):
    head = block[0]
    m = re.match(r"^// (\S+?):(\d+)", head)
    if not m: return None, []
    path = m.group(1)
    parts, cur = [], []
    for line in block[1:]:
        if line.strip() == "…": parts.append(cur); cur = []
        else: cur.append(line)
    parts.append(cur)
    out = []
    for part in parts:
        old, new = [], []
        for line in part:
            if line == "": old.append(""); new.append("")
            elif line[0] == "-": old.append(line[1:])
            elif line[0] == "+": new.append(line[1:])
            elif line[0] == " ": old.append(line[1:]); new.append(line[1:])
            else: old.append(line); new.append(line)
        while old and new and old[-1] == "" and new[-1] == "": old.pop(); new.pop()
        if old != new: out.append(("\n".join(old), "\n".join(new), head))
    return path, out

per_file = {}
for block in blocks:
    path, hs = hunks(block)
    if not path or path in skip: continue
    per_file.setdefault(path, []).extend(hs)

landed = missed = 0
for path, hs in per_file.items():
    full = ROOT + path
    try: content = open(full, encoding="utf-8").read()
    except FileNotFoundError: print(f"MISSING FILE {path}"); missed += len(hs); continue
    everywhere = "--replace-all" in sys.argv
    faults = [(h[2], content.count(h[0])) for h in hs if content.count(h[0]) != 1 and not (everywhere and content.count(h[0]) > 1)]
    if faults:
        for head, n in faults: print(f"MISS {n}x  {head}")
        missed += len(faults); print(f"  → {path}: {len(hs) - len(faults)}/{len(hs)} would land, NOTHING WRITTEN"); continue
    if write:
        seen = set()
        for old, new, head in hs:
            if old in seen: continue
            seen.add(old)
            n = content.count(old)
            if n > 1: print(f"  ×{n}  {head}")
            content = content.replace(old, new) if n > 1 else content.replace(old, new, 1)
        open(full, "w", encoding="utf-8").write(content)
    landed += len(hs)
    print(f"{'LANDED' if write else 'ok    '} {len(hs):3d}  {path}")
print(f"\nfiles {len(per_file)} · hunks landed {landed} · missed {missed} · {'WRITTEN' if write else 'dry'}")
