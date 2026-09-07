import { isAbsolute, resolve as resolvePath } from "@std/path";
import { load } from "@std/dotenv";
import { Mask, Path, fn, is, object, v } from "@vivalence/typology";
import { NOTHING } from "./ledger/instances.js";

const reference = (home) => (entry) =>
  typeof entry !== "string"
    ? { ...entry, mount: entry.mount ?? home }
    : isAbsolute(entry)
      ? entry
      : /^\.\.?\//.test(entry)
        ? resolvePath(home.dirname, entry)
        : entry;

// records every key asked for; the thunk sees paladin unchanged.
const watch = (bag, read) =>
  new Proxy(bag, {
    get: (target, prop, receiver) =>
      prop === "get"
        ? (key, ...rest) => {
            const value = target.get(key, ...rest);
            read.push({ key, unset: is.empty(value) });
            return value;
          }
        : Reflect.get(target, prop, receiver),
  });

// the pinhole: every thunk in a declaration fires here and nowhere else.
export function hydrate(node, record = null, paladin = null, at = "") {
  if (typeof node === "function") {
    if (!record || !paladin) return hydrate(node());
    const read = [];
    const { env, secret } = paladin;
    paladin.env = watch(env, read);
    paladin.secret = watch(secret, read);
    let value;
    // thunks are synchronous by contract.
    try {
      value = node();
    } finally {
      paladin.env = env;
      paladin.secret = secret;
    }
    record.push({
      at,
      read: read.map((held) => held.key),
      unset: read.filter((held) => held.unset).map((held) => held.key),
    });
    return hydrate(value, record, paladin, at);
  }
  if (Array.isArray(node))
    return node.map((value, index) => hydrate(value, record, paladin, `${at}[${index}]`));
  if (node?.constructor === Object)
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [
        key,
        hydrate(value, record, paladin, at ? `${at}.${key}` : key),
      ]),
    );
  return node;
}

async function resolve(instance) {
  // mounting must not SCAFFOLD, so an absent home reaches here as a readdir ENOENT — name it.
  const home = instance.home.absolute;
  const modules = await instance.paladin.find
    .type(instance.home, "instance")
    .catch((error) => {
      if (error?.code === "ENOENT") throw new Error(`instance.mount: no instance at ${home}`);
      throw error;
    });
  if (modules.length !== 1)
    throw new Error(`instance.mount: expected 1 instance module in ${home}, found ${modules.length}`);

  const slug = (declaration) => declaration.slug ?? declaration.manifest?.slug;
  const point = (kind, declaration) => instance.paladin.scope.mountpoint.branch(`/${kind}_${slug(declaration)}`);
  const mask = (mountpoint) => (declaration) => new Mask({ ...declaration, mount: mountpoint });

  // a mask-shaped kernel entry's data dir is declared, absolute — nothing is resolved, nothing is minted.
  const dress = (label) => (entry) => {
    const declared = entry.mountpoint;
    if (declared instanceof Path || !is.string(declared) || !declared) return entry;
    if (!isAbsolute(declared)) throw new Error(`instance.mount: ${label}.mountpoint must be absolute — ${declared}`);
    return { ...entry, mountpoint: new Path(declared) };
  };

  const [module] = modules;

  const record = [];
  const at = (label) => (declaration) => hydrate(declaration, record, instance.paladin, label);

  const materialize = (label) => (declaration) => {
    const { kernel = [], ...rest } = declaration;
    return {
      ...at(label)(rest),
      kernel: kernel
        .map(reference(module.source))
        .map((entry, index) =>
          is.object(entry) && is.string(entry.module)
            ? dress(`${label}.kernel[${index}]`)(at(`${label}.kernel[${index}]`)(entry))
            : entry,
        ),
    };
  };

  instance.manifest = module.manifest;
  instance.runtime = at("runtime")(module.runtime);
  instance.clients = at("clients")(module.clients ?? {});
  instance.lighthouse = at("lighthouse")(module.lighthouse);
  instance.daemons = (module.daemons ?? []).map((declaration) =>
    mask(point("daemon", declaration))(materialize(`daemon[${slug(declaration)}]`)(declaration)),
  );
  instance.services = (module.services ?? []).map((declaration) =>
    mask(point("service", declaration))(at(`service[${slug(declaration)}]`)(declaration)),
  );
  instance.requirements = record;
  instance.environment = module.environment ?? v.environment({});
  if (!instance.environment.properties)
    throw new Error(`instance.mount: environment must be v.environment({…}) — ${module.source.absolute}`);
}

// a schematic fault arrives as a JSON pointer; the record speaks in slots — one grammar on the instance.
const label = (instance, pointer) =>
  pointer
    .split("/")
    .slice(1)
    .reduce((at, part) => {
      const slot = { daemons: "daemon", services: "service" }[at];
      if (slot) return `${slot}[${instance[at][part].slug}]`;
      return /^\d+$/.test(part) ? `${at}[${part}]` : at ? `${at}.${part}` : part;
    }, "") || "instance";

const alive = (mask) => Boolean(mask) && !Object.values(mask.secrets ?? {}).some(is.empty);

function settle(instance) {
  const { Instance } = v.primitives.instance;
  instance.dormant = [];
  for (const daemon of instance.daemons) {
    daemon.hallucinators = (daemon.hallucinators ?? []).filter(
      (mask, index) => alive(mask) || !instance.dormant.push(`daemon[${daemon.slug}].hallucinators[${index}]`),
    );
    daemon.consume = object.filter(
      daemon.consume ?? {},
      (slug) => alive(daemon.consume[slug]) || !instance.dormant.push(`daemon[${daemon.slug}].consume.${slug}`),
    );
  }
  Instance.cast(instance);
  instance.faults = Instance.faults(instance).map(({ at, reason }) => `${label(instance, at)} ${reason}`);
  if (!instance.faults.length) Instance.decode(instance);
  for (const daemon of instance.daemons) {
    daemon.lighthouse ??= instance.lighthouse;
    if (!daemon.lighthouse) instance.faults.push(`daemon[${daemon.slug}].lighthouse none declared, none to inherit`);
  }
}

async function environment(instance) {
  if (!instance.paladin.scope.instance) return;
  const file = instance.paladin.scope.instance.branch(".env").absolute;
  if (!(await Deno.stat(file).catch(() => null))) return;
  instance.paladin.claim(await load({ envPath: file }), "instance", file);
}

export class Instance {
  manifest = {};
  runtime;
  clients = {};
  lighthouse;
  daemons = [];
  services = [];
  requirements = [];
  faults = [];
  dormant = [];

  constructor(paladin) {
    this.mount = fn.once(this.mount.bind(this));
    this.paladin = paladin;
  }

  get home() {
    if (!("instance" in this.paladin.scope)) {
      throw new Error(NOTHING);
    }
    return this.paladin.scope.instance;
  }

  async mount() {
    await environment(this); // env/secret first — marker modules read them at import time
    await resolve(this);
    settle(this);
    this.paladin.publish();
    return this;
  }
}
