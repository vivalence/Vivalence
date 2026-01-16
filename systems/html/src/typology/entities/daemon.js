import { Connection, Path } from "@vivalence/typology";
import { Mode, Valence } from "@vivalence/html/typology";
import { dataspace } from "$client";

// export { Daemon, Daemon as prototype } from "./prototype.js";
export class Daemon {
  manifest = null;
  mount = null;
  valences = new Set();
  modes = new Set();
  // lighthouse = null;

  // manifest, path
  // schema
  constructor(connection) {
    this.connection = connection;

    // this.call = new Call(this.connection) //
    // .use(backstop(this))
    // .use(authorize(this.$authority));
  }
}

export const prototype = Daemon;

export async function lifecycle(daemon) {
  daemon.manifest = await daemon.connection.call("/manifest");
  daemon.mount = new Path(`/daemon/${daemon.manifest.slug}`);

  const modes = await daemon.connection.call("/entities/mode/find");
  for (const modePojo of modes) {
    // console.log("Mode pojo ", JSON.stringify(modePojo, null, 2));
    const mode = new Mode(modePojo);
    mode.daemon = daemon;
    mode.mount = daemon.mount //
      .branch(`/mode/${mode.type}/${mode.slug}`);

    mode.connection = daemon.connection
      .branch(mode.mount.nature)
      .use(async (context, next) => {
        console.log("mode connection call", context);
        await next();
      });

    mode.manifest = await mode.connection.call("/manifest");

    if (mode.implements("VIEWABLE"))
      mode.view = await mode.connection.call("/view");
    // any other treatment of view?

    daemon.modes.add(mode);
    dataspace.mode.add(mode);
    // console.log("/lifecycled mode", mode);
  }

  const valences = await daemon.connection.call("/entities/valence/find");
  for (const valencePojo of valences) {
    // console.log("discoveredValence", JSON.stringify(valencePojo, null, 2));
    const valence = new Valence(valencePojo);
    valence.daemon = daemon;
    valence.mode = await dataspace.mode //
      .findOne((mode) => valencePojo.mode.id === mode.id);

    if (valence.implements("destination")) {
      valence.destination = new Path("/viva")
        .branch(valence.mode.mount.absolute)
        .branch(valence.data["DESTINATION"]);
    }

    valence.mode.valences.add(valence);
    daemon.valences.add(valence);
    dataspace.valence.add(valence);

    // console.log("/lifecycled valence", valence);
    //   // valence.mode = await daemon.entities.mode.spawn(valence.mode); // i need mikro. // ...  fucking l how do i coordinate these shits.
  }

  // crossreference
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
//       "generator": "/feed"
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
