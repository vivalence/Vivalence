#!/usr/bin/env python3
"""budget — every ikiro file by its KIND, measured in CHARACTERS against its `limit: N chars` (or `N lines`) header.

    python3 .ikiro/methods/budget.py              # OVER · NOLIMIT · NOKIND rows only (exit 1 on any)
    python3 .ikiro/methods/budget.py --baseline   # + ABOVE: a THROUGHPUT file over 15% of its cap, with its drain
    python3 .ikiro/methods/budget.py --all        # every file and budgeted section, kind first

The kind law (m69 1.1, ontology law 7):
    persistent  rebuilt, never trashed — the cap is its only line (ikiro.md · self/* · world/map · ledger · codemap/**)
    throughput  idles at 15% of its cap and DRAINS to the owner its header names (frontier · loop-backlog · MARKERS · ## Open)
    ledger      never budgeted, pruned only by its own law (zettelkasten · release · known-issues · skills/LEDGER)
A throughput SECTION inside a ledger file carries its own header comment directly under its `## ` heading.

Chars, never bytes: `·` and `—` are three bytes each and ikiro prose is dense in both — `wc -c` flagged two files
inside budget and buried the real breach (ledger 09-21, family rule-not-self-applied). This is the ONE copy of
the loop; compact-gate.sh calls it, overview.md and rituals.md point here.
Over budget → evict a WHOLE item (quotes intact) to the artifact that owns it, leave one pointer line. Never a
paraphrase-shrink, never a sibling's clause. Hard gates (VCS · manifest · PII · no-comments · propose→go) are
never pruned on silence.
"""
import glob, os, re, sys

ROOT = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".ikiro")
# The selector is the whole gate: a budgeted file the glob misses reads exactly like a file inside budget.
# Measured 09-22 at the prune — three carried a limit this loop had never once read: manual.md and
# loop-backlog.md sit at the ikiro root the glob skipped, and codemap/typology/schematics.md one level
# down. Two of the three are `limit: N lines`, so the unit is honoured rather than assumed.
FILES = sorted(set(
    glob.glob(f"{ROOT}/self/*.md") + glob.glob(f"{ROOT}/world/**/*.md", recursive=True)
    + glob.glob(f"{ROOT}/*.md") + glob.glob(f"{ROOT}/*.org")
    + [f"{ROOT}/skills/LEDGER.md", f"{ROOT}/compacts/MARKERS.md"]
) - {f"{ROOT}/README.md"})   # README is people-facing, deliberately unbudgeted
# beef 09-23: /"budget is the upper limit. baseline is 15% of budget. these are throuput vectors. work them
# through. trash them."/ — then, narrowing it the same day: /"some files are throughput. not each and every one of
# them. some are more static. map, ledger, codemaps, ikiro root, coneusseur ... these are all quite persistant."/
# The 09-23 cut treated every file as throughput because every file had one kind, a `limit:`. The kind is
# declared now, and a file that declares none is a NOKIND row, never silently throughput.
BASELINE = 0.15
KIND = re.compile(r"kind: (persistent|throughput|ledger)")
LIMIT = re.compile(r"limit: (\d+) ?(lines|chars)?")   # unit optional: invariants.md said `limit: 8800` and the char-only grep never measured it
DRAIN = re.compile(r"drain: ([^·>\n]+?)\s*(?:·|-->|\n|$)")
BODY = re.compile(r"^(## |\* )", re.M)                 # the header is everything above the first md section or org heading
SECTION = re.compile(r"^## (.+)\n(?:\n)?<!-- ([^\n]*kind: [^\n]*) -->", re.M)


def header(text):
    # The header only. A `limit: N` quoted in the BODY is prose about budgets, not a budget —
    # zettelkasten.md carries the invariants.md story verbatim and read as 359k/8800.
    body = BODY.search(text)
    return text[: body.start()] if body else text[:600]


def measure(label, text, head):
    kind = KIND.search(head)
    limit = LIMIT.search(head)
    drain = DRAIN.search(head)
    return {
        "label": label,
        "kind": kind.group(1) if kind else None,
        "limit": int(limit.group(1)) if limit else None,
        "unit": (limit.group(2) or "chars") if limit else "chars",
        "n": text.count("\n") + 1 if limit and limit.group(2) == "lines" else len(text),
        "drain": drain.group(1).strip() if drain else None,
    }


def rows():
    for path in FILES:
        if os.path.islink(path) or not os.path.exists(path):
            continue
        text = open(path, encoding="utf-8").read()
        rel = os.path.relpath(path, ROOT)
        row = measure(rel, text, header(text))
        yield row
        if row["kind"] != "ledger":
            continue
        starts = [m.start() for m in re.finditer(r"^## ", text, re.M)] + [len(text)]
        for match in SECTION.finditer(text):
            end = next(s for s in starts if s > match.start())
            yield measure(f"{rel} ## {match.group(1).strip()}", text[match.start():end], match.group(2))


def verdict(row):
    if row["kind"] is None:
        return "NOKIND", None
    if row["kind"] == "ledger":
        return "ledger", None
    if row["limit"] is None:
        return "NOLIMIT", None
    base = row["limit"] if row["kind"] == "persistent" else int(row["limit"] * BASELINE)
    if row["n"] > row["limit"]:
        return "OVER", base
    if row["n"] > base:
        return "ABOVE", base
    return "ok", base


if __name__ == "__main__":
    # An empty selector prints a clean bill. ROOT falls back to "." so a run from inside .ikiro/ matched
    # NOTHING and reported every budget green, including a file 1012 over — the same silent-selector shape
    # as the missing unit and the missing glob, third face in one pass. A gate must fail loudly or not at all.
    if not FILES or not any(os.path.exists(f) for f in FILES):
        sys.exit(f"budget: no budgeted files under {ROOT} — run from the repo root, "
                 f"or set CLAUDE_PROJECT_DIR. Refusing to report green on an empty selector.")
    show_all = "--all" in sys.argv
    show_base = show_all or "--baseline" in sys.argv
    failing = 0
    for row in rows():
        status, base = verdict(row)
        kind, label, n, limit, unit = row["kind"] or "-", row["label"], row["n"], row["limit"], row["unit"]
        if status in ("NOKIND", "NOLIMIT", "OVER"):
            failing += 1
        if status == "NOKIND":
            print(f"NOKIND  {'-':<11} {label} {n} — declare kind: persistent | throughput | ledger")
        elif status == "NOLIMIT":
            print(f"NOLIMIT {kind:<11} {label} {n}")
        elif status == "OVER":
            print(f"OVER    {kind:<11} {label} {n}/{limit} {unit} (+{n - limit})")
        elif status == "ABOVE" and show_base:
            print(f"ABOVE   {kind:<11} {label} {n}/{limit} {unit} (baseline {base}, +{n - base}) → drain: {row['drain'] or 'UNDECLARED'}")
        elif status == "ledger" and show_all:
            print(f"ledger  {kind:<11} {label} {n} chars — never budgeted")
        elif status == "ok" and show_all:
            shown = f"(baseline {base})" if kind == "throughput" else "(cap only)"
            print(f"ok      {kind:<11} {label} {n}/{limit} {unit} {shown}")
    sys.exit(1 if failing else 0)
