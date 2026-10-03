#!/usr/bin/env python3
"""corpus — full-text recall over the self and the folded past, by paragraph.

    python3 .ikiro/methods/corpus.py "lighthouse announce"       # FTS5 query → path:line  snippet
    python3 .ikiro/methods/corpus.py --reindex                    # rebuild the index
    python3 .ikiro/methods/corpus.py --roots                      # print the indexed roots

Roots: .ikiro/ (quests · reference · known-issues · release · codemap) and ~/.viva/bak/ikiro/corpus-20261005/
(compacts · zettelkasten · evals). The db lives beside the backup, never in the repo. Stale when any file is
newer than the db: re-indexed on the next query.
"""
import glob, os, sqlite3, sys

ROOT = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), ".ikiro")
BAK = os.path.expanduser("~/.viva/bak/ikiro")
ROOTS = [ROOT, os.path.join(BAK, "corpus-20261005")]
DB = os.path.join(BAK, ".fts.db")
EXT = (".md", ".org", ".txt", ".jsonl")


def files():
    for root in ROOTS:
        for f in glob.glob(f"{root}/**/*", recursive=True):
            if f.endswith(EXT) and os.path.isfile(f) and not os.path.islink(f):
                yield f


def stale():
    if not os.path.exists(DB):
        return True
    db_time = os.path.getmtime(DB)
    return any(os.path.getmtime(f) > db_time for f in files())


def reindex():
    if os.path.exists(DB):
        os.remove(DB)
    con = sqlite3.connect(DB)
    con.execute("CREATE VIRTUAL TABLE para USING fts5(path, line UNINDEXED, body)")
    rows = []
    for f in files():
        text = open(f, encoding="utf-8", errors="replace").read()
        line, buf, start = 1, [], 1
        for raw in text.split("\n"):
            if raw.strip():
                if not buf:
                    start = line
                buf.append(raw)
            elif buf:
                rows.append((f, start, "\n".join(buf))); buf = []
            line += 1
        if buf:
            rows.append((f, start, "\n".join(buf)))
    con.executemany("INSERT INTO para VALUES (?, ?, ?)", rows)
    con.commit(); con.close()
    return len(rows)


def query(q, limit=20):
    con = sqlite3.connect(DB)
    sql = "SELECT path, line, snippet(para, 2, '[', ']', '…', 18) FROM para WHERE para MATCH ? ORDER BY rank LIMIT ?"
    for path, line, snip in con.execute(sql, (q, limit)):
        print(f"{os.path.relpath(path, os.path.expanduser('~'))}:{line}  {snip.replace(chr(10), ' ')}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--roots" in args:
        print("\n".join(ROOTS))
    elif "--reindex" in args or not args:
        print(f"indexed {reindex()} paragraphs → {DB}")
    else:
        if stale():
            reindex()
        query(" ".join(args))
