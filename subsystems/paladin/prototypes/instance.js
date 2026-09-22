import { NOTHING } from "./ledger/instances.js";

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

  get home() {
    if (!("instance" in this.paladin.scope)) throw new Error(NOTHING);
    return this.paladin.scope.instance;
  }
}
