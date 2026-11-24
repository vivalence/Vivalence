"""open — give every test faculty literal that declares no channels an open one, keyed by its own vias.

    python3 open.py <root> <file> [<file> ...]
"""
import re, sys

root, files = sys.argv[1].rstrip("/") + "/", sys.argv[2:]
CONST = '''const KINDS = [
  "text",
  "image",
  "audio",
  "video",
  "document",
  "object",
  "tool_use",
  "tool_result",
  "thinking",
].map((type) => ({ type }));
const ANY = { in: KINDS, out: KINDS };
'''

def opener(text, at):
    depth = 0
    for i in range(at - 1, -1, -1):
        c = text[i]
        if c in "})]": depth += 1
        elif c in "{([":
            if depth == 0: return i
            depth -= 1
    return 0

def closer(text, at):
    depth = 0
    for i in range(at, len(text)):
        c = text[i]
        if c in "{[(": depth += 1
        elif c in "}])":
            depth -= 1
            if depth == 0: return i
    raise ValueError

def keys(body):
    out, depth, cur = [], 0, ""
    for c in body:
        if c in "{[(": depth += 1
        if c in "}])": depth -= 1
        if c == "," and depth == 0: out.append(cur.strip()); cur = ""
        else: cur += c
    if cur.strip(): out.append(cur.strip())
    found = [re.match(r"(?:async\s+)?\*?\s*\[?(\w+)", piece).group(1) for piece in out]
    return [key for key in ("stream", "render") if key in found]

for path in files:
    text = open(root + path, encoding="utf-8").read()
    out, at, n = "", 0, 0
    for m in re.finditer(r"(?<![\w.])via(?::\s*|(?=\s*[,}]))", text):
        start = opener(text, m.start())
        if text[start] != "{": continue
        end = closer(text, start)
        own = text[start:end]
        if re.search(r"(?<![\w.])channels\b", own) or not re.search(r"\btype\b|\.\.\.", own): continue
        after = text[m.end() :].lstrip()
        if text[m.start() : m.end()].rstrip().endswith(":") and after.startswith("{"):
            brace = text.index("{", m.end())
            held = keys(text[brace + 1 : closer(text, brace)])
            if not held: continue
            expr = "{ " + ", ".join(f"{key}: ANY" for key in held) + " }"
        else:
            named = re.match(r"[A-Za-z_]\w*(?=\s*[,}])", after)
            if text[m.start() : m.end()].rstrip().endswith(":") and not named: continue
            name = named.group(0) if text[m.start() : m.end()].rstrip().endswith(":") else "via"
            expr = f"Object.fromEntries(Object.keys({name}).map((key) => [key, ANY]))"
        out += text[at : m.start()] + f"channels: {expr}, "
        at, n = m.start(), n + 1
    text = out + text[at:]
    text = re.sub(r"^([ \t]*)(channels: (?:\{[^{}\n]*\}|Object\.fromEntries\([^\n]*?\]\)\)),) (via\b)", r"\1\2\n\1\3", text, flags=re.M)
    if n and "const ANY =" not in text:
        imports = list(re.finditer(r"^import .*?;\s*$|^import [\s\S]*?from .*?;\s*$", text, re.M))
        cut = imports[-1].end() + 1 if imports else 0
        text = text[:cut].rstrip("\n") + "\n\n" + CONST + "\n" + text[cut:].lstrip("\n")
    open(root + path, "w", encoding="utf-8").write(text)
    print(f"{n:3d}  {path}")
