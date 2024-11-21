// import dependencies from "./dependencies/index.js";
// import units from "./units/index.js";

// async function install(runtime, Corpus) {
//   for (const unit of units) {
//     unit.corpusId = Corpus.manifest.id;
//     const installed = await runtime.call("/units/install", { unit });
//   }

//   for (const dependency of dependencies) {
//     dependency.corpusId = Corpus.manifest.id;
//     const installed = await runtime.call("/dependencies/install", { dependency });
//   }

//   return true;
// }

// const curriculum = {
//   units: [],
//   tags: [],
//   dependencies: [],
// };
