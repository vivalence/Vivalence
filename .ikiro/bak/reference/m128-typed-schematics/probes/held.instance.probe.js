import { v } from "@vivalence/typology";
import { Instance } from "../../../../subsystems/paladin/instance/prototype.js";

const { InstanceMask } = v.primitives.instance;

const instance = Object.assign(new Instance(), {
  manifest: { type: "instance", slug: "probe" },
  environment: { type: "object", properties: {} },
  runtime: {
    statics: { serve: "http://0.0.0.0:2599", remote: "http://localhost:2599" },
    mountpoint: "/tmp/probe/mountpoint",
    reference: "/runtime/runtime",
    url: "http://localhost:2599/runtime/runtime",
    modes: [],
  },
  daemons: [
    {
      manifest: { type: "daemon", slug: "flamingo" },
      mountpoint: "/tmp/probe/mountpoint/daemon_flamingo",
      reference: "/daemon/flamingo",
      url: "http://localhost:2599/daemon/flamingo",
      modes: [],
    },
  ],
});

const kind = (held) => held?.constructor?.name;
const read = (subject) => ({
  "runtime.statics.serve": kind(subject.runtime.statics.serve),
  "runtime.mountpoint": kind(subject.runtime.mountpoint),
  "runtime.reference": kind(subject.runtime.reference),
  "daemons[0].reference": kind(subject.daemons[0].reference),
  "daemons[0].mountpoint": kind(subject.daemons[0].mountpoint),
});

InstanceMask.cast(instance);
const faults = InstanceMask.faults(instance);
const afterCast = read(instance);
const returned = InstanceMask.decode(instance);

console.log(
  JSON.stringify(
    {
      faults,
      afterCast,
      returnedIsTheInstance: returned === instance,
      afterDecodeOnTheInstance: read(instance),
      onTheReturnedObject: read(returned),
    },
    null,
    2,
  ),
);
