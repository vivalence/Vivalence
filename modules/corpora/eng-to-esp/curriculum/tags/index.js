export default (runtime) => {
  const schema = runtime.schema;
  return {};
};

// import fs from "node:fs";
// import data from "./units.js";

// let units = data.Unit.map((unit) => {
//   return {
//     createdAt: unit.createdAt,
//     updatedAt: unit.updatedAt,
//     slug: unit.slug,
//     data: JSON.parse(unit.data),
//     annotation: JSON.parse(unit.annotation),
//   };
// });

// console.log(units[0]);

// // write units to file at units.js
// fs.writeFileSync("units.js", `export default ${JSON.stringify(units)}`);
