import { Vector, shape, shard } from "@vivalence/typology";

export const metadata = new Vector()
  .open("/manifest", (input, ctx) => ctx.service.manifest)
  .open("/statics", (input, ctx) => ctx.mask.statics ?? {})
  .open("/datamap", (input, ctx) => shard.datamap.strip(ctx.service.datamap.getMetadata()))
  .open("/attachment", (input, ctx) => shape.strip(ctx.service.attachment));
