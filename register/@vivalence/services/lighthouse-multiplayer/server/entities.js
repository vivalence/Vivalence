import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { join } from "@std/path";

import {
  IdentitySchema,
  IdentityEntity,
  ShardSchema,
  ShardEntity,
  AuthenticatorEmbedSchema,
} from "@vivalence/entities";

export async function datamap(service) {
  const mikroconfig = {
    dbName: join(service.data, "lighthouse.db"),
    entities: [IdentitySchema, ShardSchema, AuthenticatorEmbedSchema],
    extensions: [Migrator],
    migrations: {
      tableName: "_mikro_migrations",
      path: join(service.data, "migrations"),
    },
  };

  const orm = await MikroORM.init(defineConfig(mikroconfig));

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
      shard: await em.getRepository(ShardEntity),
    };
    await next();
    await em.flush();
  };
}

export function expose(service, aperture) {
  aperture.open("/entities/:entity/:method", async (body, ctx) => {
    const entity = ctx.entities[ctx.params.entity];
    const method = ctx.entities.em[ctx.params.method];
    return await method(entity.entityName, body.where, body.options);
  });
}
