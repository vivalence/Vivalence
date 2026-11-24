"""Both clients show the repo's version: the browser's paladin takes it from the bake, each client's system panel prints it.

usage: python3 -I shown.build.py <root>
"""
import sys

ROOT = sys.argv[1]


def turn(path, pairs):
    full = f"{ROOT}/{path}"
    text = open(full).read()
    for old, new in pairs:
        assert text.count(old) == 1, (path, old, text.count(old))
        text = text.replace(old, new)
    open(full, "w").write(text)


turn(
    "subsystems/paladin/paladin/lifecycle.js",
    [
        (
            "return JSON.parse(JSON.stringify({ env, instance: paladin.instance, wired:",
            "return JSON.parse(JSON.stringify({ env, version: paladin.version, instance: paladin.instance, wired:",
        ),
        (
            '  paladin.assign(data.env, "ledger");\n',
            '  paladin.assign(data.env, "ledger");\n  paladin.version = data.version;\n',
        ),
    ],
)
turn(
    "systems/ghost/skins/chrome/widgets/system/system.jsx",
    [
        (
            'import { fromm, is } from "@vivalence/typology";\n',
            'import { fromm, is } from "@vivalence/typology";\nimport paladin from "@vivalence/paladin";\n',
        ),
        (
            '<Heading palette={props.palette} label="client" count="" />',
            '<Heading palette={props.palette} label="client" count={paladin.version} />',
        ),
    ],
)
turn(
    "systems/anima/src/skins/chrome/panels/sidebar/sections.js",
    [
        (
            'import { belt } from "@vivalence/ghost";\n',
            'import { belt } from "@vivalence/ghost";\nimport paladin from "@vivalence/paladin";\n',
        ),
        ('    sub("client", ""),\n', '    sub("client", paladin.version),\n'),
    ],
)
print("built")
