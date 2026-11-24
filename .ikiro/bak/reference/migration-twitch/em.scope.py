"""After em.build.py + em.strip.py: no em on a dispatch's input at all. The subscriber opens the flushing em's
context around the dispatch, the root middleware forks from that context.

usage: python3 -I em.scope.py <root>
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
    "subsystems/typology/gestalten/shape/subscriber.js",
    [
        (
            "export function subscriber(twitch, { scope = (args, task) => task() } = {}) {\n"
            "  const dispatch = (signal, args) => () => twitch.dispatch(signal, args)\n"
            "  async function emit(phase, op, args) {\n"
            '    const name = args.meta?.className?.toLowerCase()?.replace("entity", "")\n'
            '      ?? args.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")\n'
            "    if (!name) return\n\n"
            "    const signal = new Signal(`${phase}/${name}/${op}`)\n"
            '    if (phase === "before") return dispatch(signal, args)()\n'
            "    await scope(args, dispatch(signal, args))\n"
            "  }",
            "export function subscriber(twitch, { scope = (em, task) => task() } = {}) {\n"
            "  async function emit(phase, op, { em, ...input }) {\n"
            '    const name = input.meta?.className?.toLowerCase()?.replace("entity", "")\n'
            '      ?? input.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")\n'
            "    if (!name) return\n\n"
            "    const signal = new Signal(`${phase}/${name}/${op}`)\n"
            "    await scope(em, () => twitch.dispatch(signal, input))\n"
            "  }",
        )
    ],
)
turn(
    "subsystems/typology/prototypes/datamap.js",
    [
        (
            "    const scope = (args, task) => RequestContext.create(args.em, task);",
            "    const scope = (em, task) => RequestContext.create(em, task, { keepTransactionContext: true });",
        )
    ],
)
turn(
    "subsystems/typology/gestalten/shard/datamap.js",
    [
        (
            "  const { em = datamap.entities.em, ...input } = ctx.input ?? {};\n"
            "  ctx.em = em.fork({ keepTransactionContext: true });\n"
            "  ctx.input = input;\n",
            "  ctx.em = datamap.entities.em.fork({ keepTransactionContext: true });\n",
        )
    ],
)
print("built")
