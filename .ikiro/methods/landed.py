"""landed — for every `#+BEGIN_SRC diff` hunk of the m96 constituents, is its NEW text on the tree? (the validator's proof that a tangle LANDED)

    python3 landed.py [--root <tree>] [--quest <name>]      # default root: the repo; --quest filters by file name substring

A hunk is LANDED when its `+`/context text (the apply-diffs NEW side) occurs in the file; MOVED when the file is gone;
a hunk whose NEW side is empty (a pure deletion) is LANDED when its OLD side is absent. Whole-file blocks (`// <path>` without `:line`,
js/ts/jsx/jsonc fences) are LANDED when the path exists. One line per miss, a summary per quest section.
"""
import re, sys, os

ROOT = (sys.argv[sys.argv.index("--root") + 1].rstrip("/") + "/") if "--root" in sys.argv else "/Users/finn/vivalence/code/vivalence/"
ONLY = sys.argv[sys.argv.index("--quest") + 1] if "--quest" in sys.argv else ""
Q = "/Users/finn/vivalence/code/vivalence/.ikiro/quests/"
SPECS = [
    ("roadmap/m93-kleisli-remonadization.tangle.org", "* the tangle"),
    ("done/m83-tools-and-primer.tangle.org", "** repo — replayed with =--root= the repo (or a copy)"),
    ("done/m87-buffer-view-file.org", "* as code"),
    ("done/m88-repling.org", "* as code — one =****= per directory, =*****= per file, =ls= order (the loop closed; client modes' tangle → =reference/m88/stretch-one-tangle.org=, its paths died: =populate.js= · =ghost/lifecycle/client/*= · =belt/help.js=; the trace → =reference/m88/stretch-one-design.org=)"),
    ("done/m92-keymap.org", "* as code — the tangle IS the filesystem (=***= system · =****= directory · =*****= file)"),
    ("done/m96-client-mothership.org", "* as code — m96's own hunks"),
    ("done/m95-depincered-client.org", "* as code — the rulings as the hunks they build; =***= system · =****= file"),
]

def section(quest, heading):
    text = open(Q + quest, encoding="utf-8").read().split("\n")
    start = next((i for i, line in enumerate(text) if line.strip() == heading), None)
    if start is None: return []
    depth = len(heading) - len(heading.lstrip("*"))
    end = next((i for i in range(start + 1, len(text)) if re.match(r"^\*{1,%d} " % depth, text[i])), len(text))
    return text[start:end]

def blocks(body):
    out, i = [], 0
    while i < len(body):
        m = re.match(r"^\s*#\+begin_src\s+(\S+)", body[i], re.I)
        if m:
            j = i + 1
            while j < len(body) and not re.match(r"^\s*#\+end_src", body[j], re.I): j += 1
            out.append((m.group(1).lower(), body[i + 1 : j])); i = j
        i += 1
    return out

def hunks(block):
    head = block[0] if block else ""
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
        old, new, sub = [], [], head
        if part and re.match(r"^// \S+:\d+", part[0]): sub, part = part[0], part[1:]
        for line in part:
            if line == "": old.append(""); new.append("")
            elif line[0] == "-": old.append(line[1:])
            elif line[0] == "+": new.append(line[1:])
            elif line[0] == " ": old.append(line[1:]); new.append(line[1:])
            else: old.append(line); new.append(line)
        while old and new and old[-1] == "" and new[-1] == "": old.pop(); new.pop()
        if old != new: out.append(("\n".join(old).strip("\n"), "\n".join(new).strip("\n"), sub))
    return path, out

total = {"landed": 0, "missing": 0, "moved": 0, "files": 0, "files_missing": 0}
for quest, heading in SPECS:
    if ONLY and ONLY not in quest: continue
    body = section(quest, heading)
    landed = missing = moved = files = files_missing = 0
    for lang, block in blocks(body):
        if not block: continue
        if lang == "diff":
            path, hs = hunks(block)
            if path is None: continue
            full = ROOT + path
            if not os.path.exists(full):
                moved += len(hs); print(f"MOVED    {quest.split('/')[-1].split('-')[0]} {path} ({len(hs)} hunks)"); continue
            content = open(full, encoding="utf-8", errors="replace").read()
            for old, new, sub in hs:
                if new and new in content: landed += 1
                elif not new and old and old not in content: landed += 1
                else: missing += 1; print(f"MISSING  {quest.split('/')[-1].split('-')[0]} {sub[:110]}")
        elif lang in ("js", "ts", "jsx", "tsx", "jsonc", "json", "css", "md"):
            m = re.match(r"^// (\S+)\s*$", block[0]) or re.match(r"^// (\S+?)\s+[—←(]", block[0])
            if not m or ":" in m.group(1): continue
            path = m.group(1)
            if "~/" in path or path.startswith("D/"): continue
            files += 1
            if not os.path.exists(ROOT + path): files_missing += 1; print(f"NO FILE  {quest.split('/')[-1].split('-')[0]} {path}")
    print(f"== {quest} :: {heading[:50]} — hunks landed {landed} · missing {missing} · moved {moved} · files {files} · no file {files_missing}")
    for k, v in zip(total, (landed, missing, moved, files, files_missing)): total[k] += v
print(f"\nTOTAL hunks landed {total['landed']} · missing {total['missing']} · moved {total['moved']} · whole files {total['files']} · no file {total['files_missing']}")
