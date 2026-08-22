import { Span, Vector, shape } from "@vivalence/typology"

export const name = "home"

export async function run() {
  const span = new Span("greet")
  span.open()

  // ONE declaration — the same shape a daemon grafts under /mode/:type/:slug.
  const vector = new Vector().open("/greet", (context) => ({ hello: context.request.body.name }))
  span.note({ declared: "/greet" })

  // shape.object folds it into a nested callable, dispatched in-process.
  const yielded = await shape.object(vector).greet({ name: "world" })
  span.note(yielded)

  span.close()

  if (yielded?.hello !== "world") throw new Error(`dispatch yielded nothing: ${JSON.stringify(yielded)}`)
  console.log("yielded  →", JSON.stringify(yielded))
  return span.records
}
