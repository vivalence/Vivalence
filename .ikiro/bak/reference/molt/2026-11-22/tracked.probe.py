#!/usr/bin/env python3
"""tracked.probe — what the quests and references record: every org heading by name (files · chars), and
the sentences that record machine state of one moment (a restart · a pid · a port · a session). Read-only."""
import collections
import glob
import os
import re

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
SETS = {
    "quests live": glob.glob(f"{ROOT}/quests/*.org"),
    "quests done": glob.glob(f"{ROOT}/quests/done/*.org"),
    "reference": glob.glob(f"{ROOT}/reference/**/*.org", recursive=True)
    + glob.glob(f"{ROOT}/reference/**/*.md", recursive=True),
    "frontier · index · known-issues · release": [
        f"{ROOT}/quests/frontier.md",
        f"{ROOT}/quests/index.md",
        f"{ROOT}/known-issues.org",
        f"{ROOT}/release.md",
    ],
}
HEADING = re.compile(r"^(\*+|#+) +(.*)$")
MOMENT = {
    "restart · bounce": r"\brestart(ed|s|ing)?\b|\bbounced?\b|\brebooted\b",
    "pid": r"\bpid \d+|\bPID\b",
    "port up · down": r":(2501|1794)\b[^.\n]{0,60}\b(down|up|RUNNING|IDLE|404|answers|live|dead|listening)\b",
    "watcher": r"\bwatcher|\bwatch-guard\b|runtime/watch|anima/watch",
    "session · compact": r"\bthis session\b|\bcompact(ed|ion)?\b|\bcontext window\b|\bsibling session\b",
    "his screen pending": r"\bhis (walk|look|F5|restart|go|ruling|word)\b|\bHIS\b",
    "clock time": r"\b[0-2]\d:[0-5]\d(:[0-5]\d)?\b",
    "my own failure": r"\bMY (misread|slop|fault|error)\b|\bI (missed|misread|forgot)\b|\bfed ×\d|\bharness nudges?\b",
    "agent bookkeeping": r"\bagent[s]? (ran|returned|reported)\b|\bfan-?out\b|\bcap\.py\b|\blimit raised\b|\bOVER\b",
}


def clean(title):
    title = re.sub(r"\b(DONE|TODO|LANDED|DESIGNED|TANGLED|DECLARED|OPEN|CLOSED)\b", "", title)
    title = re.sub(r"[0-9]+(\.[0-9]+)*", "N", title)
    return re.split(r" [—·:(\[]", title.strip().lower())[0].strip()[:40]


for label, paths in SETS.items():
    paths = [p for p in paths if os.path.isfile(p)]
    chars = 0
    files_of = collections.Counter()
    chars_of = collections.Counter()
    moments = collections.Counter()
    moment_chars = collections.Counter()
    sample = {}
    for path in paths:
        text = open(path, encoding="utf-8", errors="replace").read()
        chars += len(text)
        current = None
        seen = set()
        for row in text.split("\n"):
            match = HEADING.match(row)
            if match and len(match.group(1)) <= 2:
                current = clean(match.group(2))
                if current not in seen:
                    files_of[current] += 1
                    seen.add(current)
            if current:
                chars_of[current] += len(row) + 1
            for name, pattern in MOMENT.items():
                if re.search(pattern, row):
                    moments[name] += 1
                    moment_chars[name] += len(row)
                    sample.setdefault(name, f"{os.path.relpath(path, ROOT)}: {row.strip()[:150]}")
    print(f"\n# {label} — {len(paths)} files · {chars} chars")
    print("## headings in ≥3 files (files · chars · name)")
    for name, n in files_of.most_common(28):
        if n >= 3:
            print(f"{n:5d} {chars_of[name]:9d}  {name}")
    print("## rows recording one moment's state (rows · chars of those rows · kind)")
    for name, n in moments.most_common():
        print(f"{n:6d} {moment_chars[name]:9d}  {name}")
        print(f"         e.g. {sample[name]}")
