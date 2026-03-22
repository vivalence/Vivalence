import paladin from "@vivalence/paladin";
import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { v7 } from "uuid";
import { join } from "@std/path";
import { shard } from "@vivalence/typology";

import {
  IdentitySchema,
  IdentityEntity,
  DaemonSchema,
  DaemonEntity,
  AuthenticatorEmbedSchema,
} from "@vivalence/typology/entities";

export async function systemmap(servicemask) {
  const datamap = await paladin.vip.accio(servicemask.datamap.module);

  const variant = [IdentitySchema, DaemonSchema, AuthenticatorEmbedSchema] //
    .map((schema) => ({ schema }));

  const { orm, entities } = await datamap.provider(
    servicemask.datamap,
    variant,
  );

  return { orm, entities };
}

export function inject(orm) {
  return async (ctx, next) => {
    const em = orm.em.fork();
    ctx.entities = {
      em,
      identity: await em.getRepository(IdentityEntity),
      daemon: await em.getRepository(DaemonEntity),
    };
    await next();
    await em.flush();
  };
}

export function expose(service, aperture, orm) {
  const em = orm.em.fork();
  const identityRepo = em.getRepository(IdentityEntity);
  const daemonRepo = em.getRepository(DaemonEntity);

  aperture
    .branch("/entities/identity")
    .slurp(shard.datamap.repository(identityRepo));

  aperture
    .branch("/entities/daemon")
    .slurp(shard.datamap.repository(daemonRepo));
}

// export function expose(service, aperture) {
//   aperture.open("/entities/:entity/:method", async (body, ctx) => {
//     if (!["upsert", "expect"].includes(ctx.params.method)) {
//       const entity = ctx.entities[ctx.params.entity];
//       return await ctx.entities.em[ctx.params.method](
//         entity.entityName,
//         body.where,
//         body.options,
//       );
//     }
//
//     const where = {};
//     if (body.where.id) where.id = body.where.id;
//     else if (body.where.slug) where.slug = body.where.slug;
//     else throw new Error("invalid request body");
//
//     let entity = await ctx.entities[ctx.params.entity].findOne(where);
//
//     if (!entity) {
//       entity = await ctx.entities[ctx.params.entity].create(body.where);
//     } else {
//       ctx.entities[ctx.params.entity].assign(entity, body.where);
//     }
//
//     return entity;
//   });
// }

// const entity = ctx.entities[ctx.params.entity];
// const method = ctx.entities.em[ctx.params.method];
// const where = body.where || {};
// const options = body.options || {};
// return await method(entity.entityName, where, options);

// // mask."datamap": {
// //   "module": "@vivalence/datamap/libsql", // import via paladin.accio(mask.datamap)
// //   "statics": {
// //     "db": {
// //       "file": "lighthouse.viva.db"
// //     }
// //   }
// // }
// export async function systemmap(servicemask) {
//   console.log({ servicemask }, JSON.stringify({ servicemask }, null, 2));

//   // console.log({ paladin });
//   // console.log("sysmap", servicecake);
//   // console.log("path", servicecake.mount.branch("gaia.db").absolute);
//   // const datamap = paladin.vip.accio(servicecake.datamap)

//   // const mikroconfig = defineConfig({
//   //   dbName: join(service.data, "gaia.db"),
//   //   entities: [IdentitySchema, DaemonSchema, AuthenticatorEmbedSchema],
//   //   // strict: true,
//   //   extensions: [Migrator],
//   //   migrations: {
//   //     tableName: "_mikro_migrations",
//   //     path: join(service.data, "migrations"),
//   //   },
//   // });

//   // const { orm, entities } = await servicecake.datamap(mikroconfig);

//   // // const migrator = orm.getMigrator(); await migrator.createMigration(); await migrator.up();

//   return {};
//   // return { orm, entities };
// }
