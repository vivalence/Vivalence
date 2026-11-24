import paladin from "@vivalence/paladin";
import { Vector } from "@vivalence/typology";

export const primer = new Vector().open("role", () =>
  paladin.read.text(new URL("role.md", import.meta.url)),
);
