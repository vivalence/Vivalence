"""regrammar — rewrite every `channels: { in: [...], out: [...] }` literal of the given files to the
via-keyed, mime-only grammar. Vias are read off the faculty's own `via:` that follows the literal.

    python3 regrammar.py <root> <file> [<file> ...]
"""
import re, sys

root, files = sys.argv[1].rstrip("/") + "/", sys.argv[2:]
CODEC = {"pcm_16000": "audio/pcm;rate=16000;channels=1", "mp3_44100_128": "audio/mpeg"}

def close(text, at):
    depth, quote = 0, None
    for i in range(at, len(text)):
        c = text[i]
        if quote:
            if c == quote and text[i - 1] != "\\": quote = None
            continue
        if c in "\"'`": quote = c
        elif c in "{[(": depth += 1
        elif c in "}])":
            depth -= 1
            if depth == 0: return i
    raise ValueError("unbalanced")

def split(body):
    out, depth, cur, quote = [], 0, "", None
    for i, c in enumerate(body):
        if quote:
            cur += c
            if c == quote and body[i - 1] != "\\": quote = None
            continue
        if c in "\"'`": quote = c
        if c in "{[(": depth += 1
        if c in "}])": depth -= 1
        if c == "," and depth == 0: out.append(cur.strip()); cur = ""
        else: cur += c
    if cur.strip(): out.append(cur.strip())
    return out

def element(item):
    m = re.fullmatch(r'"(\w+)"', item)
    if m: return '{ type: "%s" }' % m.group(1)
    m = re.fullmatch(r'\{\s*type:\s*"audio",\s*codec:\s*"(\w+)",?\s*\}', item)
    if m: return '{ type: "audio", mime: ["%s"] }' % CODEC[m.group(1)]
    if re.fullmatch(r'\{\s*type:\s*"event"\s*\}', item): return '{ type: "text" }'
    if item.startswith("..."): return re.sub(r'\["(\w+)"\]', r'[{ type: "\1" }]', item)
    return item

def side(items, add=()):
    items = [element(item) for item in items]
    for kind in add:
        entry = '{ type: "%s" }' % kind
        if entry not in items and not any(kind in item and item.startswith("...") for item in items): items.append(entry)
    return items

def vias(text, at):
    m = re.compile(r"\bvia:\s*").search(text, at)
    if not m or m.start() - at > 2500: return None
    if text[m.end()] != "{": return None
    body = text[m.end() + 1 : close(text, m.end())]
    keys = [re.match(r"(?:async\s+)?\*?\s*(\w+)", piece).group(1) for piece in split(body)]
    return [key for key in ("stream", "render") if key in keys]

for path in files:
    text = open(root + path, encoding="utf-8").read()
    out, at, n = "", 0, 0
    for m in re.finditer(r"channels:\s*\{\s*in:\s*\[", text):
        if m.start() < at: continue
        start, end = m.start(), close(text, text.index("{", m.start()))
        literal = text[start : end + 1]
        i0 = literal.index("[")
        i1 = close(literal, i0)
        o0 = literal.index("[", i1)
        o1 = close(literal, o0)
        ins, outs = split(literal[i0 + 1 : i1]), split(literal[o0 + 1 : o1])
        tooled = any("tool_result" in item for item in ins)
        ins = side(ins, ("tool_use",) if tooled else ())
        outs = side(outs)
        if any("thinking" in item and not item.startswith("...") for item in outs): ins = side(ins, ("thinking",))
        keys = vias(text, end)
        if keys is None: print(f"  HAND  {path}:{text[:start].count(chr(10)) + 1}"); continue
        indent = re.search(r"[ \t]*$", text[:start]).group(0)
        pad = indent + "  "
        def rows(items, deep):
            flat = "[" + ", ".join(items) + "]"
            if len(deep) + 8 + len(flat) <= 96: return flat
            return "[\n" + "".join(f"{deep}  {item},\n" for item in items) + deep + "]"
        block = "channels: {\n"
        for key in keys:
            flat = f"{pad}{key}: {{ in: {rows(ins, pad)}, out: {rows(outs, pad)} }},"
            if "\n" not in flat and len(flat) <= 100: block += flat + "\n"
            else: block += f"{pad}{key}: {{\n{pad}  in: {rows(ins, pad + '  ')},\n{pad}  out: {rows(outs, pad + '  ')},\n{pad}}},\n"
        block += indent + "}"
        out += text[at:start] + block
        at, n = end + 1, n + 1
    open(root + path, "w", encoding="utf-8").write(out + text[at:])
    print(f"{n:3d}  {path}")
