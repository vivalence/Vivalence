"""what his instance holds at the keys a scalar would tighten. read-only.

    python3 held.db.py ~/.viva/instances/localhost/mountpoint/localhost.viva.db
"""
import re
import sqlite3
import sys

SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MIME = re.compile(
    r"^(?:application|audio|font|image|message|model|multipart|text|video)/(?:vnd\.|prs\.|x\.)?"
    r"[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}(?:\+[A-Za-z0-9!#$&^_.-]+)?$"
)
HASH = re.compile(r"^[0-9a-f]{64}$")
INTEGRITY = re.compile(r"^sha(?:256|384|512)-[A-Za-z0-9+/]+={0,2}$")
INSTANT = re.compile(r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$")
CHECKS = {"slug": SLUG, "mime": MIME, "hash": HASH, "integrity": INTEGRITY, "installed": INSTANT}
SETS = ("role", "type", "version", "daemon", "ontology")

db = sqlite3.connect(f"file:{sys.argv[1]}?mode=ro", uri=True)
tables = [row[0] for row in db.execute("select name from sqlite_master where type = 'table' order by name")]
for table in tables:
    columns = [row[1] for row in db.execute(f'pragma table_info("{table}")')]
    for column in columns:
        if column in CHECKS:
            held = [row[0] for row in db.execute(f'select "{column}" from "{table}" where "{column}" is not null')]
            missed = [value for value in held if not CHECKS[column].match(str(value))]
            sample = " · ".join(sorted(set(map(str, missed)))[:4])
            print(f"{table}.{column}\theld {len(held)}\toutside {len(missed)}\t{sample[:110]}")
        if column in SETS:
            held = db.execute(
                f'select "{column}", count(*) from "{table}" where "{column}" is not null group by 1 order by 2 desc limit 8'
            ).fetchall()
            print(f"{table}.{column}\tdistinct, top 8\t" + " · ".join(f"{value}×{count}" for value, count in held)[:150])
