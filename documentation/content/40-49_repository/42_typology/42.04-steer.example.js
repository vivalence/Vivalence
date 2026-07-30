import { Vector, Signal, steer } from "@vivalence/typology"

export const name = "42.04-steer"

export async function run() {
  // ── strategy — `fire` dispatches on DECLARED ARITY. The atom under every executor.
  // The trap: arity counts declared parameters, so a handler spelled `(input) => …`
  // has arity 1 and receives the CONTEXT. Name it `(ctx)` or take both.
  const context = { input: "IN" }
  console.log("arity 0  →", steer.strategy.fire(() => "nullary", context))
  console.log("arity 1  →", steer.strategy.fire((ctx) => `unary:${ctx.input}`, context))
  console.log("arity 2  →", steer.strategy.fire((input, ctx) => `binary:${input}`, context))
  console.log("the trap →", steer.strategy.fire((input) => `looks-like-input:${input?.input}`, context))

  // ── match — THERE IS NO TYPE PRECEDENCE. Declaration order decides.
  // `scope` collects matches in trajectory-insertion order; `feed` takes the
  // first one carrying an effect. A parameter declared first SHADOWS a literal.
  const parameterFirst = new Vector().open("/u/:id", () => "PARAM").open("/u/list", () => "LITERAL")
  const literalFirst = new Vector().open("/u/list", () => "LITERAL").open("/u/:id", () => "PARAM")
  console.log("shadowed →", await steer.dispatch.invoke(parameterFirst, "/u/list")({}))
  console.log("reachable→", await steer.dispatch.invoke(literalFirst, "/u/list")({}))

  const vector = new Vector()
    .use(async (ctx, next) => { ctx.state.walked = true; await next() })
    .open("/users/list", () => "list")
    .open("/users/:id", (ctx) => `user:${ctx.params.id}`)
    .open("/files/(.*)", (ctx) => `file:${JSON.stringify(ctx.params)}`)

  // ── dispatch — the PATH family. Consumes a Signal, early-terminates on a match.
  console.log("param    →", await steer.dispatch.invoke(vector, "/users/7")({}))
  console.log("literal  →", await steer.dispatch.invoke(vector, "/users/list")({}))

  // a remainder binds each surplus segment to an INDEXED param, not a joined string.
  console.log("remainder→", await steer.dispatch.invoke(vector, "/files/a/b/c")({}))

  // traverse returns the raw quad [effect, carry, steps, node]; invoke = traverse + execute.
  const [effect, , steps] = steer.dispatch.traverse(vector, new Signal("/users/7"))
  console.log("traverse →", JSON.stringify({ found: !!effect, steps: steps.map((s) => s.nature) }))

  // ── trie — the TREE family. Enumerates the WHOLE vector; no Signal involved.
  console.log("rollup   →", JSON.stringify(steer.trie.rollup(vector).map((e) => e.steps.map((s) => s.nature).join("/"))))
  console.log("fold     →", JSON.stringify(steer.trie.fold(vector, {
    node: (frame) => ({ effect: frame.effect !== undefined, children: frame.trajectories.length }),
  })))

  if (steer.strategy.fire(() => "n", context) !== "n") throw new Error("0-arity takes no argument")
  if (steer.strategy.fire((ctx) => ctx.input, context) !== "IN") throw new Error("1-arity takes the context")
  if (steer.strategy.fire((input, ctx) => input, context) !== "IN") throw new Error("2-arity takes (input, context)")
  if (steer.strategy.fire((input) => input, context) === "IN")
    throw new Error("a 1-arity handler must receive the context, not the input")
  if (await steer.dispatch.invoke(parameterFirst, "/u/list")({}) !== "PARAM")
    throw new Error("a parameter declared first must shadow the literal")
  if (await steer.dispatch.invoke(literalFirst, "/u/list")({}) !== "LITERAL")
    throw new Error("a literal declared first must stay reachable")
  if (steer.trie.rollup(vector).length !== 3) throw new Error("rollup must find every leaf")
  console.log("tests    →", "6 assertions passed")
}
