"""gen — one stage's diff as quest blocks: `#+BEGIN_SRC diff` per modified file (each hunk's old text unique in the
source file, context grown until it is), `#+BEGIN_SRC js` whole for a new file.
    python3 gen.py <from-copy> <to-copy> <file-list> > blocks.org
"""
import difflib, re, sys, os
A, B, LIST = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/"), sys.argv[3]

def pattern(old):
    return re.compile("\n".join("(" + "[^\\n]*?".join(re.escape(piece) for piece in row.split("…")) + ")" for row in old.split("\n")))

def hunks(a, b, n):
    out = []
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for group in sm.get_grouped_opcodes(n):
        rows, old, first = [], [], group[0][1] + 1
        for tag, i1, i2, j1, j2 in group:
            if tag == "equal":
                for line in a[i1:i2]: rows.append(" " + line if line else ""); old.append(line)
            if tag in ("replace", "delete"):
                for line in a[i1:i2]: rows.append("-" + line); old.append(line)
            if tag in ("replace", "insert"):
                for line in b[j1:j2]: rows.append("+" + line)
        while rows and rows[-1] == "": rows.pop(); old.pop()
        out.append((first, rows, "\n".join(old)))
    return out

def block(path):
    a = open(f"{A}/{path}", encoding="utf-8").read()
    b = open(f"{B}/{path}", encoding="utf-8").read()
    al, bl = a.split("\n"), b.split("\n")
    for n in range(1, 40):
        hs = hunks(al, bl, n)
        if all(old and len(pattern(old).findall(a)) == 1 for _, _, old in hs): break
    else: raise SystemExit(f"no unique context: {path}")
    bad = [row for _, rows, _ in hs for row in rows if row.strip() == "…" or row.startswith("*") or row.lower().startswith("#+end_src")]
    if bad: raise SystemExit(f"unsafe row in {path}: {bad[:2]}")
    body = []
    for k, (first, rows, _) in enumerate(hs):
        if k: body.append("…")
        body.extend(rows)
    return "#+BEGIN_SRC diff\n// %s:%d\n%s\n#+END_SRC\n" % (path, hs[0][0], "\n".join(body))

def whole(path):
    text = open(f"{B}/{path}", encoding="utf-8").read().rstrip("\n")
    return "#+BEGIN_SRC js\n// %s\n%s\n#+END_SRC\n" % (path, text)

for line in open(LIST):
    kind, path = line.split()
    print(whole(path) if kind == "A" else block(path))
