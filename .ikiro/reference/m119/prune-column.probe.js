import { datamap } from "@vivalence/runtime/scenarios";
import { mint } from "../../../systems/runtime/gestalten/belt/traits.js";
import { sets } from "@vivalence/runtime";
import { wrap } from "@mikro-orm/core";

const scenario = await datamap.seed();
const { repos, em, fixtures } = scenario;
repos.mode.create({ slug: "runtime", type: "harness", daemon: null, traits: [], installed: "" });
await em.flush();
em.clear();

const rows = async (daemon) =>
  scenario.datamap.shard.scope(async () =>
    (await repos.mode.find({ daemon })).map((row) => wrap(row).toPOJO()),
  );

console.log("belt.modes.prune(die.daemon, die.daemon.slug) · find({ daemon })");
console.log(JSON.stringify(await rows(fixtures.daemon.slug), null, 2));
console.log("belt.modes.prune(die.runtime, null) · find({ daemon })");
console.log(JSON.stringify(await rows(null), null, 2));
console.log("mint({ slug: \"chess\" }).literal");
console.log(JSON.stringify(mint({ slug: "chess", kinds: sets.traits, traits: { literal: [], symbol: [], note: [], mode: [] } }).literal, null, 2));
await scenario.orm.close();
