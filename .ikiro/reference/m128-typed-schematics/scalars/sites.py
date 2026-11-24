"""every scalar site under subsystems/typology/schematics, with the key path it sits at.

    python3 sites.py            # file:line <TAB> path <TAB> builder <TAB> expression
"""
import os
import re
import sys

ROOT = "/Users/finn/vivalence/code/vivalence"
HOME = "subsystems/typology/schematics"
LEAVES = (
    "v.string", "v.number", "v.integer", "v.boolean", "v.null",
    "v.instant", "v.date", "v.duration", "v.datetime", "v.zoned",
    "v.const", "v.enum", "v.url", "v.mime", "v.slug",
    "slug", "url", "mime.type", "type",
    "Path", "FilePath", "Url", "Signal", "Signature", "Action", "Pattern", "Reference",
)
NAMED = (
    "ID", "Slug", "JWTToken", "Username", "Password", "Mountpoint",
    "Hex", "Alpha", "Color", "Px", "Percent", "Rem", "Em", "Factor", "Ratio", "Leading",
    "Shadow", "Family", "Glow", "Filter", "Probability", "Themed",
)
WORD = re.compile(r"[A-Za-z_$][A-Za-z0-9_$.]*")


def blank(text):
    """strings, templates and comments become spaces; the offsets hold."""
    out = list(text)
    index = 0
    while index < len(text):
        two = text[index:index + 2]
        if two == "//":
            end = text.find("\n", index)
            end = len(text) if end == -1 else end
            for at in range(index, end):
                out[at] = " "
            index = end
            continue
        if two == "/*":
            end = text.find("*/", index) + 2
            for at in range(index, end):
                if text[at] != "\n":
                    out[at] = " "
            index = end
            continue
        if text[index] in "\"'`":
            quote = text[index]
            end = index + 1
            while text[end] != quote:
                end += 2 if text[end] == "\\" else 1
            for at in range(index + 1, end):
                if text[at] != "\n":
                    out[at] = " "
            index = end + 1
            continue
        index += 1
    return "".join(out)


def call(code, start):
    depth = 0
    for index in range(start, len(code)):
        if code[index] in "([{":
            depth += 1
        if code[index] in ")]}":
            depth -= 1
            if depth == 0:
                return index + 1
    return len(code)


def chain(code, end):
    while True:
        match = re.match(r"\s*\.([A-Za-z$]+)\(", code[end:])
        if not match:
            return end
        end = call(code, end + match.end() - 1)


def walk(text):
    code = blank(text)
    stack = []
    root = "·"
    index = 0
    last = ""
    pending = ""
    while index < len(code):
        char = code[index]
        if not stack:
            match = re.compile(r"(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=").match(code, index)
            if match and (index == 0 or code[index - 1] == "\n"):
                root = match.group(1)
                index = match.end()
                last = ""
                continue
            match = re.compile(r"([A-Z][A-Za-z0-9_$]*\.[A-Za-z0-9_$.]+)\s*=[^=>]").match(code, index)
            if match and (index == 0 or code[index - 1] == "\n"):
                root = match.group(1)
                index = match.end() - 1
                last = ""
                continue
        match = WORD.match(code, index)
        if match and (index == 0 or not re.match(r"[A-Za-z0-9_$.]", code[index - 1])):
            word = match.group(0)
            broken = re.compile(r"\s+\.([A-Za-z$]+)").match(code, match.end()) if word == "v" else None
            if broken:
                word = "v." + broken.group(1)
                match = broken
            after = code[match.end():match.end() + 1]
            tail = code[match.end():].lstrip(" ")
            frame = stack[-1] if stack else None
            if frame and frame["kind"] == "{" and tail.startswith(":") and "." not in word:
                frame["key"] = word
            elif after == "(" and word in LEAVES:
                yield index, word, path(root, stack), match.end()
            elif word.split(".")[0] in NAMED and after != "(" and not tail.startswith("="):
                yield index, word.split(".")[0], path(root, stack), 0
            elif word.split(".")[0] in NAMED and "." in word and not tail.startswith("="):
                yield index, word.split(".")[0], path(root, stack), 0
            last = word
            index = match.end()
            continue
        if char in "\"'" and stack and stack[-1]["kind"] == "{":
            end = text.find(char, index + 1)
            if code[end + 1:].lstrip(" ").startswith(":"):
                stack[-1]["key"] = text[index + 1:end]
            index = end + 1
            last = ""
            continue
        if char in "([{":
            stack.append({"kind": char, "callee": last if char == "(" else "", "key": "", "commas": 0})
            last = ""
        elif char in ")]}":
            if stack:
                stack.pop()
            last = ""
        elif char == ",":
            if stack:
                stack[-1]["commas"] += 1
                if stack[-1]["kind"] == "{":
                    stack[-1]["key"] = ""
            last = ""
        elif not char.isspace():
            last = last if char == "." else ""
        index += 1


def path(root, stack):
    parts = [root]
    for frame in stack:
        if frame["kind"] == "{" and frame["key"]:
            parts.append("." + frame["key"])
        if frame["kind"] == "(" and frame["callee"] == "v.array" and frame["commas"] == 0:
            parts.append("[]")
        if frame["kind"] == "(" and frame["callee"] == "v.record":
            parts.append("{key}" if frame["commas"] == 0 else "{}")
        if frame["kind"] == "[" :
            parts.append("|")
    return "".join(parts)


def sites(relative):
    text = open(os.path.join(ROOT, relative)).read()
    code = blank(text)
    for at, word, where, called in walk(text):
        line = text.count("\n", 0, at) + 1
        row = text[text.rfind("\n", 0, at) + 1:text.find("\n", at)]
        if re.match(r"\s*(import|export \{|export \*)", row):
            continue
        end = chain(code, call(code, called) if called else at + len(word))
        yield line, where, word, " ".join(text[at:end].split())


def main():
    width = int(sys.argv[1]) if len(sys.argv) > 1 else 110
    for folder, _, files in sorted(os.walk(os.path.join(ROOT, HOME))):
        if "/bak" in folder:
            continue
        for name in sorted(files):
            if not name.endswith(".js"):
                continue
            relative = os.path.relpath(os.path.join(folder, name), ROOT)
            short = relative[len(HOME) + 1:]
            for line, where, word, expression in sites(relative):
                print(f"{short}:{line}\t{where}\t{word}\t{expression[:width]}")


main()
