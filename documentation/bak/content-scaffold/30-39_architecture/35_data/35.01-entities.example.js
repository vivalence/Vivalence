import { v } from "@vivalence/typology"

export const name = "35.01-entities"

// An entity is a STABLE SKELETON plus an OPEN trait-space.
// The skeleton is fixed by the descriptor; the trait-space is a bare record
// until someone NARROWS it at the point of use.
export function run() {
  // 1 — the open shape. `trait` is an unconstrained record; anything passes.
  const open = v.literal()
  const loose = { slug: "hablar", traits: ["TRANSLATED"], trait: { TRANSLATED: { anything: 1 } } }
  console.log("open     →", [...v.errors(open, loose)].length === 0 ? "accepts anything" : "rejected")

  // 2 — narrowing. `narrowable: ["trait"]` lets a call site hand in a plain
  //     object of schemas; v wraps it and intersects it onto the entity.
  const narrowed = v.literal({
    trait: {
      TRANSLATED: v.object({ known: v.string(), learning: v.string() }),
    },
  })

  const good = { slug: "hablar", traits: ["TRANSLATED"], trait: { TRANSLATED: { known: "to speak", learning: "hablar" } } }
  const bad = { slug: "hablar", traits: ["TRANSLATED"], trait: { TRANSLATED: { known: 42 } } }
  console.log("narrowed →", JSON.stringify({
    good: [...v.errors(narrowed, good)].length,
    bad: [...v.errors(narrowed, bad)].length > 0 ? "rejected" : "accepted",
  }))

  // 3 — the buffer mask is the SAME mechanism, on `data`.
  //     This is what an APPLICATION mode declares as its payload contract.
  const mask = v.buffer({ data: { face: v.string(), value: v.integer() } })
  const buffer = v.fill(mask, { data: { face: "ace", value: 1 } })
  console.log("mask     →", JSON.stringify(buffer.data))

  // 4 — traits are a CLAIM (array), the payload is the DATA (record).
  //     The two are independent: claiming without carrying is legal.
  const claimed = { slug: "gato", traits: ["TRANSLATED", "VOCALIZED"], trait: { TRANSLATED: { known: "cat", learning: "gato" } } }
  const has = (entity, trait) => entity.traits.includes(trait)
  console.log("claims   →", JSON.stringify(claimed.traits))
  console.log("carries  →", JSON.stringify(Object.keys(claimed.trait)))
  console.log("VOCALIZED→", JSON.stringify({ claimed: has(claimed, "VOCALIZED"), payload: claimed.trait.VOCALIZED ?? null }))

  if ([...v.errors(narrowed, good)].length !== 0) throw new Error("a conforming payload must pass the narrowed schema")
  if ([...v.errors(narrowed, bad)].length === 0) throw new Error("narrowing must actually constrain the trait payload")
  if (buffer.data.face !== "ace") throw new Error("the buffer mask narrows `data` the same way")
  if (!has(claimed, "VOCALIZED") || claimed.trait.VOCALIZED)
    throw new Error("a trait may be CLAIMED without carrying a payload — check traits[], never trait?.X")
  console.log("tests    →", "4 assertions passed")
}
