import { Vector, shard } from "@vivalence/typology";
import { authenticate } from "../gestalten/identity.js";

const twitch = (ctx) => ctx.service.twitch;

export const entities = new Vector().use(authenticate());

entities
  .branch("/daemon")
  .graft(shard.datamap.repository((ctx) => ctx.entities.daemon, { only: ["find", "findOne", "findOneOrFail", "count"] }));

entities
  .branch("/terminal")
  .use((ctx, next) => ctx.service.datamap.shard.bind("identity", () => ({ identity: ctx.identity.id }))(ctx, next))
  .use(shard.datamap.scope((ctx) => ({ identity: ctx.identity.id })))
  .graft(shard.datamap.repository((ctx) => ctx.entities.terminal))
  .graft(shard.datamap.reactive((ctx) => ctx.entities.terminal, twitch, { scope: (ctx) => ({ identity: ctx.identity.id }), filter: "identity" }));
