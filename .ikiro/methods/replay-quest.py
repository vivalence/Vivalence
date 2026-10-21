"""replay-quest — one quest's tangle on ONE copy: its Moves (mkdir -p · mv) and Deletes tables, then materialize, then apply-diffs.
# limit: 3000 chars

    python3 .ikiro/methods/replay-quest.py <quest.org> "<section heading>" --root <copy> [--write]

The tables are the section's own `| =from= | =to= | … |` rows under "Moves" and `| =path= | … |` rows under "Deletes".
--root is REQUIRED and is never the repo (the replay law). Order of quests is the caller's: m102 → m98 → m99.
"""
import os, re, subprocess, sys

if "--root" not in sys.argv: sys.exit("replay-quest: --root <copy> is required (a fresh copy, never the repo)")
quest, section = sys.argv[1], sys.argv[2]
root = os.path.abspath(sys.argv[sys.argv.index("--root") + 1])
repo = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root == repo: sys.exit("replay-quest: --root is the repo — refused")
write = "--write" in sys.argv

text = open(quest, encoding="utf-8").read().split("\n")
start = next(i for i, line in enumerate(text) if line.strip() == section)
end = next((i for i in range(start + 1, len(text)) if re.match(r"^\* ", text[i])), len(text))
table, moves, deletes = None, [], []
for line in text[start:end]:
    if line.startswith("Moves"): table = moves
    elif line.startswith("Deletes"): table = deletes
    elif line.startswith("***"): break
    elif table is not None and re.match(r"^\| =", line):
        cells = [cell.strip().strip("=") for cell in line.strip("|").split("|")]
        table.append(cells[:2] if table is moves else cells[:1])

for source, target in moves:
    print(f"mv {source} → {target}")
    if write:
        os.makedirs(os.path.dirname(os.path.join(root, target)), exist_ok=True)
        os.rename(os.path.join(root, source), os.path.join(root, target))
for (path,) in deletes:
    print(f"rm {path}")
    if write: os.remove(os.path.join(root, path))
methods = os.path.dirname(os.path.abspath(__file__))
flags = ["--root", root] + (["--write"] if write else [])
for tool in ("materialize.py", "apply-diffs.py"):
    run = subprocess.run([sys.executable, os.path.join(methods, tool), quest, section, *flags], capture_output=True, text=True)
    print(run.stdout.strip().split("\n")[-1])
    if run.returncode: sys.exit(run.stderr)
print(f"moves {len(moves)} · deletes {len(deletes)} · {'WRITTEN' if write else 'dry'}")
