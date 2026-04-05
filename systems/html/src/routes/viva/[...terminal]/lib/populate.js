import { goto } from "$app/navigation"
import { steer, Signal, fromm } from "@vivalence/typology"
import { lighthouse } from "$client"
import { terminal as terminalWafer } from "@vivalence/html/typology"

const cast = steer.invoke(terminalWafer, "/construct/populate/resolve/integrate",
  (carry, effect) => async (die) => {
    await carry(die, async () => { die.output = await effect(die) })
    return die.output
  },
)

export async function populate(terminal, segments) {
  const parts = segments.split("/")

  // /:lighthouse/:daemon/:type/:mode/[:intent]/:thread
  const daemonSlug = parts[1]
  const threadId = parts[parts.length - 1]
  const hasIntent = parts.length >= 6

  const daemon = lighthouse.daemons.get(daemonSlug)
  if (!daemon) throw new Error(`daemon not found: ${daemonSlug}`)

  const thread = await daemon.entities.thread.findOne({ id: threadId }, { populate: ["mode", "intent"] })
  if (!thread) throw new Error(`thread not found: ${threadId}`)

  const result = await cast({
    good: terminal,
    variant: { daemon, thread },
  })

  if (!hasIntent) {
    const buffer = terminal.stall.$active.get()
    if (buffer) buffer.on.release(() => goto("/viva"))
  }

  return result
}
