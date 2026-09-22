#!/usr/bin/env python3
# PostToolUse[Read|Edit|Write|Grep|Glob|Bash] — the `.claude/rules` channel for paths OUTSIDE the repo root (m69 2.3).
# Claude Code matches a rule's `paths:` only inside the project: probe 09-23, a Read of
# ~/.viva/registry/chess/package.viva.js loaded nothing, so `world/ledger.md` (`**/.viva/**`), `codemap/assembly.md`
# and `codemap/education.md` never arrived by path in 60 sessions. This hook applies the SAME `paths:` globs to the
# absolute paths a tool touched outside the repo and injects each matching shard once per session as
# additionalContext, marked `<!-- rules via outside-rules.py: <file> -->` so methods/channels.py can count it.
# Observe-and-inform only: it never blocks, and it stays silent on any path inside the repo (that channel works).
import fnmatch, glob, json, os, re, sys

event = json.load(sys.stdin)
project = os.environ.get("CLAUDE_PROJECT_DIR", event.get("cwd", os.getcwd()))
given = event.get("tool_input") or {}
touched = [given[k] for k in ("file_path", "path", "notebook_path") if isinstance(given.get(k), str)]
touched += re.findall(r"(?:~|/Users/[^/\s]+)/\.viva[\w./-]*", given.get("command", "") if isinstance(given.get("command"), str) else "")
outside = [p for p in (os.path.expanduser(t) for t in touched) if os.path.isabs(p) and not p.startswith(project + os.sep)]
if not outside:
    sys.exit(0)

# ONE shard per tool call, the most specific glob first: a 20.5 KB injection (three shards at once) was persisted to a
# file and the model saw a 2 KB preview (probe 0f8e4f98) — the next matching shard rides the next tool call.
CAP = 9000
stamps = os.path.join(os.environ.get("TMPDIR", "/tmp"), "ikiro-outside-rules", event.get("session_id", "nosession"))
os.makedirs(stamps, exist_ok=True)
candidates = []
for rule in sorted(glob.glob(os.path.join(project, ".claude", "rules", "**", "*.md"), recursive=True)):
    text = open(rule, encoding="utf-8").read()
    front = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    globs = re.findall(r'"([^"]+)"', front.group(1)) if front and "paths:" in front.group(1) else []
    hits = [g for p in outside for g in globs if g.startswith("**/") and (fnmatch.fnmatch(p, g) or fnmatch.fnmatch(p + "/", g))]
    name = os.path.relpath(os.path.realpath(rule), os.path.realpath(os.path.join(project, ".ikiro")))
    if hits and not os.path.exists(os.path.join(stamps, name.replace("/", "__"))):
        candidates.append((-max(len(g.replace("*", "")) for g in hits), name, text[front.end():]))
if candidates:
    _, name, body = sorted(candidates)[0]
    open(os.path.join(stamps, name.replace("/", "__")), "w").close()
    if len(body) > CAP:
        body = body[: body.rfind("\n", 0, CAP)] + f"\n… cut at {CAP} chars — Read .ikiro/{name} for the rest."
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                             "additionalContext": f"<!-- rules via outside-rules.py: {name} -->\n{body}"}}))
