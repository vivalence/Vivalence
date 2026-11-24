import re, sys, pathlib

root = pathlib.Path(sys.argv[1])
write = "--write" in sys.argv
scan = [root] if "--all" in sys.argv else [root / p for p in ["systems/runtime", "commons", "subsystems/typology/gestalten", "subsystems/paladin", "subsystems/typology/tests"]]

HOSTWORDS = "entities|modes|call|cortex|statics|domain|services|mountpoint|datamap|controller|reference"

rules = [
    (re.compile(r"([\w.]+)\s*\n?\s*\.flatmodes\(\)"), r"fromm.modes(\1.modes).flat", "fromm"),
    (re.compile(r"ctx\.daemon\.(" + HOSTWORDS + r")\b"), r"ctx.\1", None),
    (re.compile(r"ctx\.runtime\.(" + HOSTWORDS + r")\b"), r"ctx.\1", None),
    (re.compile(r"shard\.context\.bind\(\s*\"daemon\"\s*,\s*"), "shard.context.spread(contexts.host, ", "contexts"),
    (re.compile(r"shard\.context\.bind\(\s*\"runtime\"\s*,\s*"), "shard.context.spread(contexts.host, ", "contexts"),
    (re.compile(r"shard\.context\.bind\((die\.host|host|bearer)\.type,\s*\1\)"), r"shard.context.spread(contexts.host, \1)", "contexts"),
    (re.compile(r"\(ctx\.daemon\b([,)])"), r"(ctx\1", None),
]

IMPORT = re.compile(r'^import \{([^}]*)\} from "@vivalence/typology";', re.M)

def ensure(text, name):
    if re.search(r"\b" + name + r"\b", IMPORT.search(text).group(1) if IMPORT.search(text) else ""):
        return text
    m = IMPORT.search(text)
    if m:
        names = [n.strip() for n in m.group(1).split(",") if n.strip()]
        names.append(name)
        names.sort(key=str.lower)
        return text[: m.start()] + "import { " + ", ".join(names) + ' } from "@vivalence/typology";' + text[m.end() :]
    return 'import { ' + name + ' } from "@vivalence/typology";\n' + text

touched = []
for base in scan:
    for path in base.rglob("*"):
        if path.suffix not in (".js", ".ts") or "node_modules" in path.parts or "bak" in str(path):
            continue
        text = path.read_text()
        out = text
        needs = set()
        for rx, rep, imp in rules:
            new, n = rx.subn(rep, out)
            if n and imp:
                needs.add(imp)
            out = new
        if out == text:
            continue
        for name in sorted(needs):
            if str(path).endswith("schematics/primitives/contexts.js") or "/gestalten/fromm/" in str(path):
                continue
            out = ensure(out, name)
        touched.append((str(path.relative_to(root)), len(re.findall(r"\n", text)) ))
        if write:
            path.write_text(out)
for p, _ in touched:
    print(p)
print(len(touched), "files", "WRITTEN" if write else "DRY")
