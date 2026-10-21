import { fn } from "@vivalence/typology";
import { Paladin } from "./paladin/prototype.js";
import * as lifecycle from "./paladin/lifecycle.js";
import vault from "./gestalten/belt/vault.js";
import is from "./gestalten/belt/is.js";
import baked, { modes } from "paladin:baked";

const paladin = new Paladin();
lifecycle.belt(paladin, [vault, is]);
lifecycle.baked(paladin, { ...baked, modes });

export default paladin;
export const factories = { instance: fn.memo(() => Promise.resolve(paladin.instance), () => paladin.instance) };
