"""After em.build.py: the root takes `em` off the input, and contexts.Twitch names `em` and `migrate`.

usage: python3 -I em.strip.py <root>
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
    "subsystems/typology/gestalten/shard/datamap.js",
    [
        (
            "  const flushing = ctx.input?.em ?? datamap.entities.em;\n"
            "  ctx.em = flushing.fork({ keepTransactionContext: true });\n",
            "  const { em = datamap.entities.em, ...input } = ctx.input ?? {};\n"
            "  ctx.em = em.fork({ keepTransactionContext: true });\n"
            "  ctx.input = input;\n",
        )
    ],
)
turn(
    "subsystems/typology/schematics/primitives/contexts.js",
    [
        (
            "export const optional = (set) =>",
            'export const em = { em: v.unknown().desc("The entity manager of the write that fired this effect, forked for it, inside its transaction. Example: await ctx.em.findOneOrFail(ModeEntity, ctx.input.entity.mode)") };\n'
            'export const migrate = { migrate: v.unknown().desc("The datamap\'s migration tools, on the migrate signals only: read · sql · renaming before a release, read · sql · mapping after it. Example: ctx.migrate.renaming(\\"View\\", \\"Surface\\")") };\n'
            "export const optional = (set) =>",
        ),
        (
            "export const Twitch = { ...vector, ...entities, ...call, ...cortex, ...providers, ...statics, ...domain, ...mountpoint, ...reference, ...optional(mode) };",
            "export const Twitch = { ...vector, ...entities, ...em, ...optional(migrate), ...call, ...cortex, ...providers, ...statics, ...domain, ...mountpoint, ...reference, ...optional(mode) };",
        ),
    ],
)
print("built")
