#!/usr/bin/env python3
"""handoff — the frontier is DERIVED from the newest `* handoff` of every live quest, never hand-written (m69 3.2).

    python3 .ikiro/methods/handoff.py            # print the frontier the handoffs derive
    python3 .ikiro/methods/handoff.py --write    # write it to world/frontier.md
    python3 .ikiro/methods/handoff.py --check    # exit 1 unless world/frontier.md is byte-identical to the derivation
    python3 .ikiro/methods/handoff.py --latest   # the newest handoff block verbatim — what a fresh session reads first
    python3 .ikiro/methods/handoff.py --owed     # every live owed item in full, with the handoff that carries it

/"reset beats summarize"/ — a compact ENDS in a handoff: org description lines, one fact each, keys repeatable.

    * handoff
    - quest :: m67-assembly-ontology      ← opens a block; a block with no quest line belongs to `none` (session-level)
    - goal :: what the order is, beef verbatim where it is one
    - done :: what landed, with the evidence path
    - next :: the one next step — a command, a `path:LINE`
    - never :: a ruling that must not be undone
    - owed :: what beef owes — a ruling, a commit, a walk
    - settles :: #210                     ← a session-level block this handoff closes (its owed paid, its next landed)

A QUEST block is live while `quests/<quest>.org` sits at the root (not done/ discarded/ benched/); the newest
(`#+index:`) per quest wins, so a quest that left the root drops out by itself. A SESSION block (`none`) is one per
compact — two sessions' owed items never evict each other (09-23: #210's block would have replaced every carried
item) — and it stays live until a later handoff names it in `settles`. The drain is upstream, never an edit here;
the frontier's 15% baseline is the backpressure that forces the settling.
"""
import glob, os, re, sys

IKIRO = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()), ".ikiro")
KEYS = ("goal", "done", "next", "never", "owed", "settles")
HEADER = ("# frontier — the live edge\n"
          "<!-- writer: methods/handoff.py, derived — never hand-edited · kind: throughput · limit: 5000 chars · "
          "drain: settle the handoff -->\n"
          "One line per live handoff. In full: `handoff.py --owed` · `--latest`.\n")


def handoffs():
    for path in glob.glob(os.path.join(IKIRO, "compacts", "*.org")):
        text = open(path, encoding="utf-8").read()
        section = re.search(r"^\* handoff[^\n]*\n(.*?)(?=^\* |\Z)", text, re.S | re.M)
        index = re.search(r"^#\+index:\s*(\d+)", text, re.M)
        if not section:
            continue
        block = {"quest": "none", "index": int(index.group(1)) if index else 0, "compact": os.path.basename(path)}
        for key, value in re.findall(r"^- (\w+) :: (.+)$", section.group(1), re.M):
            if key == "quest":
                if len(block) > 3 or block["quest"] != "none":
                    yield block
                block = {"quest": value.strip(), "index": block["index"], "compact": block["compact"]}
            elif key in KEYS:
                block.setdefault(key, []).append(value.strip())
        if len(block) > 3 or block["quest"] != "none":
            yield block


def live(quest):
    return quest == "none" or os.path.isfile(os.path.join(IKIRO, "quests", f"{quest}.org"))


def newest():
    blocks = list(handoffs())
    settled = {int(n) for b in blocks for value in b.get("settles", []) for n in re.findall(r"\d+", value)}
    chosen = {}
    for block in blocks:
        key = ("none", block["index"]) if block["quest"] == "none" else (block["quest"], 0)
        if block["quest"] == "none" and block["index"] in settled:
            continue
        if live(block["quest"]) and block["index"] >= chosen.get(key, {"index": -1})["index"]:
            chosen[key] = block
    return [chosen[k] for k in sorted(chosen, key=lambda k: (k[0] != "none", k[0], k[1]))]


def label(block):
    return "session" if block["quest"] == "none" else f"`{block['quest']}`"


def frontier():
    """a table of contents over the handoffs, not a copy of them — the owed text lives in its compact, so the
    frontier idles near its baseline and never blocks a fold over items only beef can settle."""
    lines = [HEADER]
    for block in newest():
        parts = [f"next: {' · '.join(block['next'])}"] if block.get("next") else []
        parts += [f"owed {len(block['owed'])}"] if block.get("owed") else []
        lines.append(f"- {label(block)} #{block['index']} — " + " — ".join(parts or ["nothing left"]))
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    target = os.path.join(IKIRO, "world", "frontier.md")
    derived = frontier()
    if "--owed" in sys.argv:
        for block in newest():
            for value in block.get("owed", []):
                print(f"{label(block)} #{block['index']}  {value}")
        sys.exit(0)
    if "--latest" in sys.argv:
        blocks = sorted(handoffs(), key=lambda b: b["index"])
        if blocks:
            top = blocks[-1]["index"]
            for block in (b for b in blocks if b["index"] == top):
                print(f"#{block['index']} {block['compact']} · quest {block['quest']}")
                for key in KEYS:
                    for value in block.get(key, []):
                        print(f"  {key:5} {value}")
        sys.exit(0)
    if "--check" in sys.argv:
        current = open(target, encoding="utf-8").read() if os.path.exists(target) else ""
        same = current == derived
        print("frontier: byte-identical to the handoffs" if same else "frontier: DRIFT — `handoff.py --write`, never a hand edit")
        sys.exit(0 if same else 1)
    if "--write" in sys.argv:
        open(target, "w", encoding="utf-8").write(derived)
    print(derived, end="")
