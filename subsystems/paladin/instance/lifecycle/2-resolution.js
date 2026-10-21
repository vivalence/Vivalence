import { basename, dirname } from "@std/path";
import { cast, is, Url, v } from "@vivalence/typology";

// the one fall-through verb, both tiers: below takes above's slot when it has none of its own.
// a declared slot — even [] or null — is below's word. returns whether it fell through.
export function inherit(below, above, slot, clone = (value) => value) {
  if (below[slot] !== undefined || above?.[slot] === undefined) return false;
  below[slot] = clone(above[slot]);
  return true;
}

export function defaults(instance) {
  if (instance.runtime) instance.runtime.manifest ??= v.primitives.instance.Runtime.properties.manifest.fill();
  for (const daemon of instance.daemons) {
    for (const slot of ["datamap"]) inherit(daemon, instance, slot, v.clone);
  }
  for (const service of instance.services) inherit(service, instance, "datamap", v.clone);
}

export function mountpoints(instance) {
  const point = (kind, slug) => instance.paladin.scope.mountpoint.branch(`/${kind}_${slug}`).absolute;
  const reach = instance.runtime?.statics?.remote && new Url(instance.runtime.statics.remote);
  const mountpoint = (kind) => (mounting) => {
    const slug = mounting.manifest?.slug;
    mounting.mountpoint = mounting.mountpoint ?? point(kind, slug);
    if (!mounting.datamap) return;
    mounting.datamap.mountpoint = mounting.datamap.mountpoint ?? mounting.mountpoint;
    mounting.datamap.statics = {
      ...mounting.datamap.statics,
      db: { file: `${slug}.viva.db`, ...mounting.datamap.statics?.db },
    };
  };
  // the daemon's word wins, else its slug under the runtime's reach; no reach → no url, settle names it
  const address = (daemon) => {
    daemon.reference ??= `/daemon/${daemon.manifest?.slug}`;
    if (!reach) return;
    daemon.url ??= reach.branch(daemon.reference).absolute;
    daemon.attach ??= reach.branch("/attached").absolute;
  };
  // a service attaches under the runtime at a computed path: service/<type>/<slug> — nothing declares it
  const attach = (service) => {
    service.reference ??= `/attached/process/service/${service.manifest?.type}/${service.manifest?.slug}`;
  };
  instance.daemons.forEach(mountpoint("daemon"));
  instance.services.forEach(mountpoint("service"));
  instance.services.forEach(attach);
  const root = (runtime) => {
    runtime.mountpoint ??= instance.paladin.scope.mountpoint.absolute;
    runtime.reference ??= `/runtime/${runtime.manifest?.slug}`;
    if (!reach) return;
    runtime.url ??= reach.branch(runtime.reference).absolute;
    runtime.attach ??= reach.branch("/attached").absolute;
  };
  const referenced = (client) => {
    client.reference ??= `/client/${client.manifest?.slug}`;
    client.modes = (client.modes ?? []).map(place(client));
  };
  instance.daemons.forEach(address);
  instance.daemons.forEach(ground);
  instance.clients.forEach(referenced);
  if (instance.runtime) {
    root(instance.runtime);
    ground(instance.runtime);
  }
}

// a mode's ground falls through the way a daemon's does: the modes entry's own word wins, else
// one directory under its daemon's mountpoint — mode_<type>_<slug>, beside bundles/ and the db.
// so every mode has a mountpoint without the recipe saying one, and a FILESINK mode writes into it; an
// override at any level above (env → instance → daemon) re-roots what is below it. a bare
// identifier becomes { module, mountpoint } — the same entry, its mountpoint spelled out. an inline
// module keeps its shape (nothing is hydrated inside it) and carries the mountpoint as a key.
// [type, slug] of a modes entry, or null when the identifier cannot say; the entry's own manifest wins
const identity = (entry) => {
  const own = entry?.manifest;
  if (own?.type && own.slug) return [own.type, own.slug];
  const module = is.string(entry) ? entry : entry?.module;
  if (is.string(module) && module.startsWith("@")) {
    const { type, slug } = cast.lookup(module);
    return type && slug ? [type, slug] : null;
  }
  if (is.string(module)) {
    // a path: modes/<type>/<slug>/<slug>.viva.js names both; any other file names the slug alone, no type
    const dir = dirname(module);
    const slug = basename(module).replace(/\.viva\.[jt]s$/, "");
    return basename(dirname(dirname(dir))) === "modes" ? [basename(dirname(dir)), slug] : [null, slug];
  }
  return null;
};

const place = (declaration) => (entry) => {
  const id = identity(entry);
  if (!id) return entry;
  const [type, slug] = id;
  const held = is.string(entry) ? { module: entry } : entry;
  if (!type) return held;
  const reference = `/mode/${type}/${slug}`;
  return { ...held, reference: held.reference ?? reference, url: held.url ?? (declaration.url ? new Url(declaration.url).branch(reference).absolute : undefined) };
};
const mount = (declaration) => (entry) => {
  const id = identity(entry);
  if (!id) return entry;
  const [type, slug] = id;
  const mountpoint = "mountpoint" in entry ? entry.mountpoint : `${declaration.mountpoint}/mode_${[type, slug].filter(Boolean).join("_")}`;
  return { ...entry, mountpoint };
};
function ground(declaration) {
  declaration.modes = (declaration.modes ?? []).map(place(declaration)).map(mount(declaration));
}
