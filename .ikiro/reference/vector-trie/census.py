"""Tabulate a collision census. usage: census.py <census.jsonl>"""
import collections
import json
import sys

entries = [json.loads(row) for row in open(sys.argv[1])]
classes = collections.Counter((entry["via"], entry["class"]) for entry in entries)
print(f"total {len(entries)}\n")
print("| via | class | hits | top natures |")
print("|---|---|---|---|")
for (via, name), hits in sorted(classes.items(), key=lambda item: (item[0][0], -item[1])):
    natures = collections.Counter(e["nature"] for e in entries if (e["via"], e["class"]) == (via, name))
    top = " · ".join(f"{nature} {count}" for nature, count in natures.most_common(4))
    print(f"| {via} | {name} | {hits} | {top} |")
print("\n| effect over effect, by caller | hits |")
print("|---|---|")
callers = collections.Counter(
    (e["via"], e["nature"], e.get("at") or "?") for e in entries if e["class"] == "effect over effect"
)
for (via, nature, at), hits in callers.most_common():
    print(f"| {via} {nature} — {at} | {hits} |")
shared = sum(1 for e in entries if e.get("same"))
print(f"\nsame pattern object on both sides: {shared}")
