import { Signal } from "../../prototypes/signal.js"
export function subscriber(twitch, { scope = { before: (em, task) => task(), after: (em, task) => task() } } = {}) {
  async function emit(phase, op, { em, ...input }) {
    const name = input.meta?.className?.toLowerCase()?.replace("entity", "")
      ?? input.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")
    if (!name) return

    const signal = new Signal(`${phase}/${name}/${op}`)
    await scope[phase](em, () => twitch.dispatch(signal, input))
  }

  return {
    getSubscribedEntities() { return [] },
    async afterCreate(args) { await emit("after", "create", args) },
    async afterUpdate(args) { await emit("after", "update", args) },
    async afterDelete(args) { await emit("after", "delete", args) },
    async beforeCreate(args) { await emit("before", "create", args) },
    async beforeUpdate(args) { await emit("before", "update", args) },
    async beforeDelete(args) { await emit("before", "delete", args) },
  }
}
