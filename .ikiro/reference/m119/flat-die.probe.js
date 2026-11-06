import { contexts, shard } from "@vivalence/typology";
import { Daemon } from "../../../systems/runtime/subjects/daemon/prototype.js";

const daemon = new Daemon({ slug: "chess", datamap: { shard: "…" }, twitch: { twitch: "…" }, entities: { mode: "ChessModeRepository" }, cortex: "…", statics: {}, domain: {}, mountpoint: "/m/daemon_chess", mask: { manifest: { slug: "chess" }, reference: "/daemon/chess", url: null, attach: null } });

console.log("Object.keys(contexts.host)");
console.log(JSON.stringify(Object.keys(contexts.host), null, 2));
console.log("shard.context.lift(contexts.host, daemon) · keys");
console.log(JSON.stringify(Object.keys(shard.context.lift(contexts.host, daemon)), null, 2));
console.log("datamap · twitch on the lifted die");
const lifted = shard.context.lift(contexts.host, daemon);
console.log(JSON.stringify({ datamap: lifted.datamap ?? "ABSENT", twitch: lifted.twitch ?? "ABSENT" }, null, 2));
