import { object } from "@vivalence/shared";
import { Connection, Path } from "@vivalence/typology";
import { Mode, Valence, Intent } from "@vivalence/html/typology";
import { dataspace } from "$client";

export class Daemon {
  manifest = null;
  mount = null;
  valences = new Set();
  modes = new Set();
  intents = new Set();

  constructor(connection) {
    this.connection = connection;
  }
}

export const prototype = Daemon;

export async function lifecycle(daemon) {
  daemon.manifest = await daemon.connection.call("/manifest");
  daemon.call = daemon.connection.call.bind(daemon.connection);
  daemon.mount = new Path(`/daemon/${daemon.manifest.slug}`);

  const modes = await daemon.connection.call("/entities/mode/find");
  for (const modePojo of modes) {
    const mode = new Mode(modePojo);
    mode.daemon = daemon;
    mode.mount = daemon.mount //
      .branch(`/mode/${mode.type}/${mode.slug}`);

    mode.connection = daemon.connection.branch(mode.mount.nature);
    mode.call = mode.connection.call.bind(mode.connection);

    mode.manifest = await mode.connection.call("/manifest");

    if (mode.implements("VIEWABLE"))
      mode.view = await mode.connection.call("/view");

    daemon.modes.add(mode);
    dataspace.mode.add(mode);
  }

  const valences = await daemon.connection.call("/entities/valence/find");
  for (const valencePojo of valences) {
    const valence = new Valence(valencePojo);
    valence.mode = await dataspace.mode //
      .findOne((mode) => valencePojo.mode.id === mode.id);

    if (valence.type === "destination") {
      valence.link = valence.mode.mount
        .branch(`/valence/${valence.slug}`)
        .rebase("/viva");
    }

    if (valence.data["producer"]) {
      valence.produce = valence.mode.connection
        .clone() //
        .use(async (ctx, next) => {
          await next();
        })
        .use(async (ctx, next) => {
          ctx.request.body.scope = object //
            .merge(ctx.request.body.scope, {
              valence: valence.id,
              commissioner: valence.mode.id,
            });

          // console.log("ctx.request", ctx.request);

          await next();

          // console.log("ctx.response", ctx.response);

          ctx.response.body = await Promise.all(
            ctx.response.body.products.map(async (product) => {
              product.mode = await dataspace.mode.findOne(
                (mode) =>
                  mode.id ===
                  // stupid
                  (product.producer.id
                    ? product.producer.id
                    : product.producer),
              );
              return product;
            }),
          );

          // parse ProductionResponse
        })
        .aim(valence.data["producer"], valence.data["mask"]);
    }

    valence.mode.valences.add(valence);
    daemon.valences.add(valence);
    dataspace.valence.add(valence);
  }

  const intents = await daemon.connection.call("/entities/intent/find");
  for (const intentPojo of intents) {
    const intent = new Intent(intentPojo);
    intent.daemon = daemon;
    daemon.intents.add(intent);
    dataspace.intent.add(intent);
  }
}

// Mode pojo  {
//   "id": "019af50e-a950-74ea-91e6-e372d3abc2f5",
//   "slug": "eva",
//   "type": "agent",
//   "name": null,
//   "description": null,
//   "data": {},
//   "traits": [
//     "VIEWABLE",
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
//       "VIEWABLE",
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
