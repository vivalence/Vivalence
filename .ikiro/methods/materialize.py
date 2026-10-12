"""materialize — every NEW file of one quest section, written whole onto a COPY.

    python3 materialize.py <quest.org> "<section heading>" --root <dir> [--write]

A new file is a `#+BEGIN_SRC js|ts|jsx|jsonc` block whose path is its first line `// <path>` (no `:line`), or — when the
block opens with code — the heading chain above it: `*** <system>` · `**** <directory>` · `***** <file>` (m88's shape).
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
        name = re.split(r" [—(]| =", m.group(2))[0].strip().strip("=")
        chain[level] = name
        for deeper in [k for k in chain if k > level]: del chain[deeper]
    if re.match(r"^#\+begin_src (js|ts|jsx|jsonc)\b", line.strip().lower()):
        j = i + 1
        while text[j].strip().lower() != "#+end_src": j += 1
        body = text[i + 1 : j]
        head = re.match(r"^// (\S+?)(:\d+)?(\s|$)", body[0]) if body else None
        if head and head.group(2): kind, path = "sketch", head.group(1)
        elif head and "/" in head.group(1): kind, path = "new", head.group(1); body = body[1:]
        elif all(k in chain for k in (3, 4, 5)): kind, path = "new", f"{chain[3]}/{chain[4]}/{chain[5]}"
        else: kind, path = "unplaced", (body[0] if body else "")
        if any(b.strip() == "…" for b in body): kind = "sketch"
        blocks.append((kind, path, "\n".join(body).rstrip("\n") + "\n"))
        i = j
    i += 1

written = skipped = kept = 0
for kind, path, body in blocks:
    full = ROOT + path
    if kind != "new": print(f"{kind:8s} {path[:100]}"); skipped += 1; continue
    if os.path.exists(full): print(f"exists   {path}"); kept += 1; continue
    if write:
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, "w", encoding="utf-8").write(body)
    print(f"{'WROTE' if write else 'new':8s} {path}"); written += 1
print(f"\nnew {written} · exists {kept} · skipped {skipped} · {'WRITTEN' if write else 'dry'}")
