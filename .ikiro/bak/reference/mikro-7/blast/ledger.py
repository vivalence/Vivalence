import glob, os, re, sqlite3

home = os.path.expanduser("~")
probe_tables = ("Turn", "Buffer", "Literal", "Symbol", "Thread", "Identity", "Daemon")
print("mountpoint | db KiB | tables | rows(Turn·Buffer·Literal·Identity) | m:1 FKs on update cascade | pivots | migrations (pragma · down) | snapshot | _mikro_migrations")
for db in sorted(glob.glob(f"{home}/.viva/instances/*/mountpoint/*/*.viva.db")):
    mountpoint = os.path.dirname(db)
    label = mountpoint.replace(f"{home}/.viva/instances/", "").replace("/mountpoint/", " · ")
    connection = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    tables = [row[0] for row in connection.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")]
    counts = []
    for table in ("Turn", "Buffer", "Literal", "Identity"):
        counts.append(str(connection.execute(f"select count(*) from `{table}`").fetchone()[0]) if table in tables else "-")
    update_cascade = 0
    for table in tables:
        for fk in connection.execute(f"select * from pragma_foreign_key_list('{table}')"):
            if fk[5] == "CASCADE" and not re.search(r"_(literals|symbols|uses|daemons)$", table):
                update_cascade += 1
    pivots = [t for t in tables if re.search(r"_(literals|symbols|uses|daemons)$", t)]
    executed = connection.execute("select count(*) from _mikro_migrations").fetchone()[0] if "_mikro_migrations" in tables else "-"
    connection.close()
    migrations = sorted(glob.glob(f"{mountpoint}/migrations/Migration*.ts"))
    pragma = sum(1 for path in migrations if "pragma" in open(path).read().lower())
    down = sum(1 for path in migrations if re.search(r"async down\(", open(path).read()))
    snapshot = len(glob.glob(f"{mountpoint}/migrations/.snapshot-*.json"))
    size = os.path.getsize(db) // 1024
    print(f"{label} | {size} | {len(tables)} | {'·'.join(counts)} | {update_cascade} | {','.join(pivots) or '-'} | {len(migrations)} ({pragma} · {down}) | {snapshot} | {executed}")
