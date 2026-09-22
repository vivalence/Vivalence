#!/usr/bin/env python3
"""channels — which ikiro file reached which session, and by which channel (m69 1.2).

    python3 .ikiro/methods/channels.py                                  # the last 60 transcripts, now
    python3 .ikiro/methods/channels.py --last 40 --wake                 # + wake tokens of the first assistant turn
    python3 .ikiro/methods/channels.py --at 2026-09-23T16:53:00Z        # the window exactly as it stood at a moment
    python3 .ikiro/methods/channels.py --reads                          # the 09-23 terrain probe: deliberate reads only
    python3 .ikiro/methods/channels.py --json                           # one row per session

A file matters only through the channel that loads it (the m69 law). Three channels, all read from the transcript:
    launch   an `instructions` attachment — CLAUDE.md or a `.claude/rules` file with no `paths:` (loads at launch,
             reloads at /compact)
    path     a `nested_memory` attachment — a `.claude/rules` file whose `paths:` glob matched a file the session read
    hook     a `hook_additional_context` marked `rules via outside-rules.py: <file>` — the same `paths:` applied OUTSIDE
             the repo root, where the path channel never fires (hooks/outside-rules.py)
    read     a Read tool call, or a Bash verb (cat · sed · head · tail · grep · awk · rg · wc) naming the file
SAW = any of the three. RELEVANT = the session touched the file's `paths:` (a file with none is relevant to every
session). The ratio SAW/RELEVANT is the census; a persistent file below ~1 is a file that does not exist.

--at T rebuilds a past window: each transcript is cut at T, ordered by its last event at or before T (the mtime
it had at T), and the last N kept — so a number measured once can be reproduced after the sessions moved on.
"""
import fnmatch, glob, json, os, re, statistics, sys
from datetime import datetime, timezone

PROJECT = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
IKIRO = os.path.join(PROJECT, ".ikiro")
RULES = os.path.join(PROJECT, ".claude", "rules")
TRANSCRIPTS = os.path.expanduser("~/.claude/projects/" + re.sub(r"[^A-Za-z0-9]", "-", PROJECT))
VERBS = ("cat", "sed", "head", "tail", "grep", "awk", "rg", "wc", "less", "bat")
TERRAIN = ["ikiro.md", "self/rituals.md", "self/connoisseur.md", "self/lexicon.md", "self/ontology.md",
           "self/identity.md", "world/map.md", "world/ledger.md", "world/frontier.md", "manual.md", "zettelkasten.md",
           "known-issues.org", "quests/index.md"]


def argument(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def canonical(path):
    """any spelling of an ikiro file → its path relative to .ikiro/, symlinks resolved (rules/ikiro.md → ikiro.md)."""
    path = path.replace(RULES + "/", IKIRO + "/world/codemap/").replace("/.claude/rules/", "/.ikiro/world/codemap/")
    if "/.ikiro/" not in path:
        return None
    absolute = os.path.join(IKIRO, path.split("/.ikiro/", 1)[1])
    resolved = os.path.realpath(absolute)
    return os.path.relpath(resolved, os.path.realpath(IKIRO)) if resolved.startswith(os.path.realpath(IKIRO)) else None


def rules():
    """every file the rules channel can load: rel path → its `paths:` globs ([] = loads at launch)."""
    found = {}
    for entry in sorted(glob.glob(os.path.join(RULES, "**", "*.md"), recursive=True)):
        text = open(entry, encoding="utf-8").read()
        front = re.match(r"^---\n(.*?)\n---", text, re.S)
        globs = re.findall(r'"([^"]+)"', re.search(r"paths:\s*(\[.*?\])", front.group(1), re.S).group(1)) \
            if front and "paths:" in front.group(1) else []
        found[canonical(entry)] = globs
    return found


def stamp(event):
    value = event.get("timestamp")
    return datetime.fromisoformat(value.replace("Z", "+00:00")) if value else None


def session(path, at):
    row = {"id": os.path.basename(path)[:8], "loaded": {}, "read": {}, "probe": set(), "touched": set(), "skills": [],
           "wake": None, "last": None}
    for line in open(path, encoding="utf-8", errors="replace"):
        try:
            event = json.loads(line)
        except ValueError:
            continue
        when = stamp(event)
        if at and when and when > at:
            break
        if when:
            row["last"] = when
        attachment = event.get("attachment") or {}
        if attachment.get("type") == "instructions":
            for item in attachment.get("files") or []:
                if canonical(item.get("path", "")):
                    row["loaded"].setdefault(canonical(item["path"]), "launch")
        if attachment.get("type") == "nested_memory" and canonical(attachment.get("path", "")):
            row["loaded"].setdefault(canonical(attachment["path"]), "path")
        if attachment.get("type") == "hook_additional_context":
            for name in re.findall(r"rules via outside-rules\.py: ([\w./-]+\.md)", " ".join(map(str, attachment.get("content") or []))):
                row["loaded"].setdefault(name, "hook")
        message = event.get("message") or {}
        usage = message.get("usage")
        if row["wake"] is None and usage and message.get("role") == "assistant":
            row["wake"] = sum(usage.get(k, 0) for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
        for block in message.get("content") or [] if isinstance(message.get("content"), list) else []:
            if not (isinstance(block, dict) and block.get("type") == "tool_use"):
                continue
            name, given = block.get("name"), block.get("input") or {}
            if name == "Skill":
                row["skills"].append(given.get("skill"))
            for key in ("file_path", "path", "notebook_path"):
                if isinstance(given.get(key), str):
                    row["touched"].add(given[key])
            if name == "Read" and canonical(given.get("file_path", "")):
                row["read"].setdefault(canonical(given["file_path"]), set()).add("Read")
            probe = given.get("file_path", "") if name == "Read" else given.get("command", "") if name == "Bash" else ""
            if re.search(r"(cat|sed|head|tail|grep|Read|awk)", f"{name} {probe}"):
                row["probe"].update(t for t in TERRAIN if f".ikiro/{t}" in probe)
            if name == "Bash":
                command = given.get("command", "")
                row["touched"].update(re.findall(r"[~\w./-]*/[\w./*-]+", command))
                for segment in re.split(r"\|\||&&|[;|\n]", command):
                    words = [w for w in segment.split() if "=" not in w.split("/")[0]]
                    verb = next((w for w in words if w in VERBS), None)
                    for token in re.findall(r"[\w./~-]*\.ikiro/[\w./-]+", segment):
                        target = canonical(token if token.startswith("/") else os.path.join(PROJECT, token.split(".ikiro/", 1)[0].lstrip("./"), ".ikiro/" + token.split(".ikiro/", 1)[1]))
                        if target and verb:
                            row["read"].setdefault(target, set()).add(verb)
    return row


def relevant(row, globs):
    if not globs:
        return True
    for touched in row["touched"]:
        candidates = {touched, os.path.relpath(touched, PROJECT) if touched.startswith("/") else touched.lstrip("./")}
        if any(fnmatch.fnmatch(c, g) or fnmatch.fnmatch(c, g.rstrip("*").rstrip("/") + "/*") for c in candidates for g in globs):
            return True
    return False


def window(last, at):
    rows = []
    for path in glob.glob(os.path.join(TRANSCRIPTS, "*.jsonl")):
        row = session(path, at)
        # a session that never took a turn loaded nothing (a bare /clear) — the census skips it; the terrain probe
        # (--reads) counted it, so it keeps it and its numbers stay reproducible
        if not row["last"] or (row["wake"] is None and "--reads" not in sys.argv):
            continue
        # the order a file had at T: its real mtime when nothing was written since (a transcript's mtime runs past its
        # last timestamped event — titles and prompts are written untimed), else its last event at or before T
        mtime = datetime.fromtimestamp(os.path.getmtime(path), timezone.utc)
        row["order"] = mtime if not at or mtime <= at else row["last"]
        rows.append(row)
    rows.sort(key=lambda r: r["order"])
    return rows[-last:]


if __name__ == "__main__":
    at = argument("--at", None)
    at = datetime.fromisoformat(at.replace("Z", "+00:00")).astimezone(timezone.utc) if at else None
    rows = window(int(argument("--last", 60)), at)
    n = len(rows)
    if "--json" in sys.argv:
        for r in rows:
            print(json.dumps({"session": r["id"], "last": r["last"].isoformat(), "wake": r["wake"], "loaded": r["loaded"],
                              "read": {k: sorted(v) for k, v in r["read"].items()}, "skills": r["skills"]}))
        sys.exit(0)
    print(f"window: {n} sessions · {rows[0]['last']:%m-%d %H:%M} → {rows[-1]['last']:%m-%d %H:%M} UTC" + (f" · cut at {at:%m-%d %H:%M}Z" if at else ""))
    if "--wake" in sys.argv:
        wake = [r["wake"] for r in rows if r["wake"]]
        print(f"wake tokens (first assistant turn, input + cache): median {int(statistics.median(wake))} · min {min(wake)} · max {max(wake)} · n {len(wake)}")
    if "--reads" in sys.argv:
        # the 09-23 terrain probe verbatim: a Read path, or a Bash command naming `.ikiro/<file>` with a verb ANYWHERE in
        # it (loose: `grep` elsewhere in a pipeline counts) — kept so the quest's numbers stay reproducible; the census
        # table below is the strict read (verb in the same segment as the path)
        print(f"{'probe':>5} {'strict':>6}  file")
        for target in TERRAIN:
            print(f"{sum(target in r['probe'] for r in rows):5} {sum(target in r['read'] for r in rows):6}  {target}")
        sys.exit(0)
    channel = rules()
    files = sorted(set(channel) | {f for r in rows for f in r["loaded"]} | set(TERRAIN))
    print(f"{'saw':>4} {'rel':>4} {'launch':>6} {'path':>5} {'hook':>5} {'read':>5}  file · channel · read verbs")
    for target in files:
        globs = channel.get(target)
        saw = sum(bool(target in r["loaded"] or target in r["read"]) for r in rows)
        rel = sum(relevant(r, globs or []) for r in rows)
        launch, path, hook = (sum(r["loaded"].get(target) == c for r in rows) for c in ("launch", "path", "hook"))
        read = sum(target in r["read"] for r in rows)
        verbs = sorted({v for r in rows for v in r["read"].get(target, ())})
        route = "rules, launch" if globs == [] else "rules, paths" if globs else "read only"
        print(f"{saw:4} {rel:4} {launch:6} {path:5} {hook:5} {read:5}  {target} · {route}" + (f" · {' '.join(verbs)}" if verbs else ""))
    fired = sorted({s for r in rows for s in r["skills"] if s})
    print(f"skills fired in window: {sum(len(r['skills']) for r in rows)} firings · {len(fired)} skills")
