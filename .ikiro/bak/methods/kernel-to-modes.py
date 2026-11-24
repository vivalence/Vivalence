import json, re, sys, pathlib
write = "--write" in sys.argv
paths = [pathlib.Path(p) for p in sys.argv[1:] if p != "--write"]
for path in paths:
    text = path.read_text(); data = json.loads(text)
    found = []
    def walk(node, at):
        if isinstance(node, dict):
            for key, value in node.items():
                if key == "kernel": found.append(at + "/" + key)
                walk(value, at + "/" + key)
        elif isinstance(node, list):
            for index, value in enumerate(node): walk(value, f"{at}/{index}")
    walk(data, "")
    bad = [f for f in found if not re.fullmatch(r"/daemons/\d+/kernel", f)]
    assert not bad, (path, bad)
    count = len(re.findall(r'"kernel"(\s*):', text)); assert count == len(found), (path, count, found)
    out = re.sub(r'"kernel"(\s*):', r'"modes"\1:', text)
    assert json.loads(out) is not None
    print(path, len(found), "→ modes")
    if write: path.write_text(out)
