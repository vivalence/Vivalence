import unit from "./unit.js";
import tag from "./tag.js";

const constraints = [];

Object.entries({ unit, tag }).map(([type, entity]) => {
  constraints.push({
    branch: [type],
    traits: ["SCHEMATIC"],
    data: { SCHEMATIC: entity },
  });
});

export default constraints;
