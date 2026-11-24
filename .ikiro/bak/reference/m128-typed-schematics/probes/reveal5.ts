import { v } from "@vivalence/typology";
import type { Static, StaticDecode } from "typebox";
import snapshot from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/tests/snapshots/paladin-instance.snapshot.json" with { type: "json" };

const reveal = (value: never) => value;
const { InstanceMask, RuntimeMask, DaemonMask } = v.primitives.instance;

declare const written: Static<typeof RuntimeMask>;
reveal(written.statics.serve);
reveal(written.manifest.slug);

declare const held: StaticDecode<typeof RuntimeMask>;
reveal(held.statics.serve);
reveal(held.mountpoint);
reveal(held.reference);

declare const daemon: StaticDecode<typeof DaemonMask>;
reveal(daemon.modes);

const fixture: Static<typeof InstanceMask> = snapshot;
console.log(fixture.manifest.slug, InstanceMask.faults(snapshot));
