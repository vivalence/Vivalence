"""materialize — every NEW file of one quest section, written whole onto a COPY.

    python3 materialize.py <quest.org> "<section heading>" --root <dir> [--write] [--spill <dir>] [--replace <path> …]

`--spill <dir>` copies every `exists` block (a whole-file block over a live file, text differing) under <dir> for a diff;
`--replace <path> …` names the ones whose block wins (REPLACED). `~/…` paths are the shelf: listed, never written here.

A new file is a `#+BEGIN_SRC js|ts|jsx|jsonc` block whose path is, in order: `:tangle <path>` on the BEGIN line (m83) ·
its first line `// <path>` (no `:line`) · the heading chain `*** <system>` · `**** <directory>` · `***** <file>` (m88's shape).
A `****` that already carries its system (`**** subsystems/paladin/belt`, m83) or is `(root)` is not prefixed again
(REJECTED 10-21: m83 landed under `subsystems/subsystems/…`).
A block holding a `…` line or a `:line` head is a sketch over an existing file: skipped, listed. An existing file is never
overwritten (apply-diffs owns edits). `--root` is REQUIRED: this writes product files, never on the repo.
"""
import re, sys, os

if "--root" not in sys.argv: sys.exit("materialize: --root <copy> is required")
ROOT = sys.argv[sys.argv.index("--root") + 1].rstrip("/") + "/"
quest, section = sys.argv[1], sys.argv[2]
write = "--write" in sys.argv

text = open(quest, encoding="utf-8").read().split("\n")
start = next(i for i, line in enumerate(text) if line.strip() == section)
depth = len(section) - len(section.lstrip("*"))
end = next((i for i in range(start + 1, len(text)) if re.match(r"^\*{1,%d} " % depth, text[i])), len(text))

chain = {}
blocks = []
i = start
while i < end:
    line = text[i]
    m = re.match(r"^(\*{3,5}) (.+)$", line)
    if m:
        level = len(m.group(1))
        name = re.sub(r" new$", "", re.split(r" [—(]| =", m.group(2))[0].strip().strip("=")).rstrip("/")
        chain[level] = name
        for deeper in [k for k in chain if k > level]: del chain[deeper]
    if re.match(r"^#\+begin_src (js|ts|jsx|jsonc)\b", line.strip().lower()):
        tangle = re.search(r":tangle (\S+)", line)
        j = i + 1
        while text[j].strip().lower() != "#+end_src": j += 1
        body = text[i + 1 : j]
        head = re.match(r"^// ([^\s:]+)(:[\d,]+)?(\s|$)", body[0]) if body else None
        if tangle: kind, path = "new", re.sub(r"^(\.\./)+", "", tangle.group(1))
        elif head and head.group(2): kind, path = "sketch", head.group(1)
        elif head and "/" in head.group(1): kind, path = "new", head.group(1); body = body[1:]
        elif all(k in chain for k in (3, 4, 5)):
            directory = chain[5] if chain[4] == "(root)" else f"{chain[4]}/{chain[5]}"
            rooted = chain[4] == "(root)" or chain[4].startswith(chain[3] + "/") or chain[4].split("/")[0] in ("systems", "subsystems", "commons", "documentation")
            kind, path = "new", directory if rooted else f"{chain[3]}/{directory}"
        else: kind, path = "unplaced", (body[0] if body else "")
        if any(b.strip() == "…" for b in body): kind = "sketch"
        if kind == "new" and any(re.match(r"^// (systems|subsystems|commons|~/\.viva)/\S+", b) for b in body): kind = "collage"
        if path.startswith("~/"): kind = "shelf"
        blocks.append((kind, path, "\n".join(body).rstrip("\n") + "\n"))
        i = j
    i += 1

def flag(name):
    if name not in sys.argv: return []
    rest = sys.argv[sys.argv.index(name) + 1 :]
    return rest[: next((k for k, a in enumerate(rest) if a.startswith("--")), len(rest))]

spill = (flag("--spill") or [None])[0]
replace = set(flag("--replace"))
written = skipped = kept = replaced = 0
for kind, path, body in blocks:
    full = ROOT + path
    if kind != "new": print(f"{kind:8s} {path[:100]}"); skipped += 1; continue
    if os.path.exists(full) and path not in replace:
        same = open(full, encoding="utf-8").read() == body
        print(f"{'same' if same else 'exists':8s} {path}"); kept += 1
        if spill and not same:
            os.makedirs(os.path.dirname(spill + "/" + path), exist_ok=True)
            open(spill + "/" + path, "w", encoding="utf-8").write(body)
        continue
    verb = "REPLACED" if os.path.exists(full) else ("WROTE" if write else "new")
    if write:
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, "w", encoding="utf-8").write(body)
    print(f"{verb:8s} {path}")
    if verb == "REPLACED": replaced += 1
    else: written += 1
print(f"\nnew {written} · replaced {replaced} · exists {kept} · skipped {skipped} · {'WRITTEN' if write else 'dry'}")
