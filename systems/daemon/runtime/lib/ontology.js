import { Feature } from "@vivalence/shared/classifier";
import { Type } from "@sinclair/typebox";
import { obj } from "@vivalence/shared";

export async function schema(rme) {
  for (const dimension of rme.instance.ontology.dimension.topographical) {
    const topography = rme.instance.ontology.topography.findOne(dimension);
    if (!topography) continue;
    const schema = annotation(topography, rme.instance);
    rme.instance.schema.annotations[topography.slug] = schema;
    //   rme.instance.schema.annotations[topography.slug] = schema.properties.annotation;
  }
}

function constraint(topography, runtime) {
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

export function constraints(rme) {
  const runtime = rme.instance;

  for (const dimension of runtime.ontology.dimension.topographical) {
    const topography = runtime.ontology.topography.findOne(dimension);
    if (!topography) continue;
    constraint(topography, runtime);
  }

  if (rme.register.domain.lifecycle.constraints)
    rme.register.domain.lifecycle.constraints(rme.instance);
}

function constraintfactory(allConstraints) {
  return (branch) => {
    const branches = [branch];
    if (branch.length > 1) branches.push([branch[0]]);

    const branchConstraints = allConstraints.filter((constraint) =>
      branches.some((branch) => constraint.branch.join() === branch.join()),
    );

    return async (entity, processors) => {
      if (!processors) processors = ["SCHEMATIC", "RELATIONAL"];

      const issues = [];

      const isSchema = (c) => c.traits.includes("SCHEMATIC");
      const relevantConstraints = branchConstraints
        .filter((constraint) =>
          processors.some((processor) =>
            constraint.traits.includes(processor.toUpperCase()),
          ),
        ) // allways do schema first.
        .sort((a, b) => (isSchema(a) ? -1 : isSchema(b) ? 1 : 0));

      for (const constraint of relevantConstraints) {
        (await constraint.test(entity)).map((f) => issues.push(f));
      }

      return issues;
    };
  };
}

export function validation(rme) {
  const runtime = rme.instance;

  const factory = constraintfactory(runtime.ontology.constraint);
  // const v = {//   unit: null, //   symbol: null, //   units: {}, //   annotations: {}, // };
  const validate = runtime.validate;
  validate.entities = {};

  validate.annotation = (annotation, processors = ["SCHEMATIC"]) => {
    // if (!v.annotations[annotation.pos]) console.log("annotation", annotation);
    return factory(["annotation", annotation.pos])(annotation, processors);
  };

  validate.entities.unit = (unit, processors) => {
    // runtime.validate.units[topography.slug] =
    return factory(["unit", unit.annotation.pos])(unit, processors);

    // validate.units[unit.annotation.pos](unit, processors);
  };

  validate.entities.symbol = factory(["symbol"]);

  // v.exists = {
  //   // tag: async (tag) => {const validate = factory(["tag"]); const issues = await validate(tag, ["EXISTENTIAL"]); return issues.length === 0;},
  //   unit: async (unit) => {
  //     const validate = factory(["unit"]);
  //     const issues = await validate(unit, ["EXISTENTIAL"]);
  //     return issues.length === 0;
  //   },
  // };
}
export function classifier(rme) {
  const runtime = rme.instance;
  const ctx = {
    ontology: runtime.ontology,
    schema: runtime.schema,
    validate: runtime.validate,
    assert: runtime.assert,
    services: runtime.services,
    entities: runtime.entities,
  };

  // todo: move to domain
  runtime.classify = runtime.ontology.taxonomist
    .on(Feature, async (feature, ctx) => {
      let issues = await ctx.validate.annotation(
        feature.annotation, //
        ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],
      );

      issues = issues.map((issue) => {
        issue.context.feature = feature;
        return issue;
      });

      issues = await ctx.ontology.remedy.many(issues, { runtime });

      if (issues.length > 0) {
        console.log("[@boot/ontology/classifier.js feature extraction error]");
        // console.log(issues);
        // console.log("/[classifier feature extraction error]");
        return null;
      }

      feature.literal = await ctx.entities.literal //
        .findOne({ annotation: feature.annotation }, { fields: ["id"] });

      return feature;
    })
    .factory(ctx);
}

// assert.unit = async (unit, processors, depth = 0) => {console.log("[assert.unit] depth", depth); if (depth > 5) throw new Error("Assertion max stack reached"); let issues = await runtime.validate.unit(unit, processors); if (issues.length === 0) return issues; issues = await runtime.ontology.remedy.many(issues, { runtime }); if (issues.length > 0) return issues; return await assert.unit(unit, processors, depth++);};

function annotation(topography, runtime) {
  // TODO: validate ontological integrity/coherence;
  const annotation = {
    // ...obj.deepClone(runtime.schema.unit),
    type: "object",
    title: topography.name,
    description: topography.description,
    properties: {},
    required: [],
    allOf: [],
  };

  // console.log(topography);
  const branches = topography.dimensions.filter(({ branch }) => !!branch);
  for (const { branch, required } of branches) {
    const dimension = runtime.ontology.dimension //
      .find((dim) => [dim.slug].join() === branch.join());

    applyDimension(annotation, topography, dimension, required);
  }

  // apply conditional dimensions
  const conditions = topography.dimensions //
    .filter((dimension) => !!dimension.condition)
    .map(({ condition }) => annotation.allOf.push(condition));

  if (annotation.allOf.length === 0) delete annotation.allOf;

  return annotation;
}

function applyDimension(schema, topography, dimension, required = false) {
  schema.properties[dimension.slug] = {
    type: "string",
    title: dimension.name,
    description: dimension.description,
  };

  if (dimension.traits.includes("TOPOGRAPHICAL")) {
    schema.properties[dimension.slug].enum = [topography.slug];
  } else if (dimension.traits.includes("CATEGORICAL")) {
    schema.properties[dimension.slug].enum = //
      dimension.descendants.map(({ slug }) => slug);
  } else if (dimension.traits.includes("FREE")) {
    schema.properties[dimension.slug].type = "string";
  }

  if (required) schema.required.push(dimension.slug);

  return schema;
}

export function asserter(rme) {
  function assert(entityType) {
    return async (entity, processors, depth = 0) => {
      if (depth > 0) console.log(`[assert.entity ${entityType}] depth`, depth);
      if (depth > 5) throw new Error("Assertion max stack reached");
      let issues = await rme.instance.validate.entities[entityType](
        entity,
        processors,
      );
      if (issues.length === 0) return issues;
      issues = await rme.instance.ontology.medic.many(issues, {
        runtime: rme.instance,
      });
      if (issues.length > 0) return issues;
      return await rme.instance.assert[entityType](entity, processors, depth++);
    };
  }

  rme.instance.assert.literal = assert("literal");
  rme.instance.assert.symbol = assert("symbol");
  rme.instance.assert.annotation = assert("annotation");
}

// assertions.existance.tag = async ({ ONTOLOGICAL }) => {
//   const tag = await runtime.entities.tag.findOne({ data: { ONTOLOGICAL } });
//   if (!tag) return await requiredTagIssue({ ONTOLOGICAL }, ontology);
// };
// assertions.existance.unit = async ({ annotation }) => {
//   const issues = assertions.annotation(annotation);
//   if (issues.length > 0)
//     throw new Error("Can only assert valid annotations", annotation);
//   const unit = await runtime.entities.unit.findOne({ annotation });
//   if (!unit) return await requiredUnitIssue({ annotation }, ontology);
// };

// const constraintFilter = (branch) => (constraint) => {const isValidBranch = constraint.branch.join() === branch.join(); const isValidTrait = constraint.traits.includes("SCHEMATIC") || constraint.traits.includes("RELATIONAL"); return isValidBranch && isValidTrait;};
// const requiredTagIssue = async ({ ONTOLOGICAL }, ontology) => {const issue = {message: "Tag missing for ONTOLOGICAL", path: ["tag"], violation: "required", context: { ONTOLOGICAL },}; return await ontology.issues.create(issue);}; const requiredUnitIssue = async ({ annotation }, ontology) => {const issue = {message: "Unit missing for annotation", path: ["unit"], violation: "required", context: { annotation },}; return await ontology.issues.create(issue);};
// const missingAsserterIssue = async ({ unit, annotation }, ontology) => {throw new Error("Missing Asserter: No asserter found"); const context = {}; const message = `Missing Asserter: No asserter found for`; if (annotation) {context.annotation = annotation; message += ` annotation.pos ${annotation.pos}`;} if (unit) {context.unit = unit; message += ` unit.pos ${unit.annotation.pos}`;} const issue = { message, violation: "missing", path: ["asserter"], context }; return await ontology.issues.create(issue);};
