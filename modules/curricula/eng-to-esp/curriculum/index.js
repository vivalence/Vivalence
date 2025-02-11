import dependencies from "./data/dependencies.js";
import tags from "./data/tags.js";
import units from "./data/units.js";
// import "./data/make.js";

// const curriculum = {};
// const curriculum = { units };
// curriculum.dependencies = [
//   curriculum.dependencies[Math.floor(Math.random() * curriculum.dependencies.length)],
// ];

// DONT OVERWRITE
// UNITS! because the data on file is OOD compared to database (duplicates, verb edits)

// DONT OVERWRITE
// LEARNABLE TAGS! because i reclassified lemmas as learnable bc. i am lazy
const curriculum = { tags, dependencies, units };

export default curriculum;
