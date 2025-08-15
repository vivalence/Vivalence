import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { join } from "@std/path";

import { Vector, parser, controller, compiler } from "@vivalence/vector";

export async function boot(daemon: Daemon, runtime: any) {
  runtime.domain.data = await runtime.register.domain.data(daemon, runtime);

  const mikroconfig = {
    dbName: join(
      runtime.config.services.database.data,
      runtime.config.services.database.config.db.path,
    ),

    entities: runtime.domain.data.schema,
    strict: true,
    extensions: [Migrator],
    migrations: {
      tableName: "_mikro_migrations",
      path: join(runtime.config.services.database.data, "migrations"),
    },
  };

  const orm = await MikroORM.init(defineConfig(mikroconfig));

  const migrator = orm.getMigrator();
  await migrator.createMigration();
  await migrator.up();

  runtime.entities = {
    orm,
    em: orm.em.fork(),
    on: new Vector(parser.sig),
  };

  await Promise.all(
    Object.entries(runtime.domain.data.entities).map(async ([key, entity]) => {
      runtime.entities[key] = await runtime.entities.em.getRepository(entity);
    }),
  );

  return runtime;
}

export async function serve(daemon, runtime) {
  const vector = runtime.entities.on;
  const subscriptions = runtime.entities.on.patterns
    .map((p) => p.signature)
    .map((s) => runtime.domain.data.entities[s]);

  const twitch = async (signal, event) => {
    try {
      const [effect, apply] = controller.traverse(vector, signal);
      const context = { event, runtime };
      context.runtime.entities.em = runtime.entities.em.fork();
      await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
      await context.runtime.entities.em.flush();
    } catch (err) {
      if (err.code === "NOT_FOUND") return undefined;
      console.log("[TWITCH ERROR]", err);
      throw err;
    }
  };

  const subscriber = new compiler.Subscriber(subscriptions, twitch);

  runtime.entities.em
    .getEventManager() //
    .registerSubscriber(subscriber);

  return runtime;
}

export default { boot, serve };
