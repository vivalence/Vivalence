import json, os, re, sys

home = os.path.expanduser("~")
repo = "/Users/finn/vivalence/code/vivalence"
roots = [os.path.join(repo, d) for d in ("systems", "subsystems", "commons", "testament", "documentation")] + [os.path.join(home, ".viva/registry")]
skip_dirs = {"node_modules", ".git", ".jj", ".astro", "dist", ".svelte-kit", "bundles"}
extensions = (".js", ".ts", ".mjs", ".jsx", ".tsx", ".svelte", ".mdx")
pattern = re.compile(r'import\s+(type\s+)?(\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*from\s*["\'](@mikro-orm/[\w-]+)["\']', re.S)
reexport = re.compile(r'export\s+(type\s+)?(\{[^}]*\}|\*(?:\s+as\s+\w+)?)\s*from\s*["\'](@mikro-orm/[\w-]+)["\']', re.S)

def dead(path):
    return "/bak/" in path or ".bak" in path or "/bak." in path

rows = []
for root in roots:
    for directory, subdirs, files in os.walk(root):
        subdirs[:] = [s for s in subdirs if s not in skip_dirs]
        for file in files:
            if not file.endswith(extensions):
                continue
            path = os.path.join(directory, file)
            try:
                text = open(path, encoding="utf-8").read()
            except Exception:
                continue
            if "@mikro-orm" not in text:
                continue
            for regex, verb in ((pattern, "import"), (reexport, "export")):
                for match in regex.finditer(text):
                    whole_type = bool(match.group(1))
                    clause = match.group(2)
                    package = match.group(3)
                    line = text[: match.start()].count("\n") + 1
                    names = []
                    if clause.startswith("{"):
                        for part in clause.strip("{}").split(","):
                            part = part.strip()
                            if not part:
                                continue
                            is_type = whole_type or part.startswith("type ")
                            name = part.replace("type ", "", 1).split(" as ")[0].strip()
                            names.append({"name": name, "type": is_type})
                    else:
                        names.append({"name": clause.strip(), "type": whole_type, "namespace": True})
                    rows.append({"path": path.replace(home, "~").replace(repo + "/", ""), "line": line, "verb": verb, "package": package, "names": names, "dead": dead(path)})
json.dump(rows, sys.stdout)
