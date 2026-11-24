"""viamove — a faculty literal's `via: { name: fn }` moves into `channels.<name>.via`.

    python3 viamove.py <root> <path> [<path> ...]

Each `via: {` literal whose object also holds a `channels: {` literal is rewritten in place.
A literal it cannot move (no sibling channels, a channels value that is no literal) is printed, never guessed.
"""
import re, sys

root, paths = sys.argv[1].rstrip("/") + "/", sys.argv[2:]
OPEN, CLOSE = "{[(", "}])"


def pairs(text):
    """every bracket pair of the text, strings · templates · comments skipped: {open: close}"""
    found, stack, i, n = {}, [], 0, len(text)
    while i < n:
        c = text[i]
        if c in "\"'":
            i += 1
            while i < n and text[i] != c:
                i += 2 if text[i] == "\\" else 1
        elif c == "`":
            i += 1
            while i < n and text[i] != "`":
                if text[i] == "\\": i += 2; continue
                if text[i] == "$" and text[i + 1:i + 2] == "{":
                    depth, i = 1, i + 2
                    while i < n and depth:
                        depth += (text[i] == "{") - (text[i] == "}")
                        i += 1
                    continue
                i += 1
        elif c == "/" and text[i + 1:i + 2] == "/":
            while i < n and text[i] != "\n": i += 1
            continue
        elif c == "/" and text[i + 1:i + 2] == "*":
            i = text.index("*/", i) + 1
        elif c in OPEN:
            stack.append(i)
        elif c in CLOSE and stack:
            found[stack.pop()] = i
        i += 1
    return found


def entries(text, found, start, end):
    """the top-level entries of the object literal text[start..end]: [(from, to)] without commas"""
    out, at, i = [], start + 1, start + 1
    while i < end:
        if i in found: i = found[i] + 1; continue
        if text[i] in "\"'`":
            quote, i = text[i], i + 1
            while i < end and text[i] != quote:
                i += 2 if text[i] == "\\" else 1
        elif text[i] == "/" and text[i + 1:i + 2] == "/":
            i = text.index("\n", i)
            continue
        elif text[i] == ",":
            out.append((at, i)); at = i + 1
        i += 1
    if text[at:end].strip(): out.append((at, end))
    return out


def keyed(text, span):
    """(name, value from, value to) of one entry; a shorthand `name` is its own value"""
    raw = text[span[0]:span[1]]
    lead = len(raw) - len(raw.lstrip())
    match = re.match(r"(?:\s*//[^\n]*\n)*\s*([A-Za-z_$][\w$]*)\s*:\s*", raw)
    if not match: return raw.strip(), span[0] + lead, span[0] + len(raw.rstrip())
    return match.group(1), span[0] + match.end(), span[0] + len(raw.rstrip())


def indent(text, at):
    line = text[text.rfind("\n", 0, at) + 1:at + 200].split("\n")[0]
    return len(line) - len(line.lstrip())


def shifted(text, start, end, to):
    """text[start..end] with its continuation lines moved so its first line sits at `to` spaces"""
    lines = text[start:end].split("\n")
    delta = to - indent(text, start)
    moved = [lines[0]]
    for line in lines[1:]:
        if not line.strip(): moved.append(line); continue
        moved.append(" " * max(0, len(line) - len(line.lstrip()) + delta) + line.lstrip())
    return "\n".join(moved)


def moved(text, path):
    done = 0
    while True:
        found = pairs(text)
        closes = {close: open for open, close in found.items()}
        target = None
        for match in re.finditer(r"(?<![\w.$\"'])via:\s*\{", text):
            brace = match.end() - 1
            if brace not in found: continue
            holders = [o for o, c in found.items() if text[o] == "{" and o < match.start() and c > found[brace]]
            if not holders: continue
            holder = max(holders)
            spans = entries(text, found, holder, found[holder])
            names = {keyed(text, span)[0]: span for span in spans}
            if "channels" not in names or "via" not in names: continue
            _, value, value_end = keyed(text, names["channels"])
            if text[value] != "{" or found.get(value) != value_end - 1: continue
            target = (holder, names, value, brace)
            break
        if not target: break
        holder, names, channels, via = target
        sides = [keyed(text, span) for span in entries(text, found, channels, found[channels])]
        vias = [keyed(text, span) for span in entries(text, found, via, found[via])]
        flat = "\n" not in text[channels:found[channels]] and "\n" not in text[via:found[via]]
        base = indent(text, names["channels"][0] + len(text[names["channels"][0]:]) - len(text[names["channels"][0]:].lstrip()))
        order = [name for name, _, _ in sides] + [name for name, _, _ in vias if name not in {s[0] for s in sides}]
        built = []
        for name in order:
            side = next((s for s in sides if s[0] == name), None)
            fn = next((f for f in vias if f[0] == name), None)
            inner = []
            if side:
                _, a, b = side
                if text[a] == "{" and found.get(a) == b - 1:
                    for span in entries(text, found, a, b - 1):
                        key, x, y = keyed(text, span)
                        first = span[0] + len(text[span[0]:span[1]]) - len(text[span[0]:span[1]].lstrip())
                        inner.append(shifted(text, first, y, base + 4))
                else:
                    inner.append("..." + shifted(text, a, b, base + 4))
            if fn:
                _, a, b = fn
                inner.append("via: " + shifted(text, a, b, base + 4))
            if flat:
                built.append(f"{name}: {{ {', '.join(inner)} }}")
            else:
                body = "".join(" " * (base + 4) + part + ",\n" for part in inner)
                built.append(" " * (base + 2) + f"{name}: {{\n{body}" + " " * (base + 2) + "},\n")
        fresh = "{ " + ", ".join(built) + " }" if flat else "{\n" + "".join(built) + " " * base + "}"
        start, end = names["via"]
        if text[end:end + 1] == ",": end += 1
        else:
            end = start + len(text[start:end].rstrip())
            start = text.rfind(",", 0, start)
        edits = sorted([(channels, found[channels] + 1, fresh), (start, end, "")], reverse=True)
        for a, b, new in edits: text = text[:a] + new + text[b:]
        done += 1
    left = [
        text.count("\n", 0, m.start()) + 1
        for m in re.finditer(r"(?<![\w.$\"'])via:\s*\{\s*(render|stream)\b", text)
    ]
    return text, done, left


for path in paths:
    text = open(root + path).read()
    fresh, done, left = moved(text, path)
    if fresh != text: open(root + path, "w").write(fresh)
    print(f"{path}: moved {done}" + (f" · left at lines {left}" if left else ""))
