#!/usr/bin/env python3
"""fires — fold the guard logs into the numerator the Scoreboard never had.

    python3 .ikiro/methods/fires.py                 # per guard: fires by decision, sessions, classification
    python3 .ikiro/methods/fires.py --since 09-21   # only rows on/after that day (this year)
    python3 .ikiro/methods/fires.py --yap           # hooks.log-yap: words outside fences per turn

hooks.log rows: `<epoch> <guard> <decision> <session> [<class>]` — the 5th field (since 09-21) is the guard's own
classification of what it matched, never the command text. Rows whose session starts with `exercise` are the
rig's (hooks/exercise.sh writes into the log it is measured with) and are EXCLUDED here; flywheel step 2 reads
these numbers before any PROVEN mark on a family a guard covers. hooks.log-yap rows: `<epoch> <session>
<fences> <words-outside-fences> <n>`.
"""
import collections, datetime, os, sys

H = os.path.expanduser("~/.claude/projects/-Users-finn-vivalence-code-vivalence")
LOG, YAP = os.path.join(H, "hooks.log"), os.path.join(H, "hooks.log-yap")


def since_epoch(argv):
    if "--since" not in argv:
        return 0
    day = [int(x) for x in argv[argv.index("--since") + 1].split("-")]
    y, m, d = day if len(day) == 3 else [datetime.date.today().year, *day]
    return datetime.datetime(y, m, d).timestamp()


def rows(path):
    for line in open(path, encoding="utf-8", errors="replace"):
        parts = line.split()
        if len(parts) >= 4 and parts[0].isdigit():
            yield parts


def guards(cut):
    fires = collections.defaultdict(lambda: collections.Counter())
    sessions = collections.defaultdict(set)
    classes = collections.defaultdict(collections.Counter)
    excluded = 0
    for p in rows(LOG):
        epoch, guard, decision, session = int(p[0]), p[1], p[2], p[3]
        if session.startswith("exercise"):
            excluded += 1
            continue
        if epoch < cut:
            continue
        fires[guard][decision] += 1
        sessions[guard].add(session)
        if len(p) > 4:
            classes[guard][p[4]] += 1
    print(f"guard fires (exercise rows excluded: {excluded})")
    for guard in sorted(fires, key=lambda g: -sum(fires[g].values())):
        dec = " · ".join(f"{d} {n}" for d, n in fires[guard].most_common())
        cls = " · ".join(f"{c} {n}" for c, n in classes[guard].most_common(6)) or "(no class field)"
        print(f"  {guard:16} {sum(fires[guard].values()):4}  {dec:28} sessions {len(sessions[guard]):3}  | {cls}")


def yap(cut):
    words, fenceless, n = [], 0, 0
    # hooks.log-yap: `<epoch> <session> <lines> <words> <fences>` — fences is field 5; reading field 3 (prose
    # LINES) as the fence count made `no fence at all` read 0 over 769 turns (the 09-23 board's unverified zero)
    for p in rows(YAP):
        if int(p[0]) < cut or p[1].startswith("exercise"):
            continue
        n += 1
        w = int(p[3]); words.append(w)
        if len(p) > 4 and int(p[4]) == 0:
            fenceless += 1
    if not words:
        print("no yap rows"); return
    words.sort()
    q = lambda f: words[min(len(words) - 1, int(len(words) * f))]
    print(f"yap turns {n} · words outside fences median {q(0.5)} · mean {sum(words) // len(words)} · p90 {q(0.9)} · max {words[-1]} · over 200: {sum(1 for w in words if w > 200)} ({100 * sum(1 for w in words if w > 200) // n}%) · no fence at all: {fenceless} ({100 * fenceless // n}%)")


if __name__ == "__main__":
    if "-h" in sys.argv or "--help" in sys.argv:
        print(__doc__); sys.exit(0)
    cut = since_epoch(sys.argv)
    if "--yap" in sys.argv:
        yap(cut)
    else:
        guards(cut)
