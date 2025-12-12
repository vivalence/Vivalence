import { Connection, Path } from "@vivalence/typology";
import { Mode, Entity } from "@vivalence/html/typology";
import { Repository } from "@vivalence/html/typology";

class Valence extends Entity {}
class Intent extends Entity {}
class Session extends Entity {}

const entities = {
  mode: {
    prototype: Mode,
    lifecycle: (daemon) => async (mode) => {
      mode.mount = daemon.mount //
        .branch(`/mode/${mode.type}/${mode.slug}`);
      mode.connection = daemon.connection.branch(mode.mount.nature);
      // console.log("MODE lifecycle", mode);

      mode.manifest = await mode.connection.call("/manifest");
      // if (mode.implements("VIEWABLE")) mode.view = await mode.connection.call("/view");
    },
  },
  valence: {
    prototype: Valence,
    lifecycle: (daemon) => async (valence) => {
      valence.mode = await daemon.entities.mode.spawn(valence.mode);
    },
  },
  intent: { prototype: Intent },
  session: { prototype: Session },
  // symbols, literals
};

export async function lifecycle(daemon, client) {
  daemon.manifest = await daemon.connection.call("/manifest");
  daemon.mount = new Path(`/daemon/${daemon.manifest.slug}`);

  for (const [type, entity] of Object.entries(entities)) {
    if (entity.lifecycle) entity.lifecycle = entity.lifecycle(daemon);
    daemon.entities[type] = new Repository(entity);
  }

  const valences = await daemon.connection.call("/entities/valence/find");
  for (const valence of valences) {
    console.log("/call valences find", valence);
    await daemon.entities.valence.spawn(valence);
  }
}

// console.log(gaia.connection.status.code.get());
// console.log(gaia.authority.get(), gaia.identity.get());
