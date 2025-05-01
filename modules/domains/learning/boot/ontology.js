import { obj } from "@vivalence/shared";
import schema from "../schema/index.js";
import asserterFactory from "../locals/asserter.js";
import Remedy from "../locals/remedy/index.ts";
import Classifier from "../locals/classifier/index.js";
// import lib from "./lib/ontology.js";

export default function boot(runtime) {
  const ontology = {
    annotations: new schema.repositories.annotation(),
    topographies: new schema.repositories.topography(),
    constraints: new schema.repositories.constraint(),
    issues: new schema.repositories.issue(),
    remedy: new Remedy(),
    classifier: new Classifier(),
  };

  const topologies = [
    runtime.config.modules.ontology.topology,
    ...runtime.config.modules.corpora.map((c) => c.topology),
  ];

  for (const {
    annotations = [],
    remedies = [],
    topographies = [],
    constraints = [],
    classifiers = [],
  } of topologies) {
    constraints.forEach((c) => ontology.constraints.create(c));
    annotations.forEach((a) => ontology.annotations.create(a));
    topographies.forEach((t) => ontology.topographies.create(t));
    remedies.forEach((r) => ontology.remedy.register(r));
    classifiers.forEach((c) => ontology.classifier.register(c));
  }

  schematics(ontology);

  ontology.assert = asserterFactory(ontology);

  // ontology.classify = new runtime.ontology.classifier.Parser(ontology);

  runtime.ontology = ontology;
}

function schematics(ontology) {
  const topographies = ontology.annotations.filter((a) => a.traits.includes("TOPOGRAPHICAL"));
  const entitySchematic = ontology.constraints.find((c) => c.traits.includes("SCHEMATIC"));

  for (const entityType of ["unit"]) {
    for (const { data } of topographies) {
      for (let { slug } of data["CATEGORICAL"]) {
        const topography = ontology.topographies.find((t) => slug === t.slug);
        if (!topography) continue;
        if (slug !== "verb") continue;
        ontology.constraints.create({
          topology: topography.topology,
          branch: [entityType, slug],
          traits: ["SCHEMATIC"],
          data: {
            SCHEMATIC: computeSchematic(
              entitySchematic.data.SCHEMATIC,
              topography,
              ontology.annotations,
            ),
          },
        });
      }
    }
  }

  return ontology;
}

function computeSchematic(rootSchema, topography, annotations) {
  const SCHEMATIC = {
    ...obj.deepClone(rootSchema),
    title: topography.name,
    description: topography.description,
  };

  topography.annotations
    .filter(({ branch }) => !!branch)
    .map(({ branch, required }) => [
      annotations.find((a) => [a.slug].join() === branch.join()),
      required,
    ])
    .reduce(
      (schema, [annotation, required]) => branchAnnotation(annotation, schema, required),
      SCHEMATIC.properties.annotation,
    );

  topography.annotations
    .filter(({ condition }) => !!condition)
    .reduce(
      (schema, condition) => conditionAnnotation(schema, condition),
      SCHEMATIC.properties.annotation,
    );

  // if (topography.slug === "verb") console.log(JSON.stringify(SCHEMATIC, null, 2));
  return SCHEMATIC;
}

function conditionAnnotation(schema, condition) {
  schema.allOf.push(condition.condition);
  return schema;
}

function branchAnnotation(annotation, schema, required = false) {
  schema.properties[annotation.slug] = {
    title: annotation.name,
    description: annotation.description,
  };

  if (annotation.traits.includes("CATEGORICAL")) {
    schema.properties[annotation.slug].type = "string";
    schema.properties[annotation.slug].enum = annotation.data.CATEGORICAL.map(({ slug }) => slug);
  } else if (annotation.traits.includes("FREE")) {
    schema.properties[annotation.slug].type = "string";
  }

  if (required) schema.required.push(annotation.slug);

  return schema;
}

// function corpora(runtime) {
//   for (const corpus of runtime.config.modules.corpora) {
//     corpus.boot({
//       ...runtime,
//       aperture: runtime.aperture.branch(),
//       emitter: runtime.emitter.branch(),
//     });
//   }
// }

// ontology.boot
// corpora.boot
// tactics.boot
// games.boot

// export default { ontology, corpora };

// export const defaultModuleBoot: { [key: string]: BootFunction } = {
//   // move to domain?
//   tactic: (runtime: Runtime, tactic: RuntimeModule) => {
//     // assert handlers
//     if (!tactic.Module.provision) {
//       throw new Error("Tactic module must export provision method");
//     }

//     runtime.aperture.open("/provision", tactic.Module.provision);

//     return Promise.resolve(runtime);
//   },

//   game: (runtime: Runtime, game: RuntimeModule) => {
//     // assert handlers
//     const bundle = bundler({
//       entry: game.Module.bundle,
//       serve: game.entity.url,
//     });

//     runtime.aperture.router.get(bundle.url, bundle.serve());

//     // this should be handled elsewhere
//     game.Module.provision &&
//       runtime.aperture
//         .branch()
//         .use(bundle.injectBundleUrl())
//         .open("/provision", game.Module.provision);

//     runtime.aperture.open("/status", () => ({ status: "game ok" }));
//     game.Module.evaluate && runtime.aperture.open("/evaluate", game.Module.evaluate);

//     return Promise.resolve(runtime);
//   },
// };
