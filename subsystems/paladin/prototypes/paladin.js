import { Env, v } from "@vivalence/typology";
import belt from "../belt/index.js";
import { Ledger } from "./ledger/index.js";
import { Vip } from "./vip.js";

const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];

// the five *_MOUNT keys the scopes resolve (lifecycle/populate.js) — a MOUNT is always a path.
// examples are each resolver's own default; ghost derives --<name>=<path> from this, in this order.
const MOUNTS = v.environment({
  VIVA_LEDGER_MOUNT: v.string().desc("machine ledger home — locks, logs, registry, instances, sessions").examples("~/.viva").optional(),
  VIVA_REPOSITORY_MOUNT: v.string().desc("the vivalence checkout — bare references resolve against it").examples("~/vivalence/code/vivalence").optional(),
  VIVA_REGISTRY_MOUNT: v.string().desc("package store — remote taps clone here").examples("~/.viva/registry").optional(),
  VIVA_INSTANCE_MOUNT: v.string().desc("instance home — the dir holding its recipe").examples("~/.viva/instances/hello-world").optional(),
  VIVA_MOUNTPOINT_MOUNT: v.string().desc("the instance's served tree — dbs, bundles, tokens").examples("~/.viva/instances/hello-world/mountpoint").optional(),
});

const SECRET = (key) => key.startsWith("SECRET_");
const PUBLIC = (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_");

export class Paladin {
  traits = [];
  mounts = MOUNTS;
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
    const blank = [];
    for (const [key, value] of Object.entries(bag ?? {})) {
      if (value === "") blank.push(key);
      else if (SECRET(key)) secrets[key] = value;
      else if (PUBLIC(key)) held[key] = value;
      else ignored.push(key);
    }
    return { held, secrets, ignored, blank };
  }

  // assign: no source · observe: ambient · claim: role. all three split by key.
  assign(bag, stratum) {
    const { held, secrets, ignored, blank } = this.split(bag);
    this.env.assign(held, stratum);
    this.secret.assign(secrets, stratum);
    return { held, secrets, ignored, blank };
  }

  observe(bag, stratum, source) {
    const { held, secrets, ignored, blank } = this.split(bag);
    this.env.observe(held, stratum, source);
    this.secret.observe(secrets, stratum, source);
    return { held, secrets, ignored, blank };
  }

  claim(bag, stratum, source) {
    const { held, secrets, ignored, blank } = this.split(bag);
    this.env.claim(held, stratum, source);
    this.secret.claim(secrets, stratum, source);
    return { held, secrets, ignored, blank };
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
    belt.hydrate(this);
    // mountables — siblings of vip, own their state
    this.ledger = new Ledger(this);
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
