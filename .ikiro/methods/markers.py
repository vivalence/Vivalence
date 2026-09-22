#!/usr/bin/env python3
"""markers — the `#+marker_qa` sweep across every quest bucket.

    python3 .ikiro/methods/markers.py            # tally by bucket × verdict, then the drift rows
    python3 .ikiro/methods/markers.py --all      # every marker: bucket · quest · id · verdict

Contract (methods/quest.md ## QA): `#+marker_qa: <quest>/<T|P>-<slug> · <verdict> · <one line>`, verdict in
pending → held | broken | revised. Drift this prints: a `pending` on a done/ quest (the quest is not done) ·
a verdict outside the enum (`struck` is in use, nothing names it) · a marker whose separator is `—` not `·`
(quest-report.py splits on `·`, so the verdict reads as "" and the quest's progress lies) · an id with no
`<quest>/` prefix. reflection step 3 and quest-lifecycle's organ gate read this; nothing else tallies it.
"""
import glob, os, re, sys

ROOT = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".ikiro", "quests")
ENUM = {"pending", "held", "broken", "revised"}
MARK = re.compile(r"^#\+marker_qa:\s*(.*)$", re.M)


def bucket(path):
    rel = os.path.relpath(path, ROOT)
    return rel.split(os.sep)[0] if os.sep in rel else "root"


def rows():
    for f in sorted(glob.glob(f"{ROOT}/**/*.org", recursive=True)):
        if "/bak/" in f:
            continue
        for m in MARK.finditer(open(f, encoding="utf-8", errors="replace").read()):
            body = m.group(1)
            parts = [p.strip() for p in body.split("·")]
            ident = parts[0] if parts else ""
            verdict = parts[1].split()[0].lower() if len(parts) > 1 and parts[1] else ""
            yield {
                "bucket": bucket(f), "quest": os.path.basename(f), "id": ident, "verdict": verdict,
                "dash": "—" in body and "·" not in body, "unprefixed": "/" not in ident,
            }


if __name__ == "__main__":
    R = list(rows())
    if "--all" in sys.argv:
        for r in R:
            print(f"{r['bucket']:10} {r['quest']:48} {r['id']:44} {r['verdict']}")
        sys.exit(0)
    tally = {}
    for r in R:
        tally.setdefault(r["bucket"], {}).setdefault(r["verdict"] or "(none)", 0)
        tally[r["bucket"]][r["verdict"] or "(none)"] += 1
    print(f"markers {len(R)}")
    for b, vs in sorted(tally.items()):
        print(f"  {b:10} " + " · ".join(f"{v} {n}" for v, n in sorted(vs.items(), key=lambda x: -x[1])))
    drift = [r for r in R if (r["bucket"] == "done" and r["verdict"] == "pending")]
    bad = [r for r in R if r["verdict"] not in ENUM]
    dash = [r for r in R if r["dash"]]
    unp = [r for r in R if r["unprefixed"]]
    print(f"\npending in done/ {len(drift)}  · verdict outside enum {len(bad)}  · dash-separated {len(dash)}  · unprefixed id {len(unp)}")
    for label, rs in (("PENDING-IN-DONE", drift), ("OUTSIDE-ENUM", bad), ("DASH", dash), ("UNPREFIXED", unp)):
        for r in rs:
            print(f"  {label:16} {r['quest']:48} {r['id'][:44]:44} {r['verdict']}")
