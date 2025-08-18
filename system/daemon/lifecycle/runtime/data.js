import { mw, Vector, parser } from "@vivalence/vector";
import { bundler, secure, is } from "@vivalence/shared";
import { maps } from "@vivalence/entities";

export async function data(rme, daemon) {
  const runtime = rme.instance;
  const datamap = {
    ...maps.userland,
    ...rme.register.domain.data.map,
  };

  const database = [...daemon.services] //
    .find(({ slug, runtime }) => slug === "database" && runtime === rme.slug);
  if (!database.implements("DATAMAP")) throw new Error();

  runtime.domain.datamap = await database.prototype //
    .client(database, datamap);

  runtime.entities = {
    orm: runtime.domain.datamap,
    em: runtime.domain.datamap.em.fork(),
    on: new Vector(parser.sig),
  };

  await Promise.all(
    Object.entries(datamap).map(async ([slug, dme]) => {
      if (dme.entity)
        runtime.entities[slug] = await runtime.entities.em //
          .getRepository(dme.entity);
    }),
  );

  runtime.aperture
    .branch("/entities")
    .open("/:entity/:repo", async (body, ctx) => {
      const entity = ctx.runtime.entities[ctx.params.entity];
      return await ctx.runtime.entities.em[ctx.params.repo](
        //
        entity.entityName,
        body.where,
        body.options,
      );
    });
}
