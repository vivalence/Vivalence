import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { v7 } from "uuid";
import { join } from "@std/path";

import {
  IdentitySchema,
  IdentityEntity,
  RuntimeSchema,
  RuntimeEntity,
  AuthenticatorEmbedSchema,
} from "@vivalence/entities";

export async function systemmap(service) {
  const mikroconfig = defineConfig({
    dbName: join(service.data, "lighthouse.db"),
    entities: [IdentitySchema, RuntimeSchema, AuthenticatorEmbedSchema],
    // strict: true,
    extensions: [Migrator],
    migrations: {
      tableName: "_mikro_migrations",
      path: join(service.data, "migrations"),
    },
  });

  const orm = await MikroORM.init(mikroconfig);

  const migrator = orm.getMigrator();
  await migrator.createMigration();
  await migrator.up();

  return orm;
}

export function inject(orm) {
  return async (ctx, next) => {
    const em = orm.em.fork();
    ctx.entities = {
      em,
      identity: await em.getRepository(IdentityEntity),
      runtime: await em.getRepository(RuntimeEntity),
    };
    await next();
    await em.flush();
  };
}

export function expose(service, aperture) {
  aperture.open("/entities/:entity/:method", async (body, ctx) => {
    const entity = ctx.entities[ctx.params.entity];
    if (ctx.params.method === "expect") {
      let entity = await ctx.entities[ctx.params.entity].findOne(body.where);

      if (!entity) {
        entity = await ctx.entities[ctx.params.entity].create(body.where);
      }

      return entity;
    }

    const effect = await ctx.entities.em[ctx.params.method](
      entity.entityName,
      body.where,
      body.options,
    );
    return effect;
  });
}

// const entity = ctx.entities[ctx.params.entity];
// const method = ctx.entities.em[ctx.params.method];
// const where = body.where || {};
// const options = body.options || {};
// return await method(entity.entityName, where, options);
