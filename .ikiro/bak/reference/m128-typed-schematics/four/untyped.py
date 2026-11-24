"""untyped — fold a `deno check` log into counts per file and error code, for the files under one path."""
import collections, re, sys

log, under = sys.argv[1], sys.argv[2]
text = open(log, encoding="utf-8").read()

entries = re.findall(r"^(TS\d+) \[ERROR\]: (.*?)\n(?:.*?\n)*?\s+at file://(\S+?):(\d+):(\d+)", text, re.M)
print(f"errors in the whole graph {len(entries)}")

mine = [(code, message, path.split(under)[1], int(row)) for code, message, path, row, _ in entries if under in path]
print(f"errors under {under} {len(mine)}")

per_file = collections.defaultdict(collections.Counter)
for code, _, name, _ in mine:
    per_file[name][code] += 1
for name in sorted(per_file):
    print(f"== {name}")
    for code, count in sorted(per_file[name].items()):
        print(f"  {code} ×{count}")

print("== by code, every message")
by_code = collections.defaultdict(list)
for code, message, name, row in mine:
    by_code[code].append(f"{name}:{row} {message}")
for code in sorted(by_code):
    print(f"-- {code} ×{len(by_code[code])}")
    for entry in by_code[code]:
        print(f"  {entry[:170]}")
