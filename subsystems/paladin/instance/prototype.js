import { object } from "@vivalence/typology";
import { NOTHING } from "../prototypes/instances.js";

const CHILDREN = {
  runtime: {
    args: (repository) => ["run", "-A", "--config", `${repository}/deno.jsonc`, `${repository}/systems/runtime/run.js`],
    serve: (instance) => instance.runtime?.statics.serve,
  },
  anima: {
    args: (repository) => ["task", "--config", `${repository}/deno.jsonc`, "-q", "anima/watch"],
    serve: (instance) => instance.clients.find((client) => client.manifest.slug === "anima")?.statics.serve,
  },
};

const INHERITED = ["PATH", "HOME", "TMPDIR", "XDG_CONFIG_HOME", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];
const carried = (key) =>
  INHERITED.includes(key) || (/^(VIVA|PUBLIC_VIVA|SECRET_VIVA)_/.test(key) && key !== "VIVA_PROCESS_ID");

export class Instance {
  manifest = {};
  environment;
  runtime;
  lighthouse;
  datamap;
  hallucinators;
  clients = [];
  services = [];
  daemons = [];
  requirements = [];
  faults = [];
  dormant = [];
  inherited = []; // the slots the ledger supplied — provenance for the doctor, never read by the runtime

  constructor(paladin) {
    this.paladin = paladin;
  }

  mask(slug) {
    const held = this.clients.find((client) => client.manifest.slug === slug);
    if (!held) throw new Error(`instance ${this.home.absolute} masks no ${slug} client — ${this.clients.map((client) => client.manifest.slug).join(" · ") || "no client at all"}`);
    return held;
  }

  get processes() {
    return Object.keys(CHILDREN);
  }

  specs(...processes) {
    const mount = this.home.absolute;
    const repository = this.paladin.scope.repository.absolute;
    const env = {
      ...object.filter(Deno.env.toObject(), carried),
      VIVA_INSTANCE_MOUNT: mount,
      VIVA_LEDGER_MOUNT: this.paladin.scope.ledger.absolute,
      VIVA_REPOSITORY_MOUNT: repository,
    };
    return processes.map((process) => ({
      identity: { process, mount },
      serve: CHILDREN[process].serve(this)?.absolute ?? null,
      command: { bin: Deno.execPath(), args: CHILDREN[process].args(repository), cwd: mount, env },
    }));
  }

  get home() {
    if (!("instance" in this.paladin.scope)) throw new Error(NOTHING);
    return this.paladin.scope.instance;
  }
}
