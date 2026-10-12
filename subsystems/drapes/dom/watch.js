import { from } from "solid-js";
import { atom } from "@vivalence/typology";

export const watch = (root, ...path) => from(atom.chain(root, ...path));
