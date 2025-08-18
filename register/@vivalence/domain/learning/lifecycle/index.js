import { validators } from "@vivalence/shared";
import { obj } from "@vivalence/shared";
import { fn } from "@vivalence/shared";
import { lifecycle as module } from "../modules/index.js";

import { signal } from "../memory/schema.js";
// import datasets from "./datasets.js";

// const datadimension = {
//   slug: "data",
//   name: "data annotation dimension",
//   description: "",
//   traits: ["SCHEMATIC"],
//   data: {
//     SCHEMATIC: {}, // example, xyz.
//   },
// };
function boot(runtime) {
  // runtime.ontology.dimension.add(datadimension);
  // for (topography of ontology.topographies) t.dimensions.add(datadimension);

  runtime.schema.signal = signal;

  // temporary
  // await datasets(runtime);
}

function constraints(runtime) {
  for (const dimension of runtime.ontology.dimension.topographical) {
    const topography = runtime.ontology.topography.findOne(dimension);
    if (!topography) continue;
    // schematicConstraint('unit'topography, runtime);
    // if (topography.relations) relationalConstraints(topography, runtime);
  }

  // existentialConstraints(runtime);
  // tagConstraints(runtime);
  // unitConstraints(runtime); // TODO
  //

  // function unitConstraints(runtime) {
  //   runtime.ontology.constraint.create({
  //     // topology: "runtime",
  //     branch: ["unit"],
  //     traits: ["RELATIONAL"],
  //     predicate: async (unit) => {
  //       if (!(unit instanceof runtime.domain.data.entities.unit))
  //         throw new Error("predicate applies to other than entity type unit");
  //       if (!unit.tags.isInitialized()) await unit.tags.init();
  //       console.log("unit", unit);
  //       // for every key:value in annotation, check that there is the appropriate relation.
  //       // check that there are no other ontological relations besides whats in the annotation.
  //       return issues.map((issue) => {
  //         issue.path.unshift("unit");
  //         issue.context.unit = unit;
  //         return issue;
  //       });
  //     },
  //   });
  // }

  function tagConstraints(runtime) {
    let validator = null;

    runtime.ontology.constraint.create({
      // topology: "runtime",
      branch: ["tag"],
      traits: ["SCHEMATIC"],
      predicate: async (tag) => {
        if (!validator)
          validator = validators.viva.precompiled(runtime.schema.tag);
        const issues = await validator(tag);
        return issues.map((issue) => {
          issue.path.unshift("tag");
          issue.context.tag = tag;
          return issue;
        });
      },
    });
  }

  function schematicConstraint(topography, runtime) {
    let validator = null;
    const schema = runtime.schema.annotations[topography.slug];

    runtime.ontology.constraint.create({
      branch: ["annotation", topography.slug],
      traits: ["SCHEMATIC"],
      predicate: async (annotation) => {
        if (!validator) validator = validators.viva.precompiled(schema);

        const issues = await validator(annotation);
        return issues.map((issue) => {
          issue.path.unshift("annotation");
          issue.context["annotation"] = annotation;
          return issue;
        });
      },
    });
  }

  function existentialConstraints(runtime) {
    runtime.ontology.constraint.create({
      // topology: "runtime",
      branch: ["tag"],
      traits: ["EXISTENTIAL"],
      predicate: async (entity) => {
        const count = await runtime.entities.tag.count(entity);
        if (count > 0) return [];
        const issue = {
          message: "Tag missing",
          path: ["tag"],
          violation: "required",
          context: { tag: entity },
        };
        return [issue];
      },
    });
    runtime.ontology.constraint.create({
      // topology: "runtime",
      branch: ["unit"],
      traits: ["EXISTENTIAL"],
      predicate: async (entity) => {
        const count = await runtime.entities.unit.count(entity);
        if (count > 0) return [];
        const issue = {
          message: "Unit missing",
          violation: "required",
          path: ["unit"],
          context: { unit: entity },
        };
        return [issue];
      },
    });
    runtime.ontology.constraint.create({
      // topology: "runtime",
      branch: ["annotation"],
      traits: ["EXISTENTIAL"],
      predicate: async (annotation) => {
        const issues = [];
        const count = await runtime.entities.unit.count({ annotation });
        if (count < 1)
          issues.push({
            message: "Unit missing",
            violation: "required",
            path: ["unit"],
            context: { unit: { annotation } },
          });

        await Promise.all(
          Object.entries(annotation).map(async ([branch, leaf]) => {
            const data = { ONTOLOGICAL: { branch, leaf } };
            const count = await runtime.entities.tag.count({ data });
            if (count < 1)
              issues.push({
                message: "Tag missing",
                path: ["tag"],
                violation: "required",
                context: { tag: { data } },
              });
          }),
        );
        return issues;
      },
    });
  }

  function relationalConstraints(topography, runtime) {
    runtime.ontology.constraint.create({
      // topology: topography.topology,
      branch: ["unit", topography.slug],
      traits: ["RELATIONAL"],
      predicate: async (unit) => {
        if (!(unit instanceof runtime.domain.data.entities.unit))
          throw new Error("predicate applies to other than entity type unit");

        if (!unit.tags.isInitialized()) await unit.tags.init();
        const relations = unit.tags.map((tag) => tag.data.ONTOLOGICAL);

        const issues = [];
        for (const relation of topography.relations) {
          validators.viva
            .relations(relation, relations) //
            .map((issue) => {
              issue.path = ["unit", "tags"];
              issue.context.unit = unit;
              issues.push(issue);
            });
        }
        return issues;
      },
    });
  }
}

async function install(runtime) {
  const promises = [];
  for (const dimension of runtime.ontology.dimension) {
    for (const category of dimension.descendants) {
      const symbol = {
        data: {
          ONTOLOGICAL: {
            branch: dimension.slug,
            leaf: category.slug,
          },
        },
      };
      const assertion = runtime.assert.symbol(symbol, ["EXISTENTIAL"]);
      promises.push(assertion);
    }
  }
  await Promise.all(promises);
}

export default { install, boot, module, constraints };
