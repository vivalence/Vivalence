import { isAbsolute, resolve as resolvePath } from "@std/path";
import { load } from "@std/dotenv";
import { Pipe, Mask, v, fn } from "@vivalence/typology";
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
            read.push({ key, unset: value === null || value === undefined || value === "" });
            return value;
          }
        : Reflect.get(target, prop, receiver),
  });

// SUPERSEDED — a sentinel probe: a second walker fired deferred thunks against a fake bag to
// learn their keys. bought nothing over firing once and discarding.
// const DRY = "«deferred»";
// const watch = (bag, read, dry = false) => ... return dry ? DRY : value ...
//
// function probe(node, record, paladin, at) {
//   if (typeof node === "function") {
//     const read = [];
//     const { env, secret } = paladin;
//     paladin.env = watch(env, read, true);
//     paladin.secret = watch(secret, read, true);
//     try { node(); } catch { /* a thunk that cannot survive a sentinel still counted its keys */ }
//     finally { paladin.env = env; paladin.secret = secret; }
//     record.push({ at, read: ..., unset: ..., usable: null, deferred: true });
//     return;
//   }
//   if (Array.isArray(node)) return node.forEach((v, i) => probe(v, record, paladin, `${at}[${i}]`));
//   if (node?.constructor === Object)
//     for (const [key, value] of Object.entries(node)) probe(value, record, paladin, `${at}.${key}`);
// }

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

// move to lifecycle / dossier / die
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

  const mask = (kind) => (declaration) =>
    new Mask({
      ...declaration,
      mount: instance.paladin.scope.mountpoint.branch(
        `/${kind}_${declaration.slug ?? declaration.manifest?.slug}`,
      ),
    });

  const [module] = modules;

  const record = [];
  const at = (label) => (declaration) => hydrate(declaration, record, instance.paladin, label);

  const materialize = (label) => (declaration) => {
    const { kernel = [], ...rest } = declaration;
    const held = at(label)(rest);
    return {
      ...held,
      kernel: kernel.map(reference(module.source)),
      lighthouse: held.lighthouse ?? instance.lighthouse,
    };
  };

  const slug = (declaration) => declaration.slug ?? declaration.manifest?.slug;

  instance.manifest = module.manifest;
  instance.runtime = at("runtime")(module.runtime ?? {});
  instance.clients = at("clients")(module.clients ?? {});
  instance.lighthouse = at("lighthouse")(module.lighthouse ?? {});
  instance.daemons = (module.daemons ?? []).map((declaration) =>
    mask("daemon")(materialize(`daemon[${slug(declaration)}]`)(declaration)),
  );
  instance.services = (module.services ?? []).map((declaration) =>
    mask("service")(at(`service[${slug(declaration)}]`)(declaration)),
  );
  instance.requirements = record;
  instance.environment = module.environment ?? v.environment({});
  if (!instance.environment.properties)
    throw new Error(`instance.mount: environment must be v.environment({…}) — ${module.source.absolute}`);

  // instance.runtime.logs = new Pipe()
  // instance.clients.kajuit.logs = new Pipe()
}

// move to lifecycle / dossier / die
function validate(instance) {
  const errors = [];
  const collect = (label, value, schema) => {
    for (const error of schema.errors(value))
      errors.push(`${label}${error.instancePath || ""}: ${error.message}`);
  };
  if (Object.keys(instance.runtime).length) {
    v.primitives.instance.Runtime.cast(instance.runtime);
    collect("runtime", instance.runtime, v.primitives.instance.Runtime);
  }
  if (Object.keys(instance.lighthouse).length) {
    v.primitives.instance.Mask.cast(instance.lighthouse);
    collect("lighthouse", instance.lighthouse, v.primitives.instance.Mask);
  }
  for (const [slug, client] of Object.entries(instance.clients)) {
    v.primitives.instance.Client.cast(client);
    collect(`client[${slug}]`, client, v.primitives.instance.Client);
  }
  for (const daemon of instance.daemons) {
    v.primitives.instance.Daemon.cast(daemon);
    collect(`daemon[${daemon.slug}]`, daemon, v.primitives.instance.Daemon);
  }
  for (const service of instance.services) {
    v.primitives.instance.Service.cast(service);
    collect(`service[${service.slug}]`, service, v.primitives.instance.Service);
  }
  if (errors.length) throw new Error(`[instance.mount validate]\n  ${errors.join("\n  ")}`);
}

// SUPERSEDED — .env / environment.json / .jsonc at one stratum, so the last file read won:
// a committed placeholder overwrote a real secret beside it.
// const FILES = [".env", "environment.json", "environment.jsonc"];
// async function environment(instance) {
//   if (!instance.paladin.scope.instance) return;
//   for (const name of FILES) {
//     // scope.instance mints a fresh Path per access — branch() MUTATES, so never reuse one
//     const file = instance.paladin.scope.instance.branch(name);
//     if (!(await Deno.stat(file.absolute).catch(() => null))) continue;
//     const bag = name === ".env" ? await load({ envPath: file.absolute })
//                                 : await instance.paladin.read.json(file);
//     instance.paladin.assign(bag, "instance");
//   }
// }

async function environment(instance) {
  if (!instance.paladin.scope.instance) return;
  const file = instance.paladin.scope.instance.branch(".env").absolute;
  if (!(await Deno.stat(file).catch(() => null))) return;
  instance.paladin.claim(await load({ envPath: file }), "instance", file);
}

export class Instance {
  manifest = {};
  runtime = {};
  clients = {};
  lighthouse = {};
  daemons = [];
  services = [];

  constructor(paladin) {
    this.mount = fn.once(this.mount.bind(this));
    this.paladin = paladin;
    // this.logs = new Pipe();
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
    validate(this);
    this.paladin.publish();

    // await log(this);
    // return this.paladin.state.jsonl(this.path.branch("spans.jsonl"), span.json);
    // return this.paladin.state.file(this.path.branch(`${stream}.log`));
    // this.logs.tap((span) => Deno.writeTextFileSync(FILE, render(span) + "\n\n", { append: true })); // B

    return this;
  }
}
