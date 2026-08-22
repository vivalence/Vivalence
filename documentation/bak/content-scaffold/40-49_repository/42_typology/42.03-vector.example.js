import { Vector, v, shape } from "@vivalence/typology"

export const name = "42.03-vector"

export async function run() {
  // LAW 1 — one effect per node. A node may be BOTH a leaf and a branch.
  const dual = new Vector()
    .affect(() => "ROOT")
    .open("/child", () => "CHILD")
  console.log("dual     →", JSON.stringify({ root: !!dual.effect, branches: dual.patterns.length }))

  // LAW 2 — "no path is a path". branch("/") is the identity; open("/") ≡ affect().
  const node = new Vector()
  console.log("identity →", node.branch("/") === node && node.branch("") === node)

  const viaOpen = new Vector().open("/", () => "R")
  const viaAffect = new Vector().affect(() => "R")
  console.log("root     →", await shape.object(viaOpen)({}), await shape.object(viaAffect)({}))

  // LAW 3 — metadata rides the EDGE (the pattern), never the node.
  // One vector can be arrived at by many patterns, so the pattern owns the schema.
  const described = new Vector()
  described.open({ nature: "/deal", input: v.object({ count: v.integer() }), valence: "deal cards" }, () => {})
  const [edge] = described.patterns
  console.log("edge     →", JSON.stringify({ nature: edge.nature, valence: edge.valence, hasInput: !!edge.input }))
  console.log("node     →", JSON.stringify({ hasInput: !!described.branch("deal").input }))

  // LAW 4 — slurp SHARES middleware; swallow OWNS (isolates) it.
  const donor = new Vector().use(async (ctx, next) => { ctx.seen = true; await next() }).open("/leaf", () => "L")

  const shared = new Vector().slurp(donor)
  const owned = new Vector().swallow(donor)
  console.log("slurp    →", JSON.stringify({ carry: shared.carry.length, sameNode: shared.branch("leaf") === donor.branch("leaf") }))
  console.log("swallow  →", JSON.stringify({ carry: owned.carry.length, sameNode: owned.branch("leaf") === donor.branch("leaf") }))

  // branch is idempotent — asking twice returns the same trajectory.
  const grown = new Vector()
  console.log("idempot  →", grown.branch("users") === grown.branch("users"))

  if (!dual.effect || dual.patterns.length !== 1) throw new Error("a node may be leaf AND branch")
  if (node.branch("/") !== node) throw new Error('branch("/") must be the identity')
  if (edge.valence !== "deal cards") throw new Error("valence belongs to the edge")
  if (described.branch("deal").input) throw new Error("the node must NOT carry edge metadata")
  if (shared.branch("leaf") !== donor.branch("leaf")) throw new Error("slurp shares nodes")
  if (owned.branch("leaf") === donor.branch("leaf")) throw new Error("swallow must own its nodes")
  console.log("tests    →", "6 assertions passed")
}
