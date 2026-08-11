import { Signal, steer } from "@vivalence/typology"

export function subscriber(vector) {
  async function emit(phase, op, args) {
    const name = args.meta?.className?.toLowerCase()?.replace("entity", "")
      ?? args.entity?.constructor?.name?.toLowerCase()?.replace("entity", "")
    if (!name) return

    const signal = new Signal(`${phase}/${name}/${op}`)
    for (const handler of steer.dispatch.shotgun(vector, signal)) await handler(args)
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
