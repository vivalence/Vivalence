"""fencecheck — for each `// path:N` fence header in a file, compare the body line-by-line against the file from N.

python3 -I fencecheck.py <file> [<line-of-header>...]
Prints each body line with = (matches file line at the expected offset), ~ (found later in file, a skip), ✗ (absent).
"""
import os, re, sys

REPO = os.environ.get("CLAUDE_PROJECT_DIR", "/Users/finn/vivalence/code/vivalence")
HEADER = re.compile(r"^\s*(?://|#)\s+(\S+?\.(?:js|ts|jsx|mjs|svelte|sh|py|jsonc|json)):(\d+)\s*$")


def norm(s):
    return re.sub(r"\s+", " ", s.strip())


def check(doc, only):
    text = open(doc, encoding="utf-8").read().split("\n")
    for n, line in enumerate(text, 1):
        m = HEADER.match(line)
        if not m or (only and n not in only):
            continue
        path, start = m.group(1), int(m.group(2))
        full = os.path.expanduser(path) if path.startswith("~") else os.path.join(REPO, path)
        if not os.path.isfile(full):
            print(f"{doc}:{n} {path}:{start} MISSING FILE")
            continue
        src = [norm(l) for l in open(full, encoding="utf-8").read().split("\n")]
        body = []
        k = n
        while k < len(text) and not text[k].startswith("```") and not HEADER.match(text[k]):
            body.append(text[k]); k += 1
        at = start - 1
        marks = []
        for b in body:
            nb = norm(b)
            if not nb:
                if at < len(src) and src[at] == "":
                    at += 1
                marks.append(" "); continue
            if at < len(src) and src[at] == nb:
                marks.append("="); at += 1; continue
            later = next((i for i in range(at, len(src)) if src[i] == nb), None)
            if later is not None:
                marks.append(f"~{later + 1}"); at = later + 1
            else:
                marks.append("✗")
        verdict = "EXACT" if all(x in ("=", " ") for x in marks) else ("SKIPS" if "✗" not in marks else "DRIFT")
        print(f"{verdict:<5} {os.path.basename(doc)}:{n} {path}:{start} [{' '.join(marks)}]")


if __name__ == "__main__":
    check(sys.argv[1], {int(x) for x in sys.argv[2:]})
