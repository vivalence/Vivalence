import { basename, dirname, isAbsolute, relative, resolve as absolute } from "@std/path";
import { cast, is, object, Path, Span, v } from "@vivalence/typology";
import { Pensieve } from "../pensieve.js";
import { probe, RULES } from "./integrity.js";
import { derive } from "./ledger.js";

const traits = (manifest) => manifest?.traits ?? [];

const normalize = (location) =>
  isAbsolute(location) ? location : location.replace(/^\.\//, "");

const declared = (module) => {
  const root = dirname(module.source.absolute);
  if (!module.manifest?.owner) throw new Error(`[registry] ${root}: package declares no owner — author manifest.owner (e.g. "@commons")`);
  return { owner: module.manifest.owner, slug: module.manifest.slug, root };
};

export class Registry {
  constructor(paladin, path, { held = null, from = null, fallback = true } = {}) {
    this.paladin = paladin;
    this.path = path;
    this.held = held;
    this.from = from;
    this.fallback = fallback;
    this.pensieve = new Pensieve();
    this.stale = [];
    // the span is the only log; its pipe fills the index the doctor and assert() read — what is wrong under a
    // path, said once however often it is probed (the journal is capped, the map is not)
    this.span = new Span({ nature: "/registry" });
    this.integrity = new Map();
    this.span.to((record) => record.verb === "fault" && (this.integrity.get(record.path) ?? this.integrity.set(record.path, new Set()).get(record.path)).add(record.data.message));
  }

  async read() {
    const record = this.held
      ? structuredClone(this.held)
      : await this.paladin.read.json(this.path, this.fallback ? null : undefined).catch((error) => {
        throw new Error(`registry: ${this.path.absolute} ("${this.from}") — ${error?.code === "ENOENT" ? "no such file" : error.message}`);
      });
    if (record === null || v.check(v.primitives.instance.Tapped, record)) return record;
    const errors = [...v.errors(v.primitives.instance.Tapped, record)].map((error) => `${error.instancePath || "/"} ${error.message}`);
    throw new Error(`registry: ${this.path?.absolute ?? `inline ("${this.from}")`} — not a registry record: ${errors.join(" · ")}`);
  }

  async write(record) {
    if (this.held) throw new Error(`registry: inline ("${this.from}") — read-only; declare a path to write`);
    return await this.paladin.state.json(this.path, record);
  }

  async tapped() {
    return (await this.read()) ?? {};
  }

  async has(owner) {
    return Object.hasOwn(await this.tapped(), owner);
  }

  async add(owner, entry) {
    const record = await this.tapped();
    const held = record[owner];
    if (held && held.mount !== entry.mount)
      throw new Error(`[registry] ${owner} is tapped at ${held.mount} — untap it before tapping ${entry.mount}`);
    const next = { ...record, [owner]: { ...held, ...entry } };
    if (held && object.equals(next[owner], held)) return record;
    await this.write(next);
    return next;
  }

  async remove(owner) {
    const record = await this.tapped();
    if (!Object.hasOwn(record, owner)) return record;
    const next = Object.fromEntries(Object.entries(record).filter(([held]) => held !== owner));
    await this.write(next);
    return next;
  }

  get base() {
    return this.path ? dirname(this.path.absolute) : this.paladin.scope.ledger.absolute;
  }

  locate(root) {
    const segment = relative(this.base, root);
    return segment && !segment.startsWith("..") && !isAbsolute(segment) ? `./${segment}` : root;
  }

  resolve(mount) {
    return new Path(isAbsolute(mount) ? mount : absolute(this.base, mount));
  }

  stored(location) {
    location = normalize(location);
    if (isAbsolute(location)) return new Path(location);
    if (!this.paladin.scope.registry)
      throw new Error(`[PALADIN] registry resolve ${location}: no package store — a relative location resolves against scope.registry (set VIVA_REGISTRY_MOUNT)`);
    return this.paladin.scope.registry.branch(location);
  }

  row({ owner, slug, root }) {
    return [owner, { slug, mount: this.locate(root) }];
  }

  async discover(scope) {
    if (!scope || !(await Deno.stat(scope.absolute).catch(() => null))) return [];
    return (await this.paladin.find.type(scope, "package")).map(declared);
  }

  async seed(scope) {
    const record = Object.fromEntries((await this.discover(scope)).map((found) => this.row(found)));
    await this.write(record);
    return record;
  }

  async reconcile(checkout, commons) {
    const held = await this.read();
    if (!held) return null;
    const present = async (owner) => Boolean(await Deno.stat(this.resolve(held[owner].mount).absolute).catch(() => null));
    const dead = [];
    for (const owner of Object.keys(held)) if (!(await present(owner))) dead.push(owner);
    if (!dead.length) return { record: held, stale: [] };
    const inside = (owner) => Boolean(checkout) && this.resolve(held[owner].mount).absolute.startsWith(`${checkout.absolute}/`);
    const stale = dead.filter((owner) => !inside(owner));
    const kept = Object.fromEntries(Object.entries(held).filter(([owner]) => !dead.includes(owner) || stale.includes(owner)));
    const healed = dead.some(inside)
      ? (await this.discover(commons)).filter((found) => !Object.hasOwn(kept, found.owner)).map((found) => this.row(found))
      : [];
    const record = { ...kept, ...Object.fromEntries(healed) };
    await this.write(record);
    return { record: Object.fromEntries(Object.entries(record).filter(([owner]) => !stale.includes(owner))), stale };
  }

  // ——— the pensieve side (was prototypes/vip.js) ———

  async mount(root, claim = null) {
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
    const nested = modules
      .filter((module) => module.manifest?.type === "package" && dirname(module.source.absolute) !== root.absolute)
      .map((module) => `${dirname(module.source.absolute)}/`);
    const own = modules.filter((module) => !nested.some((boundary) => module.source.absolute.startsWith(boundary)));
    const declaration = own.find((module) => module.manifest?.type === "package");
    const owner = declaration?.manifest?.owner;
    if (own.length && !owner)
      throw new Error(`[registry] mount ${root.absolute}: package declares no owner — author manifest.owner (e.g. "@commons")`);
    if (claim && (owner !== claim.owner || declaration?.manifest?.slug !== claim.slug))
      throw new Error(`[registry] mount ${root.absolute}: the record names ${claim.owner}/package/${claim.slug}, the package declares ${owner}/package/${declaration?.manifest?.slug} — re-tap it`);
    for (const module of own) {
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
    const record = reconciled?.record ?? await this.seed(commons);
    this.stale = reconciled?.stale ?? [];
    for (const [owner, { slug, mount }] of Object.entries(record)) await this.mount(this.resolve(mount), { owner, slug });
    return this;
  }

  // tap = materialize + record. mount is the runtime's moment — supply() folds the record at boot.
  async tap(source, target) {
    let location = source;
    let remote = null;
    if (this.paladin.clone.remote(source)) {
      if (!target && !this.paladin.scope.registry)
        throw new Error(`[registry] tap ${source}: no package store — a remote tap clones into scope.registry (set VIVA_REGISTRY_MOUNT)`);
      const slug = source.split("/").at(-1).replace(/\.git$/, "");
      const destination = target ? new Path(target) : this.paladin.scope.registry.branch(slug);
      await this.paladin.clone(source, destination);
      location = destination.absolute;
      remote = source;
    } else if (target) {
      throw new Error(`[registry] tap ${source}: target only applies to a remote source — a local tap records the location in place`);
    }
    const root = this.stored(location);
    const stat = await Deno.stat(root.absolute).catch(() => null);
    if (!stat)
      throw new Error(`[registry] tap ${source}: nothing at ${root.absolute} — pass a path, a remote, or a location already in the store`);
    const home = stat.isFile ? new Path(dirname(root.absolute)) : root;
    const found = await this.paladin.find.type(home, "package");
    const rooted = found.filter((module) => dirname(module.source.absolute) === home.absolute);
    const declarations = rooted.length ? rooted : found;
    if (!declarations.length)
      throw new Error(`[registry] tap ${source}: no package declaration (manifest.type "package") under ${home.absolute}`);
    if (declarations.length > 1)
      throw new Error(`[registry] tap ${source}: ${declarations.length} package declarations under ${home.absolute} — tap one: ${declarations.map((module) => dirname(module.source.absolute)).join(" · ")}`);
    const [owner, entry] = this.row(declared(declarations[0]));
    await this.add(owner, remote ? { ...entry, remote } : entry);
    return owner;
  }

  // untap = record removal ONLY — the store keeps the working copy; next supply() simply omits it.
  untap(owner) {
    return this.remove(owner);
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
  // citizen; a mask folds over what it names — its word whole (a service's datamap, a placed entry's
  // reference · url · mountpoint), manifest and statics by key (mask wins) — traits ACCUMULATE, a mask adds and never strips
  // (settle fills traits: [] on every mask manifest) — secrets and the mountpoint the mask's alone.
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

  // a runtime's or a daemon's mask → its bag: every slot a citizen, the domain picked from its modes
  async wire(mask) {
    const many = (queries) => Promise.all(queries.map((query) => this.accio(query)));
    // an entry whose identifier named no type is placed here, by the folded manifest — same rule, later moment
    const placed = (citizen) => {
      if (citizen.reference || !mask.reference) return citizen;
      const { type, slug } = citizen.manifest;
      const reference = new Path(`/mode/${type}/${slug}`);
      return { ...citizen, reference, url: mask.url?.branch(reference.absolute), bundles: new Path(`${mask.mountpoint.absolute}/bundles/${type}/${slug}`) };
    };
    const modes = (await many(mask.modes ?? [])).map(placed);
    return {
      ...(mask.datamap && { datamap: await this.accio(mask.datamap) }),
      hallucinators: await many(mask.hallucinators ?? []),
      consume: Object.fromEntries(await Promise.all(Object.entries(mask.consume ?? {}).map(async ([slug, query]) => [slug, await this.accio(query)]))),
      modes,
      domain: v.primitives.kernel.Domain.cast(modes.find((citizen) => citizen.manifest.type === "domain") ?? {}),
    };
  }

  toJSON() {
    return { record: this.path?.absolute ?? null, pensieve: this.pensieve };
  }
}
