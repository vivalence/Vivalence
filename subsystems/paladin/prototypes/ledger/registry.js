import { basename, dirname, isAbsolute, relative } from "@std/path";
import { cast, is, Path, Span, v } from "@vivalence/typology";
import { Pensieve } from "../pensieve.js";
import { probe, RULES } from "./integrity.js";
import { derive } from "./ledger.js";

const traits = (manifest) => manifest?.traits ?? [];

const normalize = (reference) =>
  isAbsolute(reference) ? reference : reference.replace(/^\.\//, "");

export class Registry {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
    this.pensieve = new Pensieve();
    this.stale = [];
    // the span is the only log; its pipe fills the index the doctor and assert() read — what is wrong under a
    // path, said once however often it is probed (the journal is capped, the map is not)
    this.span = new Span({ nature: "/registry" });
    this.integrity = new Map();
    this.span.to((record) => record.verb === "fault" && (this.integrity.get(record.path) ?? this.integrity.set(record.path, new Set()).get(record.path)).add(record.data.message));
  }

  read() {
    return this.paladin.read.json(this.path, null);
  }

  write(locations) {
    return this.paladin.state.json(this.path, locations);
  }

  async references() {
    return (await this.read()) ?? [];
  }

  async has(reference) {
    return (await this.references()).includes(normalize(reference));
  }

  async add(reference) {
    reference = normalize(reference);
    const references = await this.references();
    if (references.includes(reference)) return references;
    const next = [...references, reference];
    await this.write(next);
    return next;
  }

  async remove(reference) {
    reference = normalize(reference);
    const next = (await this.references()).filter((held) => held !== reference);
    await this.write(next);
    return next;
  }

  reference(absolute) {
    const store = this.paladin.scope.registry?.absolute;
    if (!store) return absolute;
    const segment = relative(store, absolute);
    return segment && !segment.startsWith("..") && !isAbsolute(segment) ? segment : absolute;
  }

  resolve(reference) {
    reference = normalize(reference);
    if (isAbsolute(reference)) return new Path(reference);
    if (!this.paladin.scope.registry)
      throw new Error(`[PALADIN] registry resolve ${reference}: no package store — a relative reference resolves against scope.registry (set VIVA_REGISTRY_MOUNT)`);
    return this.paladin.scope.registry.branch(reference);
  }

  async discover(scope) {
    if (!scope || !(await Deno.stat(scope.absolute).catch(() => null))) return [];
    const declarations = await this.paladin.find.type(scope, "package");
    return [...new Set(declarations.map((module) => dirname(module.source.absolute)))];
  }

  async seed(scope) {
    const locations = await this.discover(scope);
    await this.write(locations);
    return locations;
  }

  async reconcile(checkout, commons) {
    const held = await this.read();
    if (!held) return null;
    const present = async (reference) => Boolean(await Deno.stat(this.resolve(reference).absolute).catch(() => null));
    const dead = [];
    for (const reference of held) if (!(await present(reference))) dead.push(reference);
    if (!dead.length) return { locations: held, stale: [] };
    const inside = (reference) => Boolean(checkout) && this.resolve(reference).absolute.startsWith(`${checkout.absolute}/`);
    const stale = dead.filter((reference) => !inside(reference));
    const kept = held.filter((reference) => !dead.includes(reference) || stale.includes(reference));
    const healed = dead.some(inside) ? (await this.discover(commons)).filter((location) => !kept.includes(location)) : [];
    const record = [...kept, ...healed];
    await this.write(record);
    return { locations: record.filter((reference) => !stale.includes(reference)), stale };
  }

  // ——— the pensieve side (was prototypes/vip.js) ———

  async mount(root) {
    const paths = await this.paladin.find.viva(root);
    const modules = [];
    for (const path of paths) {
      const source = new Path(path);
      const span = this.span.branch(source.absolute);
      try {
        const module = basename(dirname(source.absolute)) === "ledger"
          ? await this.paladin.read.module(path).then((namespace) => ({ ...namespace, manifest: derive(namespace, source) }))
          : await this.paladin.read.viva(path);
        modules.push(probe(RULES)({ ...module, source }, span));
      } catch (error) {
        span.fault(error); // unfit to register: the file's path carries it, the walk continues
      }
    }
    const declaration = modules.find((module) => module.manifest?.type === "package");
    const owner = declaration?.manifest?.owner;
    if (modules.length && !owner)
      throw new Error(`[registry] mount ${root.absolute}: package declares no owner — author manifest.owner (e.g. "@commons")`);
    for (const module of modules) {
      // a copy: read.viva returns the live namespace. the mount's owner stamps; the module's own locks.
      this.pensieve.register({
        ...module,
        manifest: { ...module.manifest, owner: module.manifest?.owner ?? owner },
      });
    }
    return this;
  }

  // held, so a second supply in one process starts from an empty pensieve
  async supply() {
    this.pensieve = new Pensieve();
    this.integrity.clear();
    const checkout = this.paladin.scope.repository;
    const commons = checkout?.branch("commons");
    const reconciled = await this.reconcile(checkout, commons);
    const locations = reconciled?.locations ?? await this.seed(commons);
    this.stale = reconciled?.stale ?? [];
    for (const location of locations) await this.mount(this.resolve(location));
    return this;
  }

  // tap = materialize + record. mount is the runtime's moment — supply() folds the record at boot.
  async tap(source, target) {
    let reference = source;
    if (this.paladin.clone.remote(source)) {
      if (!target && !this.paladin.scope.registry)
        throw new Error(`[registry] tap ${source}: no package store — a remote tap clones into scope.registry (set VIVA_REGISTRY_MOUNT)`);
      const slug = source.split("/").at(-1).replace(/\.git$/, "");
      const destination = target ? new Path(target) : this.paladin.scope.registry.branch(slug);
      await this.paladin.clone(source, destination);
      reference = target ? destination.absolute : slug;
    } else if (target) {
      throw new Error(`[registry] tap ${source}: target only applies to a remote source — a local tap records the reference in place`);
    }
    const root = this.resolve(reference);
    const stat = await Deno.stat(root.absolute).catch(() => null);
    if (!stat)
      throw new Error(`[registry] tap ${source}: nothing at ${root.absolute} — pass a path, a remote, or a reference already in the store`);
    const home = stat.isFile ? new Path(dirname(root.absolute)) : root;
    const declarations = await this.paladin.find.type(home, "package");
    if (!declarations.length)
      throw new Error(`[registry] tap ${source}: no package declaration (manifest.type "package") under ${home.absolute}`);
    if (declarations.length === 1) reference = this.reference(dirname(declarations[0].source.absolute));
    await this.add(reference);
    return reference;
  }

  // untap = record removal ONLY — the store keeps the working copy; next supply() simply omits it.
  untap(reference) {
    return this.remove(reference);
  }

  list(query = {}) {
    return this.pensieve.byType(query.type);
  }

  async lookup(query) {
    const lookup = cast.lookup(query);
    if (!this.pensieve.has(lookup.owner))
      throw new Error(`[registry] package ${lookup.owner} not supplied on this system`);
    const module = await this.pensieve.revelio(lookup);
    if (module) return this.assert(module.source.absolute, module);
    throw new Error(`[registry] Module 404: ${JSON.stringify({ lookup })}`);
  }

  // throws what the fold recorded under path; the consumer that names a faulted module pays, the registry never does
  assert(path, module) {
    const faults = this.integrity.get(`${this.span.absolute}${path}`);
    if (faults) throw new Error(`[registry] ${path}: ${[...faults].join(" · ")}`);
    return module;
  }

  // an identifier resolves through the pensieve; an absolute path reads the file
  async module(identifier) {
    if (!isAbsolute(identifier)) return this.lookup(identifier);
    const module = probe(RULES)({ ...(await this.paladin.read.viva(identifier)), source: new Path(identifier) }, this.span.branch(identifier));
    return this.assert(identifier, module);
  }

  // mask ⊕ module, ONCE. a string is the module; an inline module (manifest, no identifier) is its own
  // citizen; a mask folds over what it names — its word whole (a service's datamap, a seated entry's
  // seats), manifest and statics by key (mask wins) — traits ACCUMULATE, a mask adds and never strips
  // (settle fills traits: [] on every mask manifest) — secrets and the seat the mask's alone.
  // module is the object, identifier the string.
  async accio(query) {
    if (is.string(query)) return this.module(query);
    if (!query.module) return { ...query, module: query, identifier: null };
    const module = await this.module(query.module);
    const citizen = {
      ...module,
      ...query,
      module,
      identifier: query.module,
      manifest: v.primitives.Manifest.cast({ ...module.manifest, ...query.manifest, traits: [...new Set([...traits(module.manifest), ...traits(query.manifest)])] }),
      statics: { ...module.statics, ...query.statics },
      secrets: query.secrets ?? {},
      mountpoint: query.mountpoint ?? null,
    };
    // a mask can add traits or break the manifest: the folded citizen is probed on the entry's own branch
    const entry = `${module.source.absolute}/entry/${citizen.manifest.type}/${citizen.manifest.slug}`;
    return this.assert(entry, probe(RULES)(citizen, this.span.branch(entry)));
  }

  // a daemon mask → its bag: every slot a citizen, the domain picked from the kernel
  async wire(mask) {
    const many = (queries) => Promise.all(queries.map((query) => this.accio(query)));
    // an entry whose identifier named no type is seated here, by the folded manifest — same rule, later moment
    const seated = (citizen) => {
      if (citizen.mount || !mask.mount) return citizen;
      const { type, slug } = citizen.manifest;
      const mount = new Path(`/mode/${type}/${slug}`);
      return { ...citizen, mount, url: mask.url?.branch(mount.absolute), bundles: new Path(`${mask.mountpoint.absolute}/bundles/${type}/${slug}`) };
    };
    const kernel = (await many(mask.kernel)).map(seated);
    return {
      lighthouse: await this.accio(mask.lighthouse),
      datamap: await this.accio(mask.datamap),
      hallucinators: await many(mask.hallucinators),
      consume: Object.fromEntries(await Promise.all(Object.entries(mask.consume).map(async ([slug, query]) => [slug, await this.accio(query)]))),
      kernel,
      domain: v.primitives.kernel.Domain.cast(kernel.find((citizen) => citizen.manifest.type === "domain") ?? {}),
    };
  }

  toJSON() {
    return { record: this.path?.absolute ?? null, pensieve: this.pensieve };
  }
}
