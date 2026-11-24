import { v } from "@vivalence/typology";
import type { Static } from "typebox";

const reveal = (value: never) => value;

declare const queueing: Static<typeof v.traits.Queueing>;
reveal(queueing);

declare const reference: Static<typeof v.primitives.auth.UserReference>;
reveal(reference);

declare const signal: Static<typeof v.primitives.harness.Signal>;
reveal(signal);

declare const phase: Static<ReturnType<typeof v.thread>>["phase"];
reveal(phase);

declare const trait: Static<typeof v.thread.traits>;
reveal(trait.QUEUEING);

declare const thread: Static<ReturnType<typeof v.thread>>;
reveal(thread);
