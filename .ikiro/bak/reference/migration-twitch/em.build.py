"""`em` is `ctx.em`: forked at the twitch root in registerSubscriber, read off ctx in every effect.

usage: python3 -I em.build.py <root>
"""
import sys

ROOT = sys.argv[1]


def turn(path, pairs):
    full = f"{ROOT}/{path}"
    text = open(full).read()
    for old, new, count in pairs:
        assert text.count(old) == count, (path, old, text.count(old))
        text = text.replace(old, new)
    open(full, "w").write(text)


turn("subsystems/typology/entities/Terminal.ts", [("ctx.input.em", "ctx.em", 10)])
turn("subsystems/typology/entities/Buffer.ts", [("ctx.input.em", "ctx.em", 4)])
turn("systems/runtime/subjects/mode/traits/intented.js", [("ctx.input.em", "ctx.em", 1)])
turn(
    "subsystems/typology/gestalten/shard/datamap.js",
    [
        ("hook.input.em.getFilterParams(filter)", "hook.em.getFilterParams(filter)", 1),
        (
            "export function detached(datamap) {",
            "export const forked = (datamap) => (ctx, next) => {\n"
            "  ctx.em = datamap.entities.em.fork({ keepTransactionContext: true });\n"
            "  return next();\n"
            "};\n\n"
            "export function detached(datamap) {",
            1,
        ),
    ],
)
turn(
    "subsystems/typology/gestalten/shape/subscriber.js",
    [
        (
            "export function subscriber(twitch, { scope = (args, task) => task(), fork = (em) => em } = {}) {\n"
            "  const dispatch = (signal, args) => () => twitch.dispatch(signal, { ...args, em: fork(args.em) })",
            "export function subscriber(twitch, { scope = (args, task) => task() } = {}) {\n"
            "  const dispatch = (signal, args) => () => twitch.dispatch(signal, args)",
            1,
        )
    ],
)
turn(
    "subsystems/typology/prototypes/datamap.js",
    [
        (
            "    const fork = (em) => em.fork({ keepTransactionContext: true });\n"
            "    this.orm.em.getEventManager().registerSubscriber(shape.subscriber(twitch, { scope, fork }));",
            "    twitch.use(datamap.forked(this));\n"
            "    this.orm.em.getEventManager().registerSubscriber(shape.subscriber(twitch, { scope }));",
            1,
        )
    ],
)
print("built")
