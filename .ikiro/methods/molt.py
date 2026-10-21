#!/usr/bin/env python3
"""molt — the self measured from its raw records, nothing hand-kept: hooks.log · the transcripts · caps · mtimes.

    python3 .ikiro/methods/molt.py              # the readings + which molt triggers fired, exit 1 on any
    python3 .ikiro/methods/molt.py --weeks 12   # widen the window (default 8 ISO weeks)
    python3 .ikiro/methods/molt.py --stamp      # also write reference/molt/<today>/readings.md (the last-molt mark)

A trigger is a reading over a threshold; the skill `molt` says what each one owes. Silence is never a reading
(the sealed zettelkasten's lesson: quiet measured beef's attention, not behaviour) — every number here has a
mechanical source: a guard that logged, a Skill tool call in a transcript, a user turn carrying a correction word.
"""
import collections, datetime, glob, json, os, re, subprocess, sys

ROOT = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "/Users/finn/vivalence/code/vivalence"), ".ikiro")
PROJECT = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")
HOOKS_LOG = f"{PROJECT}/hooks.log"
WEEKS = int(sys.argv[sys.argv.index("--weeks") + 1]) if "--weeks" in sys.argv else 8
TODAY = datetime.date.today()

CORRECTION = {
    "retard": re.compile(r"\bretard", re.I),
    "dont-understand": re.compile(r"i don'?t understand", re.I),
    "wtf": re.compile(r"\bwtf\b", re.I),
    "stop": re.compile(r"^\s*(stop|sotp|wait)\b", re.I | re.M),
    "no.": re.compile(r"^\s*no[.!]", re.I | re.M),
    "fuck": re.compile(r"\bfuck", re.I),
    "rage-caps": re.compile(r"\b[A-Z]{4,}(?:\s+[A-Z]{2,}){2,}"),
}
TRIGGERS = {
    "guard-class-hot": 10,
    "corrections-per-100-turns": 8,
    "skill-silent-days": 45,
    "research-age-days": 60,
    "cap-percent": 97,
    "quests-closed-since-molt": 5,
}
SETTINGS = [os.path.expanduser("~/.claude/settings.json"), f"{os.path.dirname(ROOT)}/.claude/settings.json", f"{os.path.dirname(ROOT)}/.claude/settings.local.json"]


def settings():
    merged = {}
    for path in SETTINGS:
        if os.path.exists(path):
            try:
                merged.update({k: v for k, v in json.load(open(path)).items() if k != "hooks"} | {"hooks": {**merged.get("hooks", {}), **json.load(open(path)).get("hooks", {})}})
            except (json.JSONDecodeError, AttributeError):
                continue
    return merged


def wired_guards(conf):
    names = set()
    for entries in (conf.get("hooks") or {}).values():
        for entry in entries:
            for hook in entry.get("hooks", []):
                for m in re.finditer(r"hooks/([a-z-]+)\.sh", hook.get("command", "")):
                    names.add(m.group(1))
    return names


def week_of(date):
    iso = date.isocalendar()
    return f"{iso[0]}-W{iso[1]:02d}"


def recent_weeks():
    return [week_of(TODAY - datetime.timedelta(weeks=i)) for i in range(WEEKS - 1, -1, -1)]


def born(path):
    out = subprocess.run(["git", "-C", os.path.dirname(ROOT), "log", "--diff-filter=A", "--format=%cs", "-1", "--", path], capture_output=True, text=True).stdout.strip()
    if out:
        return datetime.date.fromisoformat(out)
    return datetime.date.fromtimestamp(os.path.getmtime(path))


def log_rows():
    for row in open(HOOKS_LOG, encoding="utf-8", errors="replace") if os.path.exists(HOOKS_LOG) else []:
        parts = row.split()
        if len(parts) < 3 or not parts[0].isdigit():
            continue
        yield week_of(datetime.date.fromtimestamp(int(parts[0]))), parts[1], parts[2], (parts[3] if len(parts) > 3 else ""), parts[4:]


def guard_fires():
    by_week = collections.defaultdict(collections.Counter)
    for week, guard, mode, session, _ in log_rows():
        if guard == "loaded" or (guard != "cap-guard" and session.startswith("exercise")):
            continue
        by_week[week][f"{guard} {mode}"] += 1
    return by_week


def loads():
    by_week = collections.defaultdict(collections.Counter)
    for week, guard, reason, session, rest in log_rows():
        if guard == "loaded" and not session.startswith("exercise") and rest:
            by_week[week][f"{rest[0]} {reason}"] += 1
    return by_week


def user_text(message):
    content = message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(part.get("text", "") for part in content if isinstance(part, dict) and part.get("type") == "text")
    return ""


def transcripts():
    sessions = []
    for path in sorted(glob.glob(f"{PROJECT}/*.jsonl")):
        session = {"id": os.path.basename(path)[:8], "date": None, "model": collections.Counter(), "turns": 0,
                   "corrections": collections.Counter(), "skills": collections.Counter()}
        with open(path, encoding="utf-8", errors="replace") as fh:
            for raw in fh:
                if '"type":"user"' not in raw and '"name":"Skill"' not in raw and '"model":"' not in raw:
                    continue
                try:
                    row = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                stamp = row.get("timestamp")
                if stamp and not session["date"]:
                    session["date"] = datetime.date.fromisoformat(stamp[:10])
                message = row.get("message") or {}
                if row.get("type") == "user" and not row.get("isMeta"):
                    text = user_text(message)
                    if not text or text.lstrip().startswith("<"):
                        continue
                    session["turns"] += 1
                    for name, pattern in CORRECTION.items():
                        if pattern.search(text):
                            session["corrections"][name] += 1
                elif row.get("type") == "assistant":
                    if message.get("model") and message["model"].startswith("claude-"):
                        session["model"][message["model"]] += 1
                    for part in message.get("content") or []:
                        if isinstance(part, dict) and part.get("type") == "tool_use" and part.get("name") == "Skill":
                            session["skills"][(part.get("input") or {}).get("skill", "?")] += 1
        if session["date"]:
            sessions.append(session)
    return sessions


def caps():
    out = subprocess.run([sys.executable, f"{ROOT}/methods/cap.py", "--all"], capture_output=True, text=True).stdout
    rows = []
    for row in out.splitlines():
        m = re.match(r"(ok|OVER) (\S.*?) (\d+)/(\d+)$", row)
        if m:
            rows.append((m.group(2), int(m.group(3)), int(m.group(4))))
    return rows


def newest(pattern):
    paths = glob.glob(pattern, recursive=True)
    return max((os.path.getmtime(p) for p in paths), default=None)


def age_days(mtime):
    return None if mtime is None else (TODAY - datetime.date.fromtimestamp(mtime)).days


def main():
    weeks = recent_weeks()
    fires = guard_fires()
    sessions = transcripts()
    lines, fired = [], []

    per_week = collections.defaultdict(lambda: {"sessions": 0, "turns": 0, "corrections": 0, "skills": collections.Counter(), "models": collections.Counter()})
    for s in sessions:
        w = per_week[week_of(s["date"])]
        w["sessions"] += 1
        w["turns"] += s["turns"]
        w["corrections"] += sum(s["corrections"].values())
        w["skills"].update(s["skills"])
        w["models"].update(s["model"])
    lines.append(f"# molt readings — {TODAY} · {len(sessions)} transcripts · window {WEEKS} weeks\n")
    lines.append("| week | sessions | user turns | corrections | per 100 | guard fires | skills fired | model |\n|---|---|---|---|---|---|---|---|")
    per100 = {}
    for wk in weeks:
        w = per_week[wk]
        per100[wk] = round(100 * w["corrections"] / w["turns"], 1) if w["turns"] else 0
        model = w["models"].most_common(1)[0][0].replace("claude-", "") if w["models"] else "-"
        lines.append(f"| {wk} | {w['sessions']} | {w['turns']} | {w['corrections']} | {per100[wk]} | {sum(fires[wk].values())} | {sum(w['skills'].values())} | {model} |")
    hot = [wk for wk in weeks[-2:] if per100[wk] >= TRIGGERS["corrections-per-100-turns"]]
    if hot:
        fired.append(f"corrections-per-100-turns ≥ {TRIGGERS['corrections-per-100-turns']} in {', '.join(hot)} — walk those transcripts (skill fold, a correction each)")

    words = collections.Counter()
    for s in sessions:
        if week_of(s["date"]) in weeks:
            words.update(s["corrections"])
    lines.append("\n## correction words in the window\n")
    lines.append("| word | turns |\n|---|---|")
    for name, n in words.most_common():
        lines.append(f"| {name} | {n} |")

    lines.append("\n## guards — real fires (the exercise rig excluded)\n")
    lines.append("| class | last 2 weeks | window | all time |\n|---|---|---|---|")
    all_time, window, last2 = collections.Counter(), collections.Counter(), collections.Counter()
    for wk, counter in fires.items():
        all_time.update(counter)
        if wk in weeks:
            window.update(counter)
        if wk in weeks[-2:]:
            last2.update(counter)
    for cls, n in all_time.most_common():
        lines.append(f"| {cls} | {last2[cls]} | {window[cls]} | {n} |")
        if last2[cls] >= TRIGGERS["guard-class-hot"]:
            fired.append(f"guard-class-hot {cls} = {last2[cls]} in 2 weeks — the rule failed again: warn → deny, or the rule is wrong (skill molt §guards)")
    conf = settings()
    wired = wired_guards(conf)
    seen = {cls.split()[0] for cls in window}
    for guard in sorted(wired - seen):
        lines.append(f"| {guard} (wired, silent) | 0 | 0 | {sum(n for cls, n in all_time.items() if cls.startswith(guard + ' '))} |")
        fired.append(f"guard-silent {guard} — wired, no real fire in {WEEKS} weeks: the rule holds unprompted (retire?) or the match is dead (exercise it)")
    written = {os.path.basename(p)[:-3] for p in glob.glob(f"{ROOT}/hooks/*-guard.sh") + glob.glob(f"{ROOT}/hooks/*-gate.sh") + [f"{ROOT}/hooks/loaded.sh"]}
    unwired = sorted(written - wired)
    if unwired:
        lines.append(f"\n- written, not wired (settings.json is his): {' · '.join(unwired)}")
        fired.append(f"guard-unwired {' · '.join(unwired)} — a rule cited as a guard that never runs; propose the settings.json entry or retire the script")

    lines.append("\n## rule loads — InstructionsLoaded rows (hooks/loaded.sh)\n")
    loaded = loads()
    window_loads = collections.Counter()
    for wk, counter in loaded.items():
        if wk in weeks:
            window_loads.update(counter)
    if window_loads:
        lines.append("| file · reason | loads in window |\n|---|---|")
        for key, n in window_loads.most_common():
            lines.append(f"| {key} | {n} |")
    else:
        lines.append("- no rows: the InstructionsLoaded hook is not wired (settings.json is his) — the channel census stays unmeasured")

    lines.append("\n## skills — Skill tool calls per skill\n")
    lines.append("| skill | window | all time | last fired | days silent |\n|---|---|---|---|---|")
    catalog = sorted(os.path.basename(os.path.dirname(p)) for p in glob.glob(f"{ROOT}/skills/*/SKILL.md"))
    all_skills, window_skills, last_fired = collections.Counter(), collections.Counter(), {}
    for s in sessions:
        for name, n in s["skills"].items():
            all_skills[name] += n
            if week_of(s["date"]) in weeks:
                window_skills[name] += n
            if name not in last_fired or s["date"] > last_fired[name]:
                last_fired[name] = s["date"]
    for name in catalog + sorted(set(all_skills) - set(catalog)):
        last = last_fired.get(name)
        silent = (TODAY - last).days if last else None
        newborn = name in catalog and (TODAY - born(f"{ROOT}/skills/{name}/SKILL.md")).days < TRIGGERS["skill-silent-days"]
        tag = "" if name in catalog else " (no SKILL.md)"
        if newborn:
            tag = " NEWBORN"
        lines.append(f"| {name}{tag} | {window_skills[name]} | {all_skills[name]} | {last or '-'} | {silent if silent is not None else '-'} |")
        if name in catalog and not newborn and (silent is None or silent >= TRIGGERS["skill-silent-days"]):
            fired.append(f"skill-silent {name} = {silent if silent is not None else 'never'} days — did its trigger miss, or was the thing never touched? (skill molt §skills)")

    lines.append("\n## caps\n")
    lines.append("| file | chars | limit | % |\n|---|---|---|---|")
    for rel, n, lim in caps():
        pct = round(100 * n / lim)
        if pct >= TRIGGERS["cap-percent"]:
            lines.append(f"| {rel} | {n} | {lim} | {pct} |")
        if n > lim:
            fired.append(f"cap OVER {rel} {n}/{lim} — consolidate now (never evict)")

    lines.append("\n## ages\n")
    model_first = {}
    for s in sorted(sessions, key=lambda s: s["date"]):
        for m in s["model"]:
            model_first.setdefault(m, s["date"])
    molts = sorted(glob.glob(f"{ROOT}/reference/molt/*/readings.md"))
    last_molt = datetime.date.fromisoformat(os.path.basename(os.path.dirname(molts[-1]))) if molts else None
    research = age_days(newest(f"{ROOT}/reference/harnesses/**/*.md"))
    frontier = age_days(os.path.getmtime(f"{ROOT}/quests/frontier.md"))
    done = sorted(glob.glob(f"{ROOT}/quests/done/*.org"), key=os.path.getmtime)
    closed_since = [p for p in done if last_molt and datetime.date.fromtimestamp(os.path.getmtime(p)) > last_molt] if last_molt else done
    oldest = min((s["date"] for s in sessions), default=None)
    retention = conf.get("cleanupPeriodDays")
    memories = [p for p in glob.glob(f"{PROJECT}/memory/*.md") if os.path.basename(p) != "MEMORY.md"
                and (not last_molt or datetime.date.fromtimestamp(os.path.getmtime(p)) > last_molt)]
    lines.append("| reading | value |\n|---|---|")
    for m, d in model_first.items():
        lines.append(f"| model {m} first seen | {d} |")
    lines.append(f"| last molt | {last_molt or 'never'} |")
    lines.append(f"| research age (reference/harnesses) | {research} days |")
    lines.append(f"| frontier age | {frontier} days |")
    lines.append(f"| quests in done/ closed since last molt | {len(closed_since)} |")
    lines.append(f"| oldest transcript | {oldest} · cleanupPeriodDays {retention if retention is not None else 'unset (30 — the sweep is silent)'} |")
    lines.append(f"| memory/*.md newer than the last molt | {len(memories)} |")
    if retention is None:
        fired.append(f"transcript-sweep — cleanupPeriodDays unset: transcripts older than 30 days vanish silently (oldest now {oldest}); propose cleanupPeriodDays: 3650 in settings.json (his) and capture to ~/.viva/bak/transcripts/")
    if memories:
        fired.append(f"memory-drain {len(memories)} auto-memory files — each lands in its ikiro owner or is deleted; a correction never lives off-tree ({', '.join(os.path.basename(p) for p in memories)})")
    newest_model = max(model_first.items(), key=lambda kv: kv[1])[0] if model_first else None
    if newest_model and last_molt and model_first[newest_model] > last_molt:
        fired.append(f"model-generation {newest_model} first seen {model_first[newest_model]} after the last molt {last_molt} — decay audit (skill molt §decay)")
    if research is not None and research >= TRIGGERS["research-age-days"]:
        fired.append(f"research-age {research} days — re-run the harness sweep (skill molt §research)")
    if len(closed_since) >= TRIGGERS["quests-closed-since-molt"]:
        fired.append(f"quests-closed-since-molt {len(closed_since)} — post-mortem pass over done/ (skill molt §quests)")

    lines.append("\n## triggers\n")
    lines.extend(f"- FIRED {t}" for t in fired)
    if not fired:
        lines.append("- quiet — no trigger over threshold (a quiet reading is still a reading: every number above has a source)")
    report = "\n".join(lines) + "\n"
    print(report)
    if "--stamp" in sys.argv:
        stamp_dir = f"{ROOT}/reference/molt/{TODAY}"
        os.makedirs(stamp_dir, exist_ok=True)
        open(f"{stamp_dir}/readings.md", "w").write(report)
        print(f"stamped {stamp_dir}/readings.md")
    sys.exit(1 if fired else 0)


if __name__ == "__main__":
    main()
