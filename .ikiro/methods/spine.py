#!/usr/bin/env python3
"""spine — the compact walk's denominator: every beef turn of one session, numbered 1..N.

    python3 .ikiro/methods/spine.py <session-id>     # the session to fold — PASS IT; the scratchpad dir name IS it
    python3 .ikiro/methods/spine.py                  # newest transcript by mtime — reads a SIBLING when one is live

Reads ~/.claude/projects/-Users-finn-vivalence-code-vivalence/<session-id>.jsonl, complete and unsummarized.
Mid-turn interjections are `type: "queue-operation"`, not `user` — a user-only walk misses them (14 of 17 turns
at one fold). Dedupe is FULL text within 180 s: a queue echo is byte-identical; a prefix match ate a sibling
handoff once; a re-delivery past the window survives on purpose (beef repeating himself is data).
Prints the TAIL of long turns too — a quoted turn's order sits after the paste.
Canon: methods/compact.md (the walk) · skills/compact-walk (the runner). This file IS the extractor's spec.
"""
import json, os, sys, re, datetime

D = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")
NOISE = re.compile(
    r"^<(local-command-caveat|command-name|command-message|command-args|system-reminder|local-command-stdout|task-notification)"
    r"|^\[SYSTEM NOTIFICATION|^Stop hook feedback|^# /\w+ —|^\[Request interrupted by user\]"
    r"|^Base directory for this skill:|^Launching skill:"
)


def when(s):
    try:
        return datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
    except Exception:
        return 0.0


def transcript(sid):
    if sid:
        return os.path.join(D, sid + ".jsonl")
    return max((os.path.join(D, f) for f in os.listdir(D) if f.endswith(".jsonl")), key=os.path.getmtime)


def turns(path):
    raw = []
    for i, line in enumerate(open(path, encoding="utf-8", errors="replace")):
        try:
            e = json.loads(line)
        except Exception:
            continue
        t = e.get("type"); ts = e.get("timestamp") or ""
        txt = None
        if t == "queue-operation" and e.get("content"):
            txt = e["content"]
        elif t == "user":
            c = e.get("message", {}).get("content")
            if isinstance(c, str):
                txt = c
            elif isinstance(c, list):
                txt = " ".join(b.get("text", "") for b in c if isinstance(b, dict) and b.get("type") == "text")
        if not txt or not txt.strip():
            continue
        txt = txt.strip()
        if NOISE.match(txt):
            continue
        raw.append((i, ts, when(ts), t, txt))
    kept = []
    for r in raw:
        if any(r[4] == k[4] and abs(r[2] - k[2]) < 180 for k in kept):
            continue
        kept.append(r)
    return raw, kept


if __name__ == "__main__":
    sid = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else None
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__); sys.exit(0)
    path = transcript(sid)
    if not sid:
        print(f"WARNING no session id — reading the newest transcript {os.path.basename(path)}; a live sibling can be newer than you", file=sys.stderr)
    raw, kept = turns(path)
    print(f"BEEF TURNS: {len(kept)}  (raw {len(raw)}, {len(raw) - len(kept)} queue duplicates collapsed)  {os.path.basename(path)}")
    for n, (i, ts, _, t, txt) in enumerate(kept, 1):
        flat = " ".join(txt.split())
        tail = " … " + flat[-90:] if len(flat) > 208 else ""
        print(f"{n:3}. {ts[11:19]} {'MID-TURN' if t == 'queue-operation' else 'prompt  '} [{len(txt):5}ch] {flat[:118]}{tail}")
