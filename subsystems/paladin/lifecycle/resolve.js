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
  for (const daemon of instance.daemons) {
    for (const slot of ["lighthouse", "datamap", "hallucinators"]) inherit(daemon, instance, slot, v.clone);
  }
  for (const service of instance.services) inherit(service, instance, "datamap", v.clone);
}

export function mountpoints(instance) {
  const point = (kind, slug) => instance.paladin.scope.mountpoint.branch(`/${kind}_${slug}`).absolute;
  const reach = instance.runtime?.statics?.remote && new Url(instance.runtime.statics.remote);
  const seat = (kind) => (mounting) => {
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
    daemon.mount ??= `/daemon/${daemon.manifest?.slug}`;
    if (!reach) return;
    daemon.url ??= reach.branch(daemon.mount).absolute;
    daemon.attach ??= reach.branch("/attached").absolute;
  };
  // a service attaches under the runtime at a computed path: service/<type>/<slug> — nothing declares it
  const attach = (service) => {
    service.mount ??= `/attached/process/service/${service.manifest?.type}/${service.manifest?.slug}`;
  };
  // a lighthouse without a declared remote reaches the service hosting the same module, under this runtime
  const lit = (holder) => {
    const hosted = instance.services.find((service) => service.module === holder.lighthouse?.module);
    if (!holder.lighthouse || !reach || !hosted) return;
    holder.lighthouse.statics ??= {};
    holder.lighthouse.statics.remote ??= reach.branch(hosted.mount).absolute;
  };
  instance.daemons.forEach(seat("daemon"));
  instance.services.forEach(seat("service"));
  instance.services.forEach(attach);
  lit(instance);
  instance.daemons.forEach(lit);
  instance.daemons.forEach(address);
  instance.daemons.forEach(ground);
}

// a mode's ground falls through the way a daemon's does: the kernel entry's own word wins, else
// one directory under its daemon's mountpoint — mode_<type>_<slug>, beside bundles/ and the db.
// so every mode has a mountpoint without the recipe saying one, and a MOUNTED mode serves it; an
// override at any level above (env → instance → daemon) re-roots what is below it. a bare
// identifier becomes { module, mountpoint } — the same entry, its seat spelled out. an inline
// module keeps its shape (nothing is hydrated inside it) and carries the seat as a key.
// [type, slug] of a kernel entry, or null when the identifier cannot say; the entry's own manifest wins
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

function ground(daemon) {
  const seat = (entry) => {
    const id = identity(entry);
    if (!id) return entry;
    const [type, slug] = id;
    const held = is.string(entry) ? { module: entry } : entry;
    // a declared mountpoint is the entry's word even when its thunk came back blank (a REQUIRED fault,
    // never a seat minted over it); only silence gets the seat, mode_<type>_<slug> or mode_<slug>
    const mountpoint = "mountpoint" in held ? held.mountpoint : `${daemon.mountpoint}/mode_${[type, slug].filter(Boolean).join("_")}`;
    if (!type) return { ...held, mountpoint }; // the type is the module's word — wire seats the rest
    const mount = `/mode/${type}/${slug}`;
    return {
      ...held,
      mountpoint,
      mount: held.mount ?? mount,
      url: held.url ?? (daemon.url ? new Url(daemon.url).branch(mount).absolute : undefined),
      bundles: held.bundles ?? `${daemon.mountpoint}/bundles/${type}/${slug}`,
    };
  };
  daemon.kernel = (daemon.kernel ?? []).map(seat);
}
