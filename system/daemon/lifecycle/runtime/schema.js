import { Type } from "@sinclair/typebox";
import { obj } from "@vivalence/shared";

export async function schema(rme) {
  for (const dimension of rme.instance.ontology.dimension.topographical) {
    const topography = rme.instance.ontology.topography.findOne(dimension);
    if (!topography) continue;
    const schema = computeAnnotationSchema(topography, rme.instance);
    rme.instance.schema.annotations[topography.slug] = schema;
    //   rme.instance.schema.annotations[topography.slug] = schema.properties.annotation;
  }
}

function computeAnnotationSchema(topography, runtime) {
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
