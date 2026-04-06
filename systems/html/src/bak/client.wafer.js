import { Vector, Connection, Url, steer } from "@vivalence/typology"
import { Lighthouse, hydrate, lighthouse as lighthouseWafer } from "@vivalence/html/typology"

const castLighthouse = steer.invoke(lighthouseWafer, "/verify/populate/full",
  (carry, effect) => async (die) => {
    await carry(die, async () => { die.output = await effect(die) })
    return die.output
  },
)

export const client = new Vector()

client
  .branch("/birth")
  .use(async (die, next) => {
    const url = new Url(die.variant.lighthouseUrl)
    const connection = new Connection(url)
    die.good.lighthouse = new Lighthouse(connection)
    await next()
  })

  .branch("/hydrate")
  .use(async (die, next) => {
    hydrate(die.good.lighthouse)
    await next()
  })

  .open("/idle", async (die) => die.good)

  .branch("/discover")
  .use(async (die, next) => {
    if (!die.good.lighthouse.$isAuthorized.get()) return
    await castLighthouse({ good: die.good.lighthouse })
    await next()
  })

  .open("/ready", async (die) => die.good)
