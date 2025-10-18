import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import * as libsql from "@libsql/client/node";

import { join } from "@std/path";

const manifest = {
  type: "datamap",
  slug: "libsql",
  name: "libsql",
  // traits: ["DATAMAP","LOCAL"],
};

// todo: ensure database.db
async function client(service, datamap) {
  const mikroconfig = {
    dbName: join(service.data, service.config.db.path),
    entities: Object.values(datamap)
      .map((dme) => dme.schema)
      .filter(Boolean),
    strict: true,
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

  // todo compute repositories

  return orm; // {orm, entities}
}

export { manifest, client };

// function client(service) {
//   let path = join(service.data, service.config.db.path);
//   service.config.path = path;

//   if (!path.startsWith("file:")) {
//     path = `file:` + path;
//   }

//   const db = libsql.createClient({ url: path });
//   return db;
// }

//   runtime.entities = {
//     orm,
//     em: orm.em.fork(),
//     on: new Vector(parser.sig),
//   };

//   await Promise.all(
//     Object.entries(runtime.domain.data.entities).map(async ([key, entity]) => {
//       runtime.entities[key] = await runtime.entities.em.getRepository(entity);
//     }),
//   );
// import { Vector, parser, controller, compiler } from "@vivalence/vector";

// function control(vector) {vector.open("/create", async (ctx) => {const service = ctx.service; const db = createClient({ ...service.config, ...service.secret }); await db.execute("PRAGMA journal_mode = WAL;"); await db.execute("PRAGMA busy_timeout = 5000;"); await db.execute("PRAGMA synchronous = NORMAL;"); await db.execute("PRAGMA cache_size = 2000;"); await db.execute("PRAGMA temp_store = MEMORY;"); await db.execute("PRAGMA foreign_keys = true;"); await db.close();});}

// export async function twitch(daemon, runtime) {
//   const vector = runtime.entities.on;
//   const subscriptions = runtime.entities.on.patterns
//     .map((p) => p.signature)
//     .map((s) => runtime.domain.data.entities[s]);

//   const twitch = async (signal, event) => {
//     try {
//       const [effect, apply] = controller.traverse(vector, signal);
//       const context = { event, runtime };
//       context.runtime.entities.em = runtime.entities.em.fork();
//       await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
//       await context.runtime.entities.em.flush();
//     } catch (err) {
//       if (err.code === "NOT_FOUND") return undefined;
//       console.log("[TWITCH ERROR]", err);
//       throw err;
//     }
//   };

//   const subscriber = new compiler.Subscriber(subscriptions, twitch);

//   runtime.entities.em
//     .getEventManager() //
//     .registerSubscriber(subscriber);

//   return runtime;
// }

// export default { boot, serve };
