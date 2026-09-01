#!/usr/bin/env python3
"""quest report — the totem table: quest · progress · status · next · sessions.

usage:  python3 .ikiro/methods/quest-report.py [--format md|org] [--stamp] [--compact <path>] [--hours N] [--test]

every column is derived fresh from disk (quests/*.org at the root = live). --stamp writes the three
header keys (#+phase · #+progress · #+next, suffixed "(derived)"; an authored value without the suffix
wins and is never touched). --compact appends or replaces a "* quest report" section in that compact.
CLAUDE_SESSION_ID in the environment excludes the running session from the sessions column.
canon: self/totems.md ## quest report · lifecycle: methods/compact.md step 8 · skills/quest-lifecycle.
"""
import os, re, sys, time, glob, shutil, tempfile, subprocess

QUESTS = ".ikiro/quests"
SESSIONS = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")
PHASES = ["open", "survey", "design", "wip", "landed", "done", "blocked", "discarded"]
NEXTS = ["survey", "design", "go", "blast", "control", "drain", "lift", "commit", "fork", "sunset"]
SETTLED = re.compile(r"^(held|done|passed|dropped|revised)\b", re.I)
DONE_WORDS = re.compile(r"\b(landed|applied|blasted|done|green|lands?)\b", re.I)


def header(text):
    keys = {}
    for m in re.finditer(r"^#\+([A-Za-z_]+):[ \t]*(.*)$", text, re.M):
        keys.setdefault(m.group(1).lower(), []).append(m.group(2).strip())
    return keys


def authored(keys, key):
    for value in keys.get(key, []):
        if value and not value.endswith("(derived)"):
            return value.strip()
    return None


def milestones(text, status):
    """milestones are the contiguous run M0/M1..Mn (n <= 15); a lone M27 is a quest number, never a milestone."""
    seen = {int(n) for n in re.findall(r"\bM(\d+)\b", text) if int(n) <= 15}
    tokens = [0] if 0 in seen else []
    for n in range(1, 16):
        if n in seen:
            tokens.append(n)
        else:
            break
    if not tokens:
        return 0, 0
    done = set()
    for clause in re.split(r"[.;·|]", status):
        if not DONE_WORDS.search(clause):
            continue
        for a, b in re.findall(r"\bM(\d+)(?:\s*[–\-]\s*M?(\d+))?", clause):
            done.update(range(int(a), int(b or a) + 1))
    done &= set(tokens)
    return len(done), len(tokens)


def tasks(text, keys):
    status = " ".join(keys.get("status", []))
    verdicts = [v.split("·")[1].strip() for v in keys.get("marker_qa", []) if "·" in v]
    markers_done = sum(1 for v in verdicts if SETTLED.match(v))
    boxes = re.findall(r"^\s*- \[([ xX])\]", text, re.M)
    boxes_done = sum(1 for b in boxes if b.strip())
    heads = re.findall(r"^\*+ (TODO|DONE)\b", text, re.M)
    heads_done = sum(1 for h in heads if h == "DONE")
    m_done, m_total = milestones(text, status)
    done = markers_done + boxes_done + heads_done + m_done
    total = len(verdicts) + len(boxes) + len(heads) + m_total
    partial = (m_total and m_done < m_total) or (not m_total and boxes and boxes_done < len(boxes))
    return done, total, len(verdicts) - markers_done, bool(partial)


def phase(keys, done, total, pending, partial):
    explicit = authored(keys, "phase")
    if explicit:
        return explicit.lower()
    status = " ".join(keys.get("status", [])).upper()
    if not status:
        return "open"
    if re.search(r"\b(DISCARDED|ABANDONED|SUPERSEDED)\b", status):
        return "discarded"
    if re.search(r"\bDONE\b", status.split("—")[0]) and total and done == total and not pending:
        return "done"
    if re.search(r"BEEF RUNS ALL|\bGATED ON BEEF\b|\bBLOCKED\b", status):
        return "blocked"
    if re.search(r"\b(LANDED|BLASTED GREEN|APPLIED)\b", status):
        return "wip" if partial else "landed"
    if re.search(r"\b(DESIGNED|AUTHORED|VALIDATED)\b", status):
        return "design"
    if re.search(r"\b(WALKED|VERIFIED|MEASURED)\b", status):
        return "survey"
    return "open"


def next_action(keys, text, ph, pending):
    explicit = authored(keys, "next")
    if explicit:
        return explicit.lower()
    status = " ".join(keys.get("status", []))
    if ph in ("done", "discarded"):
        return "sunset"
    if ph == "blocked":
        return "fork" if re.search(r"\bfork", status, re.I) else "go"
    if ph == "landed":
        if pending:
            return "control"
        if re.search(r"^\* release", text, re.M) and not os.path.exists("release.md"):
            return "lift"
        if re.search(r"uncommitted", status, re.I):
            return "commit"
        return "sunset"
    if ph == "wip":
        if re.search(r"taskbag", status, re.I):
            return "drain"
        return "control" if pending else "blast"
    if ph == "design":
        return "go"
    if ph == "survey":
        return "drain" if re.search(r"taskbag", status, re.I) else "design"
    return "survey"


def sessions(stem, hours, live_minutes=45, exclude=None):
    """other sessions whose transcript touched the quest FILE — a quoted path, as file tools and shell strings carry it."""
    cutoff = time.time() - hours * 3600
    needle = f'quests/{stem}.org"'
    hits, live = [], []
    for path in glob.glob(os.path.join(SESSIONS, "*.jsonl")):
        st = os.stat(path)
        if st.st_mtime < cutoff:
            continue
        sid = os.path.basename(path)[:8]
        if exclude and sid == exclude[:8]:
            continue
        if subprocess.run(["grep", "-qF", needle, path]).returncode != 0:
            continue
        hits.append(sid)
        ago = int((time.time() - st.st_mtime) / 60)
        if ago < live_minutes:
            live.append((sid, ago))
    return len(hits), sorted(live, key=lambda pair: pair[1])


def report(root=QUESTS, hours=168, exclude=None, scan_sessions=True):
    rows = []
    for path in sorted(glob.glob(os.path.join(root, "*.org"))):
        text = open(path, encoding="utf-8", errors="replace").read()
        keys = header(text)
        stem = os.path.splitext(os.path.basename(path))[0]
        done, total, pending, partial = tasks(text, keys)
        ph = phase(keys, done, total, pending, partial)
        nx = next_action(keys, text, ph, pending)
        progress = f"{round(100 * done / total):3d}% {done}/{total}" if total else "—"
        touched, live = sessions(stem, hours, exclude=exclude) if scan_sessions else (0, [])
        rows.append({
            "path": path, "stem": stem, "quest": stem, "progress": progress, "done": done, "total": total,
            "status": ph, "next": nx, "live": live,
            "sessions": (f"{touched}" + (f" ({len(live)} live)" if live else "")) if scan_sessions else "—",
        })
    return rows


COLUMNS = ["quest", "progress", "status", "next", "sessions"]


def render(rows, fmt="md"):
    widths = {c: max(len(c), *(len(str(r[c])) for r in rows)) if rows else len(c) for c in COLUMNS}
    line = lambda cells: "| " + " | ".join(str(v).ljust(widths[c]) for c, v in zip(COLUMNS, cells)) + " |"
    rule = ("+" if fmt == "org" else "|").join("-" * (widths[c] + 2) for c in COLUMNS)
    out = [line(COLUMNS), "|" + rule + "|"]
    out += [line([r[c] for c in COLUMNS]) for r in rows]
    return "\n".join(out)


def legend(rows):
    return "\n".join(
        f"live: {r['stem']} ← " + " · ".join(f"{sid} ({ago}m ago)" for sid, ago in r["live"])
        for r in rows if r.get("live")
    )


def stamp(rows):
    """#+phase · #+progress · #+next (derived) after the last #+status line; authored values stay; idempotent."""
    changed = []
    for r in rows:
        text = open(r["path"], encoding="utf-8").read()
        keys = header(text)
        lines = [l for l in text.split("\n") if not re.match(r"^#\+(phase|progress|next):.*\(derived\)\s*$", l, re.I)]
        anchor = max([i for i, l in enumerate(lines) if re.match(r"^#\+(status|filetags|title)\b", l, re.I)] or [0])
        fresh = [f"#+{key}: {r[col]} (derived)"
                 for key, col in (("phase", "status"), ("progress", "progress"), ("next", "next"))
                 if not authored(keys, key)]
        lines[anchor + 1:anchor + 1] = fresh
        new = "\n".join(lines)
        if new != text:
            open(r["path"], "w", encoding="utf-8").write(new)
            changed.append(r["stem"])
    return changed


def compact(path, table):
    text = open(path, encoding="utf-8").read()
    section = "* quest report (derived at fold — `methods/quest-report.py`)\n\n" + table + "\n"
    if "\n* quest report" in text:
        text = re.sub(r"\n\* quest report.*?(?=\n\* |\Z)", lambda m: "\n" + section.rstrip("\n"), text, flags=re.S)
    else:
        text = text.rstrip("\n") + "\n\n" + section
    open(path, "w", encoding="utf-8").write(text)


FIXTURES = {
    "m01-markers.org": "#+title: m01 markers\n#+status: LANDED — M1 · M2 blasted, uncommitted\n* body\nM1 M2 M3\n#+marker_qa: m01/T-a · pending · x\n#+marker_qa: m01/T-b · held · y\n",
    "m02-boxes.org": "#+title: m02 boxes\n#+status: DESIGNED — the plan\n- [x] one\n- [ ] two\n- [ ] three\n",
    "m03-walked.org": "#+title: m03 walked\n#+status: WALKED. two taskbags below\n* taskbag A\n",
    "m04-open.org": "#+title: m04 open\n#+STATUS: PRELIMINARY — considerations dump\n",
    "m05-override.org": "#+title: m05 override\n#+status: LANDED\n#+next: fork\n#+phase: wip (derived)\n",
    "m06-done.org": "#+title: m06 done\n#+status: DONE — M1 · M2 landed\nM1 M2\n#+marker_qa: m06/T-a · held · x\n",
    "m07-blocked.org": "#+title: m07 blocked\n#+status: *DESIGNED* — every op is a VCS mutation → beef runs ALL of them\n",
    "m08-release.org": "#+title: m08 release\n#+status: LANDED, uncommitted\n* release\n- x\n",
    "m27-own-number.org": "#+title: m27 — mind\n#+status: LANDED — M1 · M2 blasted\nM27 M1 M2\n",
}
EXPECT = {
    "m01-markers": ("wip", "control", " 60% 3/5"),
    "m02-boxes": ("design", "go", " 33% 1/3"),
    "m03-walked": ("survey", "drain", "—"),
    "m04-open": ("open", "survey", "—"),
    "m05-override": ("landed", "fork", "—"),
    "m06-done": ("done", "sunset", "100% 3/3"),
    "m07-blocked": ("blocked", "go", "—"),
    "m08-release": ("landed", "lift", "—"),
    "m27-own-number": ("landed", "sunset", "100% 2/2"),
}


def selftest():
    tmp = tempfile.mkdtemp(prefix="quest-report-")
    q = os.path.join(tmp, "quests")
    os.makedirs(q)
    for name, body in FIXTURES.items():
        open(os.path.join(q, name), "w").write(body)
    cwd = os.getcwd()
    os.chdir(tmp)
    failures = []
    try:
        rows = {r["stem"]: r for r in report(q, scan_sessions=False)}
        for stem, want in EXPECT.items():
            got = (rows[stem]["status"], rows[stem]["next"], rows[stem]["progress"])
            if got != want:
                failures.append(f"{stem}: expected {want} got {got}")
        stamp(list(rows.values()))
        again = open(os.path.join(q, "m05-override.org")).read()
        if "#+next: fork" not in again or again.count("#+phase:") != 1 or "#+phase: landed (derived)" not in again:
            failures.append("stamp: authored override not honoured or duplicate keys:\n" + again)
        if stamp(list(report(q, scan_sessions=False))):
            failures.append("stamp: not idempotent")
        c = os.path.join(tmp, "c.org")
        open(c, "w").write("#+title: t\n* spine\nrow\n")
        table = render(list(rows.values()), "org")
        compact(c, table)
        compact(c, table)
        if open(c).read().count("* quest report") != 1:
            failures.append("compact: section not replaced in place")
    finally:
        os.chdir(cwd)
        shutil.rmtree(tmp)
    if failures:
        print("FAIL\n" + "\n".join(failures))
        return 1
    print(f"ok — {len(EXPECT)} derivation cases · authored override · stamp idempotence · compact section replace")
    return 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--test" in args:
        sys.exit(selftest())
    fmt = args[args.index("--format") + 1] if "--format" in args else "md"
    hours = int(args[args.index("--hours") + 1]) if "--hours" in args else 168
    rows = report(hours=hours, exclude=os.environ.get("CLAUDE_SESSION_ID"))
    print(render(rows, fmt))
    if fmt == "md" and legend(rows):
        print(legend(rows))
    if "--stamp" in args:
        print("stamped:", ", ".join(stamp(rows)) or "nothing (already current)")
    if "--compact" in args:
        compact(args[args.index("--compact") + 1], render(rows, "org"))
        print("compact section written")
