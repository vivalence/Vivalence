import { v } from "@vivalence/typology";

const { instance } = v.primitives;
const daemon = {
  manifest: { type: "daemon", slug: "chess", version: "0.1.0" },
  mountpoint: "/viva/instances/chess/mountpoint/daemon_chess",
  modes: [
    "@chess/mode/board",
    { module: "@chess/mode/play", consume: { nlp: { module: "@commons/services/nlp" } } },
  ],
  hallucinators: [{ module: "@commons/hallucinators/anthropic", faculties: [] }],
};

console.log("== the key, as JSON");
console.log(JSON.stringify(instance.Mask.properties.module));
const cast = instance.DaemonMask.cast(daemon);
console.log("== faults of the daemon mask, cast");
console.log(JSON.stringify(instance.DaemonMask.faults(cast)));
console.log("== every ModuleIdentifier in the daemon mask");
console.log(JSON.stringify(v.collect(instance.DaemonMask, cast, v.scalars.ModuleIdentifier).map((hit) => [hit.at, typeof hit.value])));
console.log("== every Version");
console.log(JSON.stringify(v.collect(instance.DaemonMask, cast, v.scalars.Version)));
console.log("== $id in the instance mask's JSON, by name");
const names = JSON.stringify(instance.InstanceMask).match(/"\$id":"[A-Za-z]+"/g) ?? [];
const counted = Object.groupBy(names, (name) => name.slice(7, -1));
console.log(Object.entries(counted).map(([name, held]) => `${name} ${held.length}`).join(" · "));
console.log("== the instance mask compiles");
console.log(typeof instance.InstanceMask.compile().Check);
