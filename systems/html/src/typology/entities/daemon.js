import { object } from "@vivalence/shared";
import { Connection, Path } from "@vivalence/typology";
import { ProductionResult, ProductionRequest } from "@vivalence/typology";
import { Mode, Valence } from "@vivalence/html/typology";
import { Repository, entities } from "@vivalence/html/typology";

import { dataspace } from "$client";

export class Daemon {
  manifest = null;
  mount = null;
  connection = null;

  entities = {
    mode: new Repository(entities.mode), //
    valence: new Repository(entities.valence), //
    session: new Repository(entities.session), //
    product: new Repository(entities.product), //
  };

  constructor(connection) {
    this.connection = connection;
  }

  toJSON() {
    return {
      slug: this.slug ?? this.manifest?.slug ?? null,
      mount: this.mount?.nature ?? null,
      manifest: this.manifest,
      entities: {
        mode: this.entities.mode.toJSON(),
        valence: this.entities.valence.toJSON(),
        session: this.entities.session.toJSON(),
        product: this.entities.product.toJSON(),
      },
    };
  }
}

export const prototype = Daemon;

export async function lifecycle(daemon) {
  try {
    daemon.manifest = await daemon.connection.call("/manifest");
  } catch (error) {
    console.log("Error setting up daemon", { daemon });
    throw new Error("daemon doesnt manifest");
  }

  daemon.slug = daemon.manifest.slug;
  daemon.call = daemon.connection.call.bind(daemon.connection);
  daemon.mount = new Path(`/daemon/${daemon.slug}`);

  daemon.entities.mode.connect(daemon.connection.branch("/entities/mode"));
  daemon.entities.valence.connect(daemon.connection.branch("/entities/valence"));
  daemon.entities.session.connect(daemon.connection.branch("/userspace/entities/session"));
  daemon.entities.product.connect(daemon.connection.branch("/userspace/entities/product"));

  const modes = await daemon.entities.mode.find();
  for (const modePojo of modes) {
    const mode = new Mode(modePojo);
    mode.valences = new Set();

    mode.daemon = daemon;
    mode.mount = daemon.mount //
      .branch(`/mode/${mode.type}/${mode.slug}`);

    mode.connection = daemon.connection.branch(mode.mount.nature);
    mode.call = mode.connection.call.bind(mode.connection);

    mode.manifest = await mode.connection.call("/manifest");

    if (mode.implements("TERMINAL")) mode.view = await mode.connection.call("/view");
    if (mode.implements("BUFFERED")) mode.link = mode.mount.rebase("/viva");

    daemon.entities.mode.add(mode);
  }

  const valences = await daemon.entities.valence.find({ type: "SELFEVIDENT" });
  // console.log(JSON.stringify({ modes, valences }));
  for (const valencePojo of valences) {
    const valence = new Valence(valencePojo);
    valence.mode = await daemon.entities.mode //
      .findOne({ id: valencePojo.mode.id });

    valence.link = valence.mode.mount.branch(`/valence/${valence.slug}`).rebase("/viva");

    if (valence.implements("PRODUCTIVE")) {
      valence.queue = valence.data["PRODUCTIVE"].queue ?? 0;
      valence.produce = valence.mode.connection
        .clone()
        .use(async (ctx, next) => {
          // ctx.request.body = new ProductionRequest(ctx.request.body);
          await next();
          ctx.response.body = new ProductionResult(ctx.response.body);
        })
        .use(async (ctx, next) => {
          await next();

          ctx.response.body.products = await Promise.all(
            ctx.response.body.products.map(async (product) => {
              product.mode = await daemon.entities.mode.findOne({
                id: product.producer.id ?? product.producer,
              });
              return product;
            }),
          );

          // console.log("VALENCE RESPONSE", ctx.response.body);
        })
        .aim(`/valence/${valence.slug}`);
      // .aim(valence.data.GENERATIVE["mount"], valence.data.GENERATIVE["mask"]);
    }

    valence.mode.valences.add(valence);
    daemon.entities.valence.add(valence);
  }

  // const intents = await daemon.connection.call("/entities/intent/find"); for (const intentPojo of intents) {const intent = new Intent(intentPojo); intent.daemon = daemon; daemon.intents.add(intent); dataspace.intent.add(intent);}
}

// Mode pojo  {
//   "id": "019af50e-a950-74ea-91e6-e372d3abc2f5",
//   "slug": "eva",
//   "type": "agent",
//   "name": null,
//   "description": null,
//   "data": {},
//   "traits": [
//     "TERMINAL",
//     "DATASET",
//     "VALENTIC"
//   ],
//   "installed": false
// }

// Valence pojo {
//   "id": "019af513-a3a5-73a8-8eb6-7adf5c55a6d4",
//   "slug": "populate",
//   "type": null,
//   "name": null,
//   "description": null,
//   "data": {
//     "DESTINATION": {
//       "commissioner": "/feed"
//     }
//   },
//   "traits": [
//     "DESTINATION"
//   ],
//   "docs": "populate the runtime with entities",
//   "resolve": {},
//   "mode": {
//     "id": "019af50e-a950-74ea-91e6-e372d3abc2f5",
//     "slug": "eva",
//     "type": "agent",
//     "name": null,
//     "description": null,
//     "data": {},
//     "traits": [
//       "TERMINAL",
//       "DATASET",
//       "VALENTIC"
//     ],
//     "installed": false
//   }
// }
// console.log(gaia.connection.status.code.get());
// console.log(gaia.authority.get(), gaia.identity.get());

// for (const [type, entity] of Object.entries(entities)) {
//   if (entity.lifecycle) entity.lifecycle = entity.lifecycle(daemon);
//   daemon.entities[type] = new Repository(entity);
// }

// this.call = new Call(this.connection)  .use(backstop(this)) .use(authorize(this.$authority));
