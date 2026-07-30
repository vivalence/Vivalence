import { shard } from "@vivalence/typology";

export async function datamap(die) {
  const { entities } = die.good;

  // die.good.aperture.open("/datamap", () =>
  //   shard.datamap.strip(entities.em.getMetadata()),
  // );
  die.good.aperture.open("/datamap", () =>
    shard.datamap.strip(die.datamap.introspect()),
  );

  die.good.aperture
    .branch("/entities/literal")
    .slurp(shard.datamap.repository(entities.literal))
    // .slurp(shard.datamap.reactive(entities.literal, entities.twitch));
    .slurp(shard.datamap.reactive(entities.literal, die.good.twitch));

  die.good.aperture
    .branch("/entities/symbol")
    .slurp(shard.datamap.repository(entities.symbol))
    // .slurp(shard.datamap.reactive(entities.symbol, entities.twitch));
    .slurp(shard.datamap.reactive(entities.symbol, die.good.twitch));

  die.good.aperture
    .branch("/entities/mode")
    .slurp(shard.datamap.repository(entities.mode))
    .slurp(shard.datamap.reactive(entities.mode, die.good.twitch));

  die.good.aperture
    .branch("/entities/intent")
    .slurp(shard.datamap.repository(entities.intent));
}

// export async function datamap(die) {
//   die.good.aperture.open("/entities/:entity/:method", async (body, ctx) => {
//     const entity = ctx.daemon.entities[ctx.params.entity];
//     return await ctx.daemon.entities.em[ctx.params.method](
//       entity.entityName,
//       body.where || {},
//       body.options || {},
//     );
//   });
// }
