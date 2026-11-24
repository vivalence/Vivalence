import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import { envfile } from "./belt/envfile.js";

const root = await Deno.makeTempDir({ prefix: "belt-envfile-" });
const old = lifecycle.paladin.belt(new Paladin(), FULL);
const next = lifecycle.paladin.belt(new Paladin(), [...FULL, envfile]);
const schema = {
  properties: {
    PUBLIC_A: { group: "one", description: "the a", default: "1" },
    SECRET_B: { group: "two" },
    PUBLIC_C: { group: "one" },
    PLAIN: {},
  },
};
const seed = '# note\nexport PUBLIC_A="0"\n# SECRET_B=""\nKEEP="x"';
const bag = { PUBLIC_A: "9", SECRET_B: "s", NEW: "n", EMPTY: "" };
await Deno.writeTextFile(`${root}/old.env`, seed);
await Deno.writeTextFile(`${root}/next.env`, seed);
const before = await old.state.env(`${root}/old.env`, bag);
const after = await next.envfile.write(`${root}/next.env`, bag);
console.log("write same", before === after);
console.log("scaffold same", old.envfile.scaffold(schema) === next.envfile.scaffold(schema));
console.log(after);
await Deno.remove(root, { recursive: true });
