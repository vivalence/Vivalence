"""tangle — the paladin belt quest applied to a COPY of the tree and of the registry packages.

    python3 tangle.py <copy of the repo> <copy of ~/.viva/registry>

Never on the repo. Step one swaps the belt directory for the files in style/belt/. Step two turns
every old name into its new one across code, tests and docs. What a pattern cannot turn is printed.
"""
import os, re, shutil, sys

here = os.path.dirname(os.path.abspath(__file__))
tree, registry = (os.path.abspath(path) for path in sys.argv[1:3])
SKIP = {"node_modules", "bak", ".git", ".jj", "dist", "snapshots", ".ikiro", ".svelte-kit", "build", ".astro"}
TEXT = (".js", ".ts", ".jsx", ".tsx", ".svelte", ".mjs", ".md", ".mdx", ".org", ".jsonc")
BELT = os.path.join(tree, "subsystems/paladin/gestalten/belt")
GONE = ["state", "source", "expand", "prime", "stamp", "bundler", "clone", "scribe"]

for name in GONE:
    os.remove(os.path.join(BELT, f"{name}.js"))
for name in sorted(os.listdir(os.path.join(here, "style/belt"))):
    if name in ("ignore.js", "faculties.js"):
        continue
    shutil.copyfile(os.path.join(here, "style/belt", name), os.path.join(BELT, name))

P = r"(\b(?:paladin|config)\b)"
STATE = {
    "text": "write.text",
    "scribe": "write.text",
    "jsonl": "write.jsonl",
    "json": "write.json",
    "dir": "write.dir",
    "open": "write.open",
    "store": "write.bytes",
    "land": "write.stream",
    "remove": "remove.file",
    "env": "envfile.write",
    "line": "envfile.entry",
}
RENAMES = [
    (re.compile(P + r"\.state\.(" + "|".join(STATE) + r")\b"), lambda m: f"{m.group(1)}.{STATE[m.group(2)]}"),
    (re.compile(P + r"\.source\("), r"\1.link.path("),
    (re.compile(P + r"\.expand\("), r"\1.link.env("),
    (re.compile(P + r"\.read\.locate\b"), r"\1.link.part"),
    (re.compile(P + r"\.find\.type\b"), r"\1.find.modules"),
    (re.compile(P + r"\.prime\.directory\b"), r"\1.find.primer"),
    (re.compile(P + r"\.stamp\.(tree|fold)\b"), r"\1.hash.\2"),
    (re.compile(P + r"\.watch\("), r"\1.watch.directory("),
    (re.compile(P + r"\.bundler\.(members|under)\b"), r"\1.bundle.\2"),
    (re.compile(P + r"\.bundler\("), r"\1.bundle.directory("),
    (re.compile(P + r"\.clone\.remote\b"), r"\1.vcs.remote"),
    (re.compile(P + r"\.clone\("), r"\1.vcs.clone("),
    (re.compile(r"\bledger\.lock\(([^()]*)\)\.read\(\)"), r"ledger.locks.read(\1)"),
    (re.compile(r"\bledger\.lock\(([^()]*)\)\.remove\(\)"), r"ledger.locks.remove(\1)"),
    (re.compile(r"\bledger\.lock\(([^()]*)\)\.write\("), r"ledger.locks.write(\1, "),
    (re.compile(r"\bledger\.locks\(\)"), "ledger.locks.list()"),
    (re.compile(r"\bpaladin\.ledger\.log\("), "paladin.telemetry.log("),
]
LEFT = re.compile(
    r"\.state\.(text|scribe|jsonl|json|dir|open|store|land|remove|env|line)\b"
    r"|\b(paladin|config)\.(source|expand|stamp|prime|bundler|clone|scribe|state)\b"
    r"|\.read\.(locate|file)\b|\.find\.(type|read)\b|\.check\.path\b"
    r"|\bledger\.(lock|log)\(|\bledger\.locks\(\)"
    r"|belt/(state|source|expand|prime|stamp|bundler|clone|scribe)\.js"
)

turned = {}
left = []
for root in (tree, registry):
    for folder, folders, files in os.walk(root):
        folders[:] = sorted(name for name in folders if name not in SKIP)
        if os.path.abspath(folder) == BELT:
            continue
        for name in sorted(files):
            if not name.endswith(TEXT):
                continue
            path = os.path.join(folder, name)
            if os.path.islink(path):
                continue
            before = open(path, encoding="utf-8", errors="ignore").read()
            after = before
            for pattern, to in RENAMES:
                after = pattern.sub(to, after)
            if after != before:
                open(path, "w", encoding="utf-8").write(after)
                turned[path] = sum(1 for a, b in zip(before.split("\n"), after.split("\n")) if a != b)
            for number, text in enumerate(after.split("\n"), 1):
                if LEFT.search(text):
                    left.append(f"{os.path.relpath(path, os.path.dirname(root))}:{number}: {text.strip()[:150]}")

print(f"turned {sum(turned.values())} signals in {len(turned)} files")
print(f"left {len(left)}")
for entry in left:
    print(entry)
