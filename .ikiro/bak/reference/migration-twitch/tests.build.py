"""The two suites that call the datamap's provider hand it a version and a twitch.

usage: python3 -I tests.build.py <root>
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
    "systems/runtime/tests/mint.test.js",
    [
        (
            'const datamap = { mountpoint: new Path(home), statics: { db: { file: "boot.viva.db" } } };',
            'const datamap = { mountpoint: new Path(home), statics: { db: { file: "boot.viva.db" } }, version: "2026.11.0" };',
        ),
        (
            "const boot = async () => (await provider(datamap, { entities })).orm.close();",
            "const boot = async () => (await provider(datamap, { twitch: new Twitch(), entities })).orm.close();",
        ),
    ],
)
turn(
    "systems/runtime/tests/runtime/composition.test.js",
    [
        (
            'import { specimen, Url, Connection, shard, Path, shape, Aperture } from "@vivalence/typology";',
            'import { specimen, Url, Connection, shard, Path, shape, Aperture, Twitch } from "@vivalence/typology";',
        ),
        (
            "const datamap = await provider({ mountpoint: new Path(home), statics: { db: { file: FILE } } }, { entities: schemas });",
            "const datamap = await provider(\n"
            "      { mountpoint: new Path(home), statics: { db: { file: FILE } }, version: paladin.version },\n"
            "      { twitch: new Twitch(), entities: schemas },\n"
            "    );",
        ),
    ],
)
print("built")
