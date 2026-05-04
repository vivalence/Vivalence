import { Vector, v } from "@vivalence/typology"

export function familiar() {
  const state = { energy: 10, mana: 5, mood: 3, awareness: 0, alive: true }
  const vector = new Vector()

  vector
    .open(
      {
        nature: "meow",
        keyed: { command: "m" },
        valence: "vocalize",
        input: v.object({ pitch: v.number(), volume: v.number() }),
        output: v.object({ energy: v.integer() }),
      },
      (ctx) => {
        state.energy -= 1
        ctx.output = { energy: state.energy }
      },
    )
    .open(
      {
        nature: "rest",
        keyed: { command: "r" },
        valence: { slug: "rest", name: "Rest", prompt: "recover energy through stillness" },
        input: v.object({ hours: v.integer() }),
        output: v.object({ energy: v.integer(), mood: v.integer() }),
      },
      (ctx) => {
        state.energy += ctx.request.body.hours * 3
        state.mood += 1
        ctx.output = { energy: state.energy, mood: state.mood }
      },
    )
    .open(
      {
        nature: "sense",
        keyed: { command: "s" },
        valence: "perceive surroundings",
        directed: { variant: "icon", icon: "eye" },
        input: v.object({}),
        output: v.object({ awareness: v.integer() }),
      },
      (ctx) => {
        state.awareness += 1
        ctx.output = { awareness: state.awareness }
      },
    )

  const hunt = vector.branch({
    nature: "hunt",
    keyed: { command: "h", modifier: "ctrl" },
    valence: { slug: "hunt", name: "Hunt Mode", prompt: "enter the hunting submenu" },
    directed: { variant: "icon", icon: "crosshair", collapsed: true },
  })

  hunt
    .open(
      {
        nature: "stalk",
        keyed: { command: "s" },
        valence: "approach silently",
        input: v.object({ patience: v.integer() }),
        output: v.object({ energy: v.integer(), distance: v.number() }),
      },
      (ctx) => {
        state.energy -= 2
        ctx.output = { energy: state.energy, distance: 10 / ctx.request.body.patience }
      },
    )
    .open(
      {
        nature: "pounce",
        keyed: { command: "p", modifier: "shift" },
        valence: { slug: "pounce", name: "Pounce", prompt: "leap at prey with force" },
        input: v.object({ force: v.number() }),
        output: v.object({ energy: v.integer(), alive: v.boolean() }),
      },
      (ctx) => {
        state.energy -= 4
        state.alive = ctx.request.body.force > 5
        ctx.output = { energy: state.energy, alive: state.alive }
      },
    )
    .open(
      {
        nature: "retreat",
        keyed: { command: "r" },
        valence: "abandon hunt",
        input: v.object({}),
      },
      (ctx) => {
        state.energy -= 1
        ctx.output = { energy: state.energy }
      },
    )

  const magic = vector.branch({
    nature: "magic",
    keyed: { command: "m", modifier: "ctrl" },
    valence: { slug: "magic", name: "Magic", prompt: "arcane abilities" },
    directed: { variant: "icon", icon: "sparkle" },
  })

  magic
    .open(
      {
        nature: "cast",
        keyed: { command: "c" },
        valence: "cast a spell",
        input: v.object({ element: v.string(), power: v.number() }),
        output: v.object({ energy: v.integer(), mana: v.integer() }),
      },
      (ctx) => {
        state.energy -= 2
        state.mana -= ctx.request.body.power
        ctx.output = { energy: state.energy, mana: state.mana }
      },
    )
    .open(
      {
        nature: "ward",
        keyed: { command: "w" },
        valence: { slug: "ward", name: "Ward", prompt: "raise a protective barrier" },
        directed: { variant: "icon", icon: "shield" },
        input: v.object({ strength: v.integer() }),
        output: v.object({ mana: v.integer() }),
      },
      (ctx) => {
        state.mana -= ctx.request.body.strength
        ctx.output = { mana: state.mana }
      },
    )
    .open(
      {
        nature: "channel",
        keyed: { command: "c", modifier: "shift" },
        valence: "gather ambient energy",
        input: v.object({ duration: v.integer() }),
        output: v.object({ energy: v.integer(), mana: v.integer() }),
      },
      (ctx) => {
        state.energy += ctx.request.body.duration
        state.mana += ctx.request.body.duration * 2
        ctx.output = { energy: state.energy, mana: state.mana }
      },
    )

  const dream = vector.branch({
    nature: "dream",
    keyed: { command: "d", modifier: "ctrl" },
    valence: { slug: "dream", name: "Dreamscape", prompt: "enter the dream realm" },
    directed: { variant: "icon", icon: "moon", label: "Dreamscape" },
  })

  dream
    .open(
      {
        nature: "wander",
        keyed: { command: "w" },
        valence: "drift through dreams",
        input: v.object({ depth: v.integer() }),
        output: v.object({ mood: v.integer(), awareness: v.integer() }),
      },
      (ctx) => {
        state.mood += ctx.request.body.depth
        state.awareness += 1
        ctx.output = { mood: state.mood, awareness: state.awareness }
      },
    )
    .open(
      {
        nature: "manifest",
        keyed: { command: "m" },
        valence: { slug: "manifest", name: "Manifest", prompt: "will something into being" },
        input: v.object({ intent: v.string(), clarity: v.number() }),
        output: v.object({ energy: v.integer(), mood: v.integer(), mana: v.integer() }),
      },
      (ctx) => {
        state.energy += Math.floor(ctx.request.body.clarity)
        state.mood += 2
        state.mana += 1
        ctx.output = { energy: state.energy, mood: state.mood, mana: state.mana }
      },
    )

  return { vector, state }
}
