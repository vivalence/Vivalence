import { RuleEntity } from "@vivalence/schema";
import unit from "./entities/unit.js";
import tag from "./entities/tag.js";

export default function loadentities(ontology) {
  ontology.rules.add(
    new RuleEntity({
      path: ["unit"],
      traits: ["SCHEMATIC"],
      data: { SCHEMATIC: { json: unit } },
    }),
  );
  ontology.rules.add(
    new RuleEntity({
      path: ["tag"],
      traits: ["SCHEMATIC"],
      data: { json: tag },
    }),
  );

  return ontology;
}
