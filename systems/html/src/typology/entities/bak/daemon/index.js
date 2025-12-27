// export { Daemon, Daemon as prototype } from "./prototype.js";
import { Connection, Path } from "@vivalence/typology";

// export * from "./lifecycle.js";
import { Connection, Path } from "@vivalence/typology";
import { Repository, Mode, Entity } from "@vivalence/html/typology";

export class Daemon {
  entities = {};
  // manifest, path
  // schema
  constructor(connection) {
    this.connection = connection;

    // this.call = new Call(this.connection) //
    //   .use(async (ctx, next) => {
    //     await next();
    //     // console.log(ctx);
    //   });
    // .use(backstop(this))
    // .use(authorize(this.$authority));
  }
}

export async function lifecycle(daemon, client) {
  daemon.manifest = await daemon.connection.call("/manifest");
  daemon.mount = new Path(`/daemon/${daemon.manifest.slug}`);

  const valences = await daemon.connection.call("/entities/valence/find");
  for (const valence of valences) {
    console.log("/call valences find", valence);
    await daemon.entities.valence.spawn(valence);
  }
}

// console.log(gaia.connection.status.code.get());
// console.log(gaia.authority.get(), gaia.identity.get());

// for (const [type, entity] of Object.entries(entities)) {
//   if (entity.lifecycle) entity.lifecycle = entity.lifecycle(daemon);
//   daemon.entities[type] = new Repository(entity);
// }
