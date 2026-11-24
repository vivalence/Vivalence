import { Instance } from "../s4/paladin/instance/prototype.js";
import { integration } from "../s4/paladin/instance/lifecycle/index.js";

const instance = Object.assign(new Instance(), {
  manifest: { type: "instance", slug: "probe" },
  environment: { type: "object", properties: {} },
  runtime: {
    statics: { serve: "http://0.0.0.0:2599", remote: "http://localhost:2599" },
    mountpoint: "/tmp/probe/mountpoint",
    reference: "/runtime/runtime",
    url: "http://localhost:2599/runtime/runtime",
    modes: [],
    hallucinators: [],
  },
  daemons: [
    {
      manifest: { type: "daemon", slug: "flamingo" },
      mountpoint: "/tmp/probe/mountpoint/daemon_flamingo",
      reference: "/daemon/flamingo",
      url: "http://localhost:2599/daemon/flamingo",
      modes: [],
      hallucinators: [],
    },
  ],
});

const kind = (held) => held?.constructor?.name;

integration.settle({ instance });

console.log(
  JSON.stringify(
    {
      faults: instance.paladin.faults,
      dormant: instance.paladin.dormant,
      "runtime.statics.serve": kind(instance.runtime.statics.serve),
      "runtime.mountpoint": kind(instance.runtime.mountpoint),
      "daemons[0].reference": kind(instance.daemons[0].reference),
      "daemons[0].reference.absolute": instance.daemons[0].reference.absolute,
      telemetry: instance.telemetry,
    },
    null,
    2,
  ),
);
