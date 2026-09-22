import { v } from "@vivalence/typology";
import { Lock } from "./lock.js";
import { Log } from "./log.js";
import { Instances } from "./instances.js";
import { Registry } from "./registry.js";
import { Die } from "./die.js";

export const RECIPE = "ledger.viva.js";

// the ledger's word by its place: type and slug from the file; the file's own manifest overwrites it
export const derive = (module, source) => ({ type: "ledger", slug: source.filename.replace(/\.viva\.[jt]s$/, ""), ...(module.manifest ?? {}) });

export class Ledger {
  constructor(paladin) {
    this.paladin = paladin;
  }

  get instances() {
    return new Instances(this.paladin, this.paladin.scope.ledger.branch("instances.json"));
  }

  // held, not minted per access: the registry carries the pensieve, and a pensieve must persist.
  // lazy because scope.ledger resolves in populate.scopes, after the Paladin constructor.
  get registry() {
    return (this.held ??= new Registry(this.paladin, this.paladin.scope.ledger.branch("registry.json")));
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
    if (this.declaration !== undefined) return this.declaration;
    const home = this.paladin.scope.ledger;
    const sources = home ? await this.paladin.find.viva(home, 0).catch(() => []) : [];
    if (sources.length > 1)
      throw new Error(`ledger: one declaration per ledger — ${home.absolute} holds ${sources.map((path) => path.filename).join(", ")}`);
    const [source] = sources;
    if (!source) return (this.declaration = null);
    const module = await this.paladin.read.module(source);
    const manifest = derive(module, source);
    if (manifest.type !== "ledger")
      throw new Error(`ledger: ${source.absolute} declares manifest.type "${manifest.type}" — a file at the ledger root is the ledger; drop the type or say "ledger"`);
    const faults = v.primitives.Manifest.faults(manifest);
    if (faults.length)
      throw new Error(`ledger: ${source.absolute} manifest ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`);
    return (this.declaration = { ...module, manifest, source });
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
