import { Signal, steer } from "@vivalence/typology"

export function subscriber(vector) {
  async function emit(event, args) {
    const name = args.meta?.className?.toLowerCase()?.replace("entity", "")
      ?? args.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")
    if (!name) return

    const signal = new Signal(`${name}/${event}`)
    const handlers = steer.shotgun(vector, signal)
    for (const handler of handlers) {
      await handler(args)
    }
  }

  return {
    getSubscribedEntities() { return [] },
    async afterCreate(args) { await emit("create/after", args) },
    async afterUpdate(args) { await emit("update/after", args) },
    async afterDelete(args) { await emit("delete/after", args) },
    async beforeCreate(args) { await emit("create/before", args) },
    async beforeUpdate(args) { await emit("update/before", args) },
    async beforeDelete(args) { await emit("delete/before", args) },
  }
}
