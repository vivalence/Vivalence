"""A before-step is heard only by a mount that arrives at a release.

usage: python3 -I arrived.build.py <migrate.js | quest> <libsql.viva.js | quest>
"""
import sys


def turn(path, pairs):
    text = open(path).read()
    for old, new in pairs:
        assert text.count(old) == 1, (path, old, text.count(old))
        text = text.replace(old, new)
    open(path, "w").write(text)


def provider(prefix):
    lines = [
        "    const read = (sql) => orm.em.getConnection().execute(sql);",
        '    options.twitch.branch("/before/datamap/migrate").use(migrate.before(read));',
        '    options.twitch.branch("/after/datamap/migrate").use(migrate.after(orm, datamap.version));',
        "",
        "    const stood = migrate.reached(await migrator.getExecuted(), datamap.version);",
        "    const arrived = stood !== datamap.version;",
    ]
    after = [lines[0], lines[4], lines[5], lines[1].replace("before(read)", "before(read, arrived)"), lines[2]]
    join = lambda rows: "\n".join(prefix + row if row or not prefix else prefix for row in rows)
    return join(lines), join(after)


turn(
    sys.argv[1],
    [
        (
            "export const before = (read) => async (ctx, next) => {\n  const diff = ctx.input;",
            "export const before = (read, arrived) => async (ctx, next) => {\n  if (!arrived) return;\n\n  const diff = ctx.input;",
        )
    ],
)

text = open(sys.argv[2]).read()
for prefix in ("", "+"):
    old, new = provider(prefix)
    if text.count(old) == 1:
        open(sys.argv[2], "w").write(text.replace(old, new))
        print("turned", sys.argv[2], repr(prefix))
        break
else:
    raise SystemExit(f"no provider block in {sys.argv[2]}")
