import { Vector } from "@vivalence/typology"
import { Paladin } from "./prototypes/paladin.js"
import * as populate from "./lifecycle/populate.js"
import * as resolve from "./lifecycle/resolve.js"
import * as integrate from "./lifecycle/integrate.js"

export function paladin() {
  const wafer = new Vector()

  wafer.use(async (die, next) => {
    die.paladin = die.input ?? new Paladin()
    await next()
  })

  wafer.branch("/construct")
    .use(async (die, next) => {
      await populate.env(die.paladin)
      await populate.scopes(die.paladin)
      await next()
    })
    .branch("/populate")
    .use(async (die, next) => {
      await populate.environment(die.paladin)
      await populate.veryimportantpackage(die.paladin)
      await populate.questions(die.paladin)
      await next()
    })
    .open("/base", async (die) => die.paladin)
    .branch("/resolve")
    .use(async (die, next) => {
      await resolve.circuitry(die.paladin)
      await resolve.variant(die.paladin)
      await next()
    })
    .branch("/integrate")
    .use(async (die, next) => {
      await integrate.statements(die.paladin)
      await integrate.publish(die.paladin)
      await integrate.questions(die.paladin)
      await next()
    })
    .open("/full", async (die) => die.paladin)

  return wafer
}
