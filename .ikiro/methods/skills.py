#!/usr/bin/env python3
"""skills — what the discovery channel actually did, and what the ledger says about it.

    python3 .ikiro/methods/skills.py <session-id>   # this session: every Skill invocation, aligned to the spine turn
    python3 .ikiro/methods/skills.py --fold         # the board: usage x notes, never-fired, names that did not resolve
    python3 .ikiro/methods/skills.py --fold --since MM-DD   # firings since a date — the board's window, as in fires.py
    python3 .ikiro/methods/skills.py --fold <skill> # one skill's notes, verbatim

A skill that fires and teaches nothing back is a one-way channel. The transcript already holds the
firings (`tool_use` name=Skill, `input.skill`; the result carries `is_error` when the name did not
resolve) — that half is MECHANICAL and is read here, never recalled. The other half is judgment:
whether the skill carried the turn. That is written at the fold, one line per note, into the
append-only `skills/LEDGER.md`, and folded back here.

Verdicts, closed set: HELD (carried it) · GAP (right skill, missing beat) · STALE (contradicted by
disk) · MISFIRE (wrong skill for the turn) · MISSED (nothing fired, one should have).

Clock is LEDGER ENTRIES, never days and never compacts — compacts are prunable, and a skill unused
for a month of quests is not the same as one unused across thirty firings of its neighbours.
Canon: skills/LEDGER.md (the store) · skills/flywheel (step 6, the amendments) · skills/compact-walk (step 8b).
"""
import json, os, re, sys, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
IKIRO = os.path.dirname(HERE)
D = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")
LEDGER = os.path.join(IKIRO, "skills", "LEDGER.md")
VERDICTS = ["HELD", "GAP", "STALE", "MISFIRE", "MISSED"]
# - 09-22 `blast-bracket` GAP — registry packages have no beat in the radius table · #194
ENTRY = re.compile(r"^-\s+(\d{2}-\d{2})\s+`([^`]+)`\s+([A-Z]+)\s+[-—]+\s+(.*)$")
# | design-handoff | fc59f22c/115 | STALE | step 4 maps every hex to a token |
# Three folds on 09-23 pasted the compact's `** skills` table rows straight into the ledger; the line shape
# alone read 4 notes out of 27. The row carries no date, so it inherits the file's mtime day; `(none)` is a
# MISSED with no skill to answer it, filed under the first backticked skill the text names, else `(none)`.
ROW = re.compile(r"^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([A-Z]+)\s*\|\s*(.*?)\s*\|\s*$")
# - 09-23 AMENDED `design-handoff` (STALE) — step 4 rewritten … · flywheel 09-23
# An amendment CLOSES every earlier note of that skill and verdict: the board counts what is still open,
# else a landed amendment reads as one more complaint and re-fires at every flywheel after it.
# - fc59f22c/151 `debugging` MISSED — same trigger; cause found by grep · #206   (a third hand, the fold of #206)
WHERE = re.compile(r"^-\s+([0-9a-f]{8}/\d+|#\d+\s+t\d+)\s+`([^`]+)`\s+([A-Z]+)\s+[-—]+\s+(.*)$")
AMEND = re.compile(r"^-\s+(\d{2}-\d{2})\s+AMENDED\s+`([^`]+)`\s+\(([A-Z]+)\)\s+[-—]+\s+(.*)$")

sys.path.insert(0, HERE)
import spine  # noqa: E402  — the spine IS the turn numbering; never re-derive it


def firings(path):
    """Every Skill invocation in one transcript, in file order: (line, ts, name, error)."""
    pending, out = {}, []
    for i, line in enumerate(open(path, encoding="utf-8", errors="replace")):
        if '"Skill"' not in line and '"tool_result"' not in line:
            continue
        try:
            e = json.loads(line)
        except Exception:
            continue
        content = (e.get("message") or {}).get("content")
        if not isinstance(content, list):
            continue
        for b in content:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "tool_use" and b.get("name") == "Skill":
                name = (b.get("input") or {}).get("skill") or "?"
                pending[b.get("id")] = len(out)
                out.append([i, e.get("timestamp") or "", name, None])
            elif b.get("type") == "tool_result" and b.get("tool_use_id") in pending:
                out[pending.pop(b["tool_use_id"])][3] = bool(b.get("is_error"))
    return out


def roster():
    d = os.path.join(IKIRO, "skills")
    return {n: os.path.getmtime(os.path.join(d, n, "SKILL.md"))
            for n in sorted(os.listdir(d))
            if os.path.isfile(os.path.join(d, n, "SKILL.md"))}


def notes():
    if not os.path.exists(LEDGER):
        return []
    out = []
    day = datetime.date.fromtimestamp(os.path.getmtime(LEDGER)).strftime("%m-%d")
    for line in open(LEDGER, encoding="utf-8"):
        a = AMEND.match(line.rstrip())
        if a:
            date, skill, verdict, text = a.groups()
            out.append((date, skill, "AMENDED", f"({verdict}) {text}"))
            continue
        m = ENTRY.match(line.rstrip())
        if m:
            out.append(m.groups())  # (date, skill, verdict, text)
            continue
        w = WHERE.match(line.rstrip())
        if w:
            where, skill, verdict, text = w.groups()
            out.append((day, skill, verdict, f"{text} · {where}"))
            continue
        r = ROW.match(line.rstrip())
        if r and r.group(3) in VERDICTS:
            skill, where, verdict, text = r.groups()
            if skill == "(none)":
                named = re.search(r"`([a-z][a-z-]+)`", text)
                skill = named.group(1) if named else "(none)"
            out.append((day, skill, verdict, f"{text} · {where}"))
    return out


def corpus(since=None):
    """Every firing across every transcript — skills fire in sibling sessions too."""
    per = collections.defaultdict(lambda: {"n": 0, "sessions": set(), "last": "", "err": 0})
    for f in sorted(os.listdir(D)):
        if not f.endswith(".jsonl"):
            continue
        for _, ts, name, err in firings(os.path.join(D, f)):
            if since and ts[5:10] < since:
                continue
            r = per[name]
            r["n"] += 1
            r["sessions"].add(f[:8])
            r["last"] = max(r["last"], ts[:10])
            r["err"] += 1 if err else 0
    return per


def session(sid):
    path = spine.transcript(sid)
    if not sid:
        print(f"WARNING no session id — reading the newest transcript {os.path.basename(path)}; "
              "a live sibling can be newer than you", file=sys.stderr)
    _, kept = spine.turns(path)
    marks = [k[0] for k in kept]
    fired = firings(path)
    known = roster()
    print(f"SKILLS FIRED: {len(fired)}  ({len({f[2] for f in fired})} distinct, "
          f"{sum(1 for f in fired if f[3])} did not resolve)  {os.path.basename(path)}")
    if not fired:
        print("  none — a fold with no skills fired is data too: write the MISSED rows.")
    for line, ts, name, err in fired:
        n = sum(1 for m in marks if m < line)  # the beef turn this firing sits under
        where = "ikiro" if name in known else ("plugin" if ":" in name else "other")
        print(f"  turn {n:3}  {ts[11:19]}  {name:<34} {'ERROR — name did not resolve' if err else where}")
    print("\n-- paste into the compact's `** skills`, one row per firing, then add the MISSED rows --")
    print("| skill | turn | verdict | the line |")
    print("|---|---|---|---|")
    for line, _, name, err in fired:
        n = sum(1 for m in marks if m < line)
        print(f"| {name} | {n} | {'MISSED' if err else '?'} | {'name did not resolve' if err else ''} |")
    print(f"\nEvery non-HELD row is appended to {os.path.relpath(LEDGER, IKIRO)} — the compact is prunable, the ledger is not.")


def fold(only=None, since=None):
    ns = notes()
    if only:
        rows = [x for x in ns if x[1] == only]
        print(f"{only} — {len(rows)} notes")
        for date, _, verdict, text in rows:
            print(f"  {date} {verdict:<8} {text}")
        return
    known, used = roster(), corpus(since)
    if since:
        ns = [x for x in ns if x[0] >= since]
    by = collections.defaultdict(collections.Counter)
    amended = collections.Counter()
    for _, skill, verdict, text in ns:
        if verdict == "AMENDED":
            by[skill][text[1:text.index(")")]] = 0
            amended[skill] += 1
        else:
            by[skill][verdict] += 1
    ns = [x for x in ns if x[2] != "AMENDED"]
    window = f"since {since}" if since else "all-time"
    print(f"SKILLS BOARD — {len(known)} on disk · {sum(v['n'] for v in used.values())} firings {window} · "
          f"{len(ns)} ledger notes · {sum(amended.values())} amendments · verdict cells count OPEN notes\n")
    print(f"{'skill':<26}{'used':>5}{'sess':>5}  {'last':<11}" + "".join(f"{v:>8}" for v in VERDICTS) + f"{'AMENDED':>9}")
    for name in sorted(known, key=lambda s: -used.get(s, {"n": 0})["n"]):
        u = used.get(name)
        if not u:
            continue
        print(f"{name:<26}{u['n']:>5}{len(u['sessions']):>5}  {u['last']:<11}"
              + "".join(f"{by[name][v] or '·':>8}" for v in VERDICTS) + f"{amended[name] or '·':>9}")
    cold = [n for n in known if n not in used]
    if cold:
        # A ZERO IS A CLAIM. A skill with no firings is a dead trigger only once its clock has run;
        # before that it is a skill nobody has had the occasion to need. Read twice in one pass as a
        # defect (09-22: the three unresolved names, then `debugging` at 0 against a plugin's 20 —
        # all four newborn), so the board states which, and never leaves the reader to date it.
        print(f"\nNEVER FIRED ({len(cold)}) — clock is ledger notes since the skill was written, "
              f"never days; NEWBORN = no clock yet, not a finding")
        for name in sorted(cold):
            day = datetime.date.fromtimestamp(known[name]).strftime("%m-%d")
            quiet = sum(1 for d, *_ in ns if d > day)
            verdict = f"QUIET {quiet}" + ("  <- did its situation arise? then rewrite the trigger once"
                                           if quiet >= 10 else "") \
                if quiet else "NEWBORN"
            missed = f"  MISSED {by[name]['MISSED']}" if by[name]["MISSED"] else ""
            print(f"  {name:<26} written {day}  {verdict}{missed}")
    stray = {k: v for k, v in used.items() if k not in known and (v["err"] or ":" not in k)}
    bad = {k: v for k, v in stray.items() if v["err"]}
    if bad:
        print("\nNAMES THAT DID NOT RESOLVE — what was reached for is the trigger surface talking;"
              "\n  nothing on disk answered it = a skill PROPOSAL, not a naming defect. Date the skill first.")
        for k, v in sorted(bad.items(), key=lambda x: -x[1]["n"]):
            print(f"  {k:<26} {v['n']}x  last {v['last']}")
    foreign = {k: v for k, v in used.items() if k not in known and not v["err"]}
    if foreign:
        print("\nNOT MINE (plugins, built-ins) — " + " · ".join(
            f"{k} {v['n']}" for k, v in sorted(foreign.items(), key=lambda x: -x[1]["n"])))
        print("  A plugin outfiring one of mine is a finding only against a skill whose clock has run;"
              "\n  process skills (systematic-debugging, brainstorming) COMPOSE with mine, they do not race them.")
    unfiled = [v for v in by if v not in known]
    if unfiled:
        print("\nNOTES ON SKILLS THAT NO LONGER EXIST: " + " · ".join(unfiled))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:]]
    if "--help" in args or "-h" in args:
        print(__doc__); sys.exit(0)
    if "--fold" in args:
        since = args[args.index("--since") + 1] if "--since" in args else None
        rest = [a for a in args if not a.startswith("-") and a != since]
        fold(rest[0] if rest else None, since)
    else:
        session(args[0] if args and not args[0].startswith("-") else None)
