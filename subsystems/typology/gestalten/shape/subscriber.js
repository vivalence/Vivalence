import { Signal } from "../../prototypes/signal.js"
export function subscriber(twitch, { scope = (args, task) => task(), fork = (em) => em } = {}) {
  const dispatch = (signal, args) => () => twitch.dispatch(signal, { ...args, em: fork(args.em) })
  async function emit(phase, op, args) {
    const name = args.meta?.className?.toLowerCase()?.replace("entity", "")
      ?? args.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")
    if (!name) return

    const signal = new Signal(`${phase}/${name}/${op}`)
    if (phase === "before") return dispatch(signal, args)()
    await scope(args, dispatch(signal, args))
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
