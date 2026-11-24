import re
import sys

comp, bundle, tree, additions, out = sys.argv[1:6]

HOST = ":host { flex: 1; min-height: 0; display: flex; flex-direction: column; }"

RENAMED = [
    ("--surface-sunk", "--plane-sunk"),
    ("--surface-lift", "--plane-lift"),
    ("--surface", "--plane"),
    ("flex-direction:column;width:100%;height:100vh;overflow", "flex:1;min-height:0;flex-direction:column;overflow"),
    (".dock{flex:none;", ".dock{flex:none;width:var(--width);"),
    ("height:100%;min-height:0}", "width:var(--width);height:100%;min-height:0}"),
    (
        "max-width:66ch;font-family:var(--font-family-serif-text);font-size:var(--size-type-md);"
        "line-height:var(--size-leading-loose)",
        "max-width:var(--measure);font-family:var(--face);font-size:var(--type);line-height:var(--leading)",
    ),
    (".is-focus .head,.is-focus .ln{", ".is-focus .head{"),
    (
        ".is-focus .titlebar,.is-focus .tools,.is-focus .status,",
        ".is-focus .titlebar,.is-focus .tools,.is-focus .status,\n",
    ),
]

MOCK = re.compile(
    r"\.(dock\.library|dock\.inspector|library \.dock-in|inspector \.dock-in|lines|ln|mk|em|st|cd|lk|ref|caret)\b"
    r"|\.leaf\.(is|has)-|\.is-focus \.ln"
)
TAKEN = re.compile(
    r"\.kit button |\.kit-seg( \{|:hover|\.is-attention|\.is-off)|\.kit-consent"
)
DROPPED = re.compile(r"\.kit-(row \.unsaved|choice>button\.go|field\.new)")


def spaced(selector):
    return re.sub(r",(?=\S)", ", ", selector.strip()).replace(",\n", ",\n")


def rule(line):
    selector, body = line.rstrip("}").split("{", 1)
    held = [part.split(":", 1) for part in body.split(";") if part]
    declared = [f"{name.strip()}: {value.strip()};" for name, value in held]
    flat = f"{spaced(selector)} {{ {' '.join(declared)} }}"
    if len(flat) <= 100 and "\n" not in flat:
        return flat
    return "\n".join([f"{spaced(selector)} {{", *[f"  {entry}" for entry in declared], "}"])


text = open(comp).read()
for before, after in RENAMED:
    if before not in text:
        raise SystemExit(f"the comp lacks {before!r}")
    text = text.replace(before, after)
rules = re.findall(r"[^{}]+\{[^{}]*\}|\n\n", text.strip())
sheet = ["" if held == "\n\n" else rule(held.strip()) for held in rules if not MOCK.match(held.strip())]
kit = [
    line
    for line in open(tree).read().split("\n")
    if re.match(r"\.kit[ -]|@keyframes kit", line) and line.rstrip().endswith("}")
    and not DROPPED.match(line)
]
taken = [line for line in open(bundle).read().split("\n") if TAKEN.match(line)]
own = open(additions).read().strip().split("\n")
open(out, "w").write("\n".join([HOST, *sheet, "", *own, "", *kit, *taken]) + "\n")
print(len(sheet), "comp lines", len(kit), "kit lines kept", len(taken), "kit lines taken")
