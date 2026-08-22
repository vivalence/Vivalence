import { Span, Vector, shape } from "@vivalence/typology"

export const name = "47.03-trace"
export function run() {
  const span = new Span()
  span.open()
  const vector = new Vector()
  vector.open("/echo", (context) => context)
  span.note({ built: "two-branch vector" })
  const stripped = shape.strip(vector)
  span.note({ stripped })
  span.close()
  return span.records
}
