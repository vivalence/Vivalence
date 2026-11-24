import { steer, Twitch, Vector } from "@vivalence/typology";

const heard = [];

const module = {
  twitch: new Vector()
    .open("/after/datamap/migrate/2026.11.0", () => heard.push("mode step"))
    .open("/after/note/create", () => heard.push("mode note")),
};

const MIGRATE = ["datamap", "migrate"];
const migrating = (pattern, path) =>
  path.slice(1, 3).every((step, index) => step.nature === MIGRATE[index]);

const whole = new Twitch().graft(module.twitch);
const sieved = new Twitch().graft(steer.trie.sieve(module.twitch, migrating));
const mode = new Twitch().graft(module.twitch);

const routes = (twitch) =>
  steer.trie.leaves(twitch).map((leaf) => leaf.steps.map((step) => step.nature).join("/"));

console.log("runtime, whole graft :", routes(whole));
console.log("runtime, sieved graft:", routes(sieved));
console.log("mode's own twitch    :", routes(mode));

await sieved.dispatch("/after/datamap/migrate/2026.11.0", { release: "2026.11.0" });
await sieved.dispatch("/after/note/create", {});
await mode.dispatch("/after/note/create", {});
console.log("heard, sieved:", heard);

heard.length = 0;
await whole.dispatch("/after/note/create", {});
await mode.dispatch("/after/note/create", {});
console.log("heard, whole :", heard);
