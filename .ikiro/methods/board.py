import os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scoreboard

P = scoreboard.P
J = {}
exec(open(sys.argv[1], encoding="utf-8").read(), J)
JUDGE, ORDER, HEADER = J["JUDGE"], J["ORDER"], J["HEADER"]


def clock(es):
    last, dated = {}, []
    day = "00-00"
    for e in es:
        m = re.match(r"\d\d-\d\d", e["id"])
        if m:
            day = e["id"]
        dated.append((day, e))
    for day, e in dated:
        f = e["family"] or "?"
        last[f] = max(last.get(f, "00-00"), day)
    return {f: sum(1 for d, _ in dated if d > l) for f, l in last.items()}


def derived():
    es = scoreboard.entries()
    by = collections.defaultdict(list)
    for e in es:
        by[e["family"] or "?"].append(e["id"])
    rows = {}
    for fam, ids in by.items():
        c = collections.Counter(ids)
        rows[fam] = (len(ids), " · ".join(f"{k} ×{n}" if n > 1 else k for k, n in sorted(c.items())))
    return es, rows, clock(es)


def current(text):
    start = text.index("| family | n | entries |")
    end = text.index("\n## Open")
    table = text[start:end].rstrip("\n").split("\n")
    old = {}
    for line in table[2:]:
        cells = line.strip("|").split(" | ")
        old[cells[0].strip()] = [c.strip() for c in cells]
    return start, end, old


QUIET = re.compile(r"\b(\d+) (entries )?quiet")

for iteration in range(1, 6):
    text = open(P, encoding="utf-8").read()
    es, rows, quiet = derived()
    start, end, old = current(text)
    fams = sorted(rows, key=lambda f: (ORDER.index(f) if f in ORDER else 999, -rows[f][0]))
    out = ["| family | n | entries | rule | rung | status |", "|---|---|---|---|---|---|"]
    for f in fams:
        n, cell = rows[f]
        if f in JUDGE:
            rule, rung, status = JUDGE[f]
        else:
            rule, rung, status = old[f][3], old[f][4], old[f][5]
            status = QUIET.sub(lambda m: f"{quiet.get(f, 0)} {m.group(2) or ''}quiet", status)
        status = status.replace("{quiet}", str(quiet.get(f, 0)))
        out.append(f"| {f} | {n} | {cell} | {rule} | {rung} | {status} |")
    incidents = sum(n for f, (n, _) in rows.items() if f != "-")
    head_start = text.index("> **RECONCILED")
    head_end = text.index("\n", head_start)
    header = HEADER.format(headings=len(es), incidents=incidents, rows=len(rows),
                           total=sum(n for n, _ in rows.values()))
    new = text[:head_start] + header + text[head_end:]
    start = new.index("| family | n | entries |")
    end = new.index("\n## Open")
    new = new[:start] + "\n".join(out) + "\n" + new[end:]
    if new == text:
        print(f"fixpoint at iteration {iteration}")
        break
    open(P, "w", encoding="utf-8").write(new)
    print(f"iteration {iteration}: rewrote")
else:
    print("NO FIXPOINT")

missing = [f for f in JUDGE if f not in rows]
print("judged but not derived:", missing)
print("sum n", sum(n for n, _ in rows.values()), "headings", len(es))
