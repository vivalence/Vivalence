"""render — expand <<path:a-b>> (or <<path:a>>, several joined by ' + ') into a fence of the file's exact lines.

python3 -I render.py <template> <out>
One fence per directive line; ' + ' joins citations into ONE fence, each under its own `// path:a` header.
The fence language comes from the first path's extension; `#` headers for sh/py.
"""
import os, re, sys

REPO = os.environ.get("CLAUDE_PROJECT_DIR", "/Users/finn/vivalence/code/vivalence")
DIRECTIVE = re.compile(r"^<<(.+)>>\s*$")
ONE = re.compile(r"^(\S+?):(\d+)(?:-(\d+))?$")
LANG = {".js": "js", ".mjs": "js", ".jsx": "jsx", ".ts": "ts", ".svelte": "svelte", ".sh": "sh", ".py": "py", ".jsonc": "jsonc", ".json": "json"}


def fence(spec):
    parts = [p.strip() for p in spec.split(" + ")]
    first = ONE.match(parts[0]).group(1)
    ext = os.path.splitext(first)[1]
    lang = LANG.get(ext, "")
    mark = "#" if lang in ("sh", "py") else "//"
    out = [f"```{lang}"]
    for p in parts:
        m = ONE.match(p)
        if not m:
            raise SystemExit(f"bad directive part: {p}")
        path, a = m.group(1), int(m.group(2))
        b = int(m.group(3) or a)
        lines = open(os.path.join(REPO, path), encoding="utf-8").read().split("\n")
        if b > len(lines):
            raise SystemExit(f"{path}:{b} past EOF ({len(lines)})")
        out.append(f"{mark} {path}:{a}")
        out += lines[a - 1:b]
    out.append("```")
    return "\n".join(out)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    text = open(src, encoding="utf-8").read().split("\n")
    rendered = [fence(DIRECTIVE.match(l).group(1)) if DIRECTIVE.match(l) else l for l in text]
    body = "\n".join(rendered)
    open(dst, "w", encoding="utf-8").write(body)
    m = re.search(r"limit: (\d+) chars", body)
    print(f"{os.path.relpath(dst, REPO)} {len(body)} chars" + (f" / {m.group(1)}" + (" OVER" if len(body) > int(m.group(1)) else "") if m else " (no limit)"))


main()
