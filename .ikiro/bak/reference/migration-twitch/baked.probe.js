// the version through the bake: what vite's `paladin:baked` hands the browser, and what the browser's paladin then holds.
// run from a copy of the tree, VIVA_INSTANCE_MOUNT on an instance that has the anima client.
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import { Paladin } from "../../../subsystems/paladin/paladin/prototype.js";

await factories.instance(paladin);
const data = await lifecycle.paladin.bake(paladin, "anima");
console.log("server paladin.version:", paladin.version);
console.log("baked keys:", Object.keys(data).join(" · "), "| version:", data.version);

const browser = new Paladin();
lifecycle.paladin.baked(browser, data);
console.log("browser paladin.version:", browser.version);
