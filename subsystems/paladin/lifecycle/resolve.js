import { v } from "@vivalence/typology";

export function defaults(instance) {
  const inherit = (mounting, slot) => {
    if (mounting[slot] === undefined && instance[slot] !== undefined) mounting[slot] = v.clone(instance[slot]);
  };
  for (const daemon of instance.daemons) {
    inherit(daemon, "lighthouse");
    inherit(daemon, "datamap");
    inherit(daemon, "hallucinators");
  }
  for (const service of instance.services) inherit(service, "datamap");
}

export function mountpoints(instance) {
  const point = (kind, slug) => instance.paladin.scope.mountpoint.branch(`/${kind}_${slug}`).absolute;
  const seat = (kind) => (mounting) => {
    const slug = mounting.manifest?.slug;
    mounting.mountpoint = point(kind, slug);
    if (!mounting.datamap) return;
    mounting.datamap.mountpoint = mounting.mountpoint;
    mounting.datamap.statics = {
      ...mounting.datamap.statics,
      db: { file: `${slug}.viva.db`, ...mounting.datamap.statics?.db },
    };
  };
  instance.daemons.forEach(seat("daemon"));
  instance.services.forEach(seat("service"));
}
