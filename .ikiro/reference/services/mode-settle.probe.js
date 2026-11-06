import { Path, v } from "@vivalence/typology";
import { Paladin } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/paladin/prototype.js";
import { FULL } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/gestalten/belt/index.js";
import { factories, lifecycle } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/typology.js";

const { DaemonMask, InstanceMask } = v.primitives.instance;
const modeMask = DaemonMask.properties.modes.items.anyOf.find((schema) => schema.type === "object");
modeMask.properties.consume = DaemonMask.properties.consume;
console.log("hunk 1 applied in memory to ModeMask:", Object.keys(modeMask.properties).join(" "));

const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([
  ["instance", () => true, () => new Path("/fixtures/probe")],
  ["mountpoint", () => true, () => new Path("/mountpoint")],
]);
paladin.env.set("VIVA_PROBE_SERVE", "http://localhost:2501/", "flag");
paladin.env.set("VIVA_PROBE_REMOTE", "http://localhost:2501/lighthouse", "flag");
paladin.secret.set("SECRET_VIVA_PROBE_A", "canary", "flag");
paladin.secret.set("SECRET_VIVA_PROBE_JWT", "a-signing-secret-of-twenty-four-or-more", "flag");

const stanza = (key) => ({
  module: "@commons/service/nlp-stanza",
  secrets: { key },
  statics: { remote: "${VIVA_PROBE_REMOTE}" },
});
const environment = v.environment({
  VIVA_PROBE_SERVE: v.url().desc("serve"),
  VIVA_PROBE_REMOTE: v.url().desc("remote"),
  SECRET_VIVA_PROBE_A: v.string().desc("a"),
  SECRET_VIVA_PROBE_JWT: v.string({ minLength: 24 }).desc("jwt"),
  SECRET_VIVA_PROBE_D: v.string().desc("d").optional(),
});
const module = JSON.parse(JSON.stringify({
  manifest: { type: "instance", slug: "probe", version: "0.0.1" },
  runtime: {
    manifest: { slug: "runtime" },
    statics: { serve: "${VIVA_PROBE_SERVE}", remote: "${VIVA_PROBE_REMOTE}" },
    secrets: { jwt: "${SECRET_VIVA_PROBE_JWT}" },
  },
  datamap: { module: "@commons/datamap/libsql" },
  daemons: [{
    manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
    consume: { held: stanza("${SECRET_VIVA_PROBE_A}"), blank: stanza("${SECRET_VIVA_PROBE_D}") },
    modes: [{
      module: "@education/game/dojo",
      consume: { held: stanza("${SECRET_VIVA_PROBE_A}"), blank: stanza("${SECRET_VIVA_PROBE_D}") },
    }],
  }],
  environment,
}));
paladin.find.recipe = (home) => home.branch("instance.viva.json");
paladin.read.json = async () => module;
const instance = await factories.instance(lifecycle.paladin.instance(paladin));

const [daemon] = instance.daemons;
console.log("daemon.consume keys   ", JSON.stringify(Object.keys(daemon.consume)));
console.log("mode.consume keys     ", JSON.stringify(Object.keys(daemon.modes[0].consume)));
console.log("mode.consume.held     ", JSON.stringify(daemon.modes[0].consume.held));
console.log("mode.consume.blank    ", JSON.stringify(daemon.modes[0].consume.blank));
console.log("dormant               ", JSON.stringify(instance.dormant));
console.log("faults                ", JSON.stringify(instance.faults));
