import { v } from "@vivalence/typology";
import snapshot from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/tests/snapshots/paladin-instance.snapshot.json" with { type: "json" };

const { InstanceMask } = v.primitives.instance;

console.log(JSON.stringify(Object.keys(snapshot)));
console.log(JSON.stringify(InstanceMask.faults(snapshot), null, 2));
console.log(JSON.stringify(InstanceMask.faults(InstanceMask.cast(structuredClone(snapshot))), null, 2));
