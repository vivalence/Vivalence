import { v } from "@vivalence/typology";
import * as jsonc from "@std/jsonc";
import { Lock } from "./lock.js";
import { Log } from "./log.js";
import { Instances } from "./instances.js";
import { Registry } from "./registry.js";
import { Die } from "./die.js";

export const RECIPE = "ledger.viva.json";

export const RECORDS = ["instances", "registry"];

// the ledger's word by its place: type and slug from the file; the file's own manifest overwrites it
export const derive = (module, source) => ({ type: "ledger", slug: source.filename.replace(/\.viva\.(?:[jt]s|json)$/, ""), ...(module.manifest ?? {}) });

export class Ledger {
  constructor(paladin) {
    this.paladin = paladin;
  }

  authored(source) {
    try {
      return jsonc.parse(Deno.readTextFileSync(source.absolute));
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) return null;
      throw new Error(`ledger: ${source.absolute} — ${error.message}`);
    }
  }

  record(slot) {
    const home = this.paladin.scope.ledger;
    const source = home.branch(RECIPE);
    const value = this.authored(source)?.[slot];
    if (value === undefined) return { path: home.branch(`${slot}.json`), fallback: true };
    const located = this.paladin.read.locate(source, value, slot);
    return { path: located.path ?? null, held: located.held ?? null, from: located.from, fallback: false };
  }

  get instances() {
    const { path, ...record } = this.record("instances");
    return new Instances(this.paladin, path, record);
  }

  // held, not minted per access: the registry carries the pensieve, and a pensieve must persist.
  // lazy because scope.ledger resolves in populate.scopes, after the Paladin constructor.
  get registry() {
    if (this.held) return this.held;
    const { path, ...record } = this.record("registry");
    return (this.held = new Registry(this.paladin, path, record));
  }

  lock(instance) {
    return new Lock(this.paladin, this.paladin.scope.ledger.branch(`/locks/${instance}.lock`));
  }

  log(instance) {
    return new Log(this.paladin, instance);
  }

  // the ledger's own declaration — ANY .viva.js at the ledger root (depth 0: instances/ and registry/
  // below are not its word). the file's place IS the declaration: type derives (ledger), slug derives
  // from the stem (viva.viva.js → viva); an exported manifest only LOCKS a field. absent is silent:
  // a ledger that says nothing is a ledger whose instances say everything themselves. two files is a
  // throw; a manifest that says it is something else is a throw.
  async recipe() {
    const home = this.paladin.scope.ledger;
    if (this.declaration !== undefined && this.home === home?.absolute) return this.declaration;
    this.home = home?.absolute;
    const source = home?.branch(RECIPE);
    const module = source ? await this.paladin.read.json(source, null) : null;
    if (!module) return (this.declaration = null);
    const manifest = derive(module, source);
    if (manifest.type !== "ledger")
      throw new Error(`ledger: ${source.absolute} declares manifest.type "${manifest.type}" — a file at the ledger root is the ledger; drop the type or say "ledger"`);
    const faults = v.primitives.Manifest.faults(manifest);
    if (faults.length)
      throw new Error(`ledger: ${source.absolute} manifest ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`);
    const slots = Object.entries(module).filter(([slot]) => slot !== "manifest" && !RECORDS.includes(slot));
    const parts = await Promise.all(slots.map(async ([slot, value]) => [slot, await this.paladin.read.part(source, value, slot)]));
    return (this.declaration = { ...Object.fromEntries(parts), manifest, source });
  }

  async boot(specs, { instance = null, attachment = "inherit" } = {}) {
    this.paladin.check.instance(this.paladin.instance).throw();
    this.paladin.publish();
    const die = new Die({ ledger: this, specs, instance, attachment });
    await die.populate();
    await die.resolve();
    return die;
  }
}
