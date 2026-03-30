import { Signal, steer } from "@vivalence/typology"

export function subscriber(vector) {
  function emit(event, args) {
    const name = args.meta?.className?.toLowerCase()?.replace("entity", "")
      ?? args.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")
    if (!name) return

    const signal = new Signal(`${name}/${event}`)
    const handlers = steer.shotgun(vector, signal)
    for (const handler of handlers) {
      handler(args)
    }
  }

  return {
    getSubscribedEntities() { return [] },
    afterCreate(args) { emit("create/after", args) },
    afterUpdate(args) { emit("update/after", args) },
    afterDelete(args) { emit("delete/after", args) },
    beforeCreate(args) { emit("create/before", args) },
    beforeUpdate(args) { emit("update/before", args) },
    beforeDelete(args) { emit("delete/before", args) },
  }
}
