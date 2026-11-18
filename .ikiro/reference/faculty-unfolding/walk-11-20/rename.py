"""rename.py <root> [--dry] — Q37: recipe in, mask out. Pure token rename, scoped:
  1. schematics/primitives/instance.js: every code token (comment rows untouched)
  2. every `v.primitives.instance.<Name>` in the tree
  3. every `{ A, B } = v.primitives.instance` destructure, and in THAT file each destructured local
"""
import re, sys, os
R = sys.argv[1].rstrip("/"); DRY = "--dry" in sys.argv
M = {
  "MaskStatics": "StaticsRecipe", "MaskSecrets": "SecretsRecipe", "MaskOf": "Recipe",
  "Statics": "StaticsMask", "Secrets": "SecretsMask", "Lighthouse": "LighthouseMask", "Datamap": "DatamapMask",
  "HallucinatorMask": "HallucinatorRecipe", "ModeMask": "ModeRecipe", "DaemonMask": "DaemonRecipe",
  "InstanceMask": "InstanceRecipe", "Ledger": "LedgerRecipe",
  "Hallucinator": "HallucinatorMask", "Mode": "ModeMask", "Modes": "ModeMasks", "Runtime": "RuntimeMask",
  "Client": "ClientMask", "Service": "ServiceMask", "Daemon": "DaemonMask", "Instance": "InstanceMask",
}
ALT = "|".join(sorted(M, key=len, reverse=True))
TOKEN = re.compile(r"(?<![\w$])(?<![\w)\]]\.)(%s)\b" % ALT)
QUALIFIED = re.compile(r"(v\.primitives\.instance\.)(%s)\b" % ALT)
DESTRUCTURE = re.compile(r"\{([A-Za-z, ]+)\}( = v\.primitives\.instance;)")
ROOTS = ["subsystems", "systems", "commons", "documentation"]
SKIP = {"node_modules", "bak", "dist", "build", "snapshots", ".jj", ".git"}
INSTANCE = "subsystems/typology/schematics/primitives/instance.js"
report = []
def code(text):
    return "\n".join(row if row.lstrip().startswith("//") else TOKEN.sub(lambda m: M[m.group(1)], row) for row in text.split("\n"))
SCOPED = {
  "subsystems/paladin/paladin/lifecycle.js": [
    ("v.collect(Instance, paladin.instance, Mountpoint)", "v.collect(InstanceMask, paladin.instance, Mountpoint)"),
  ],
}
def other(text, rel):
    out = QUALIFIED.sub(lambda m: m.group(1) + M[m.group(2)], text)
    held = []
    def names(m):
        parts = [part.strip() for part in m.group(1).split(",")]
        held.extend(part for part in parts if part in M)
        return "{ " + ", ".join(M.get(part, part) for part in parts) + " }" + m.group(2)
    out = DESTRUCTURE.sub(names, out)
    if held:
        local = re.compile(r"(?<![\w$\"'`/])(?<![\w)\]]\.)(%s)\b(?![\"'`\]])" % "|".join(sorted(set(held), key=len, reverse=True)))
        if rel in SCOPED:
            for old, new in SCOPED[rel]:
                assert out.count(old) == 1, (rel, old, out.count(old))
                out = out.replace(old, new)
        else:
            out = "\n".join(row if "= v.primitives.instance;" in row else local.sub(lambda m: M[m.group(1)], row) for row in out.split("\n"))
    return out, sorted(set(held))
for root in ROOTS:
    for dirpath, dirs, files in os.walk(f"{R}/{root}"):
        dirs[:] = [d for d in dirs if d not in SKIP]
        for name in files:
            if not name.endswith((".js", ".ts", ".jsx", ".mdx", ".md", ".svelte")): continue
            path = os.path.join(dirpath, name); rel = path[len(R) + 1:]
            try: text = open(path, encoding="utf-8").read()
            except (UnicodeDecodeError, OSError): continue
            if rel == INSTANCE: new, held = code(text), ["*"]
            elif "primitives.instance" in text: new, held = other(text, rel)
            else: continue
            if new != text:
                report.append((rel, held))
                if not DRY: open(path, "w", encoding="utf-8").write(new)
for rel, held in report: print(rel, " ".join(held))
print(len(report), "files")
