export class Instance {
  manifest = {};
  environment;
  runtime;
  lighthouse;
  datamap;
  clients = [];
  services = [];
  daemons = [];
  telemetry;
  paladin = {
    requirements: [],
    faults: [],
    dormant: [],
    inherited: [],
  };

  client(slug) {
    const held = this.clients.find((client) => client.manifest.slug === slug);
    if (!held) throw new Error(`instance ${this.manifest.slug} masks no ${slug} client — ${this.clients.map((client) => client.manifest.slug).join(" · ") || "no client at all"}`);
    return held;
  }
}
