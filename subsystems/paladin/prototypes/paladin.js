import { Env } from "@vivalence/typology";
import belt from "../belt/index.js";
import { Ledger } from "./ledger/index.js";
import { Instance } from "./instance.js";
import { Vip } from "./vip.js";

const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];

const SECRET = (key) => key.startsWith("SECRET_");
const PUBLIC = (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_");

export class Paladin {
  traits = [];
  env = new Env(STRATA);
  secret = new Env(STRATA);

  // SUPERSEDED — one ingress that both split and filed; claim-strength could not vary.
  // assign(bag, stratum) {
  //   const held = {}; const secrets = {}; const ignored = [];
  //   for (const [key, value] of Object.entries(bag ?? {})) {
  //     if (SECRET(key)) secrets[key] = value;
  //     else if (PUBLIC(key)) held[key] = value;
  //     else ignored.push(key);
  //   }
  //   this.env.assign(held, stratum);
  //   this.secret.assign(secrets, stratum);
  //   return { held, secrets, ignored };
  // }

  // a KEY decides what it is. nothing else may.
  split(bag) {
    const held = {};
    const secrets = {};
    const ignored = [];
    for (const [key, value] of Object.entries(bag ?? {})) {
      if (SECRET(key)) secrets[key] = value;
      else if (PUBLIC(key)) held[key] = value;
      else ignored.push(key);
    }
    return { held, secrets, ignored };
  }

  // mount is fn.once, so a changed .env needs a fresh instance. the wizard is why.
  remount() {
    this.instance = new Instance(this);
    return this.instance.mount();
  }

  // assign: no source · observe: ambient · claim: role. all three split by key.
  assign(bag, stratum) {
    const { held, secrets, ignored } = this.split(bag);
    this.env.assign(held, stratum);
    this.secret.assign(secrets, stratum);
    return { held, secrets, ignored };
  }

  observe(bag, stratum, source) {
    const { held, secrets, ignored } = this.split(bag);
    this.env.observe(held, stratum, source);
    this.secret.observe(secrets, stratum, source);
    return { held, secrets, ignored };
  }

  claim(bag, stratum, source) {
    const { held, secrets, ignored } = this.split(bag);
    this.env.claim(held, stratum, source);
    this.secret.claim(secrets, stratum, source);
    return { held, secrets, ignored };
  }

  constructor() {
    // deprecated
    // belt.join(this);
    // belt
    belt.read(this);
    belt.find(this);
    belt.check(this);
    belt.state(this);
    // resolution
    belt.is(this);
    belt.scope(this);
    belt.publish(this);
    belt.source(this);
    belt.clone(this);
    belt.bundler(this);
    // mountables — siblings of vip, own their state, fn.once mount()
    this.ledger = new Ledger(this);
    this.instance = new Instance(this);
    this.vip = new Vip(this);
  }

  get role() {
    // role = string; // client runtime 'daemon service process
    return this.env.get("VIVA_SYSTEM_ROLE");
  }
  get mode() {
    // mode = string; // development production
    return this.env.get("VIVA_SYSTEM_MODE");
  }
}
