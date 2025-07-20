import { obj } from "@vivalence/shared";

export default function schemaFactory(runtime) {
  computeAnnotationSchema(runtime);

  // TODO: compute a generic annotation and unit schema for schema.[root]
  for (const dimension of runtime.ontology.dimension.topographical) {
    const topography = runtime.ontology.topography.findOne(dimension);
    if (!topography) continue;

    const schema = computeTopographySchema(topography, runtime);
    runtime.schema.annotations[topography.slug] = schema.properties.annotation;
    runtime.schema.units[topography.slug] = schema;
  }
  // console.log(JSON.stringify(runtime.schema.annotations));

  return runtime;
}
function computeAnnotationSchema(runtime) {
  const schema = {
    ...obj.deepClone(runtime.schema.annotation),
    additionalProperties: false,
  };

  for (const dimension of runtime.ontology.dimension) {
    const dimSchema = {
      title: dimension.name,
      description: dimension.description,
      type: "string",
    };

    if (dimension.traits.includes("CATEGORICAL")) {
      const categories = dimension.descendants;

      dimSchema.enum = categories.map(({ slug }) => slug);

      const descriptions = categories
        .map((category) => Object.values(category))
        .map(
          ([slug, name, description]) => `${slug} (${name}, ${description})`,
        );
      dimSchema.description += ` Values: [${descriptions.join(", ")}]`;
    }

    if (dimension.traits.includes("TOPOGRAPHICAL")) {
      const categories = dimension.descendants;
      dimSchema.description += ` This is a topographical dimension, thus it functions as the primary key for the rest of the annotation.`;
    }

    schema.properties[dimension.slug] = dimSchema;
  }

  runtime.schema.annotation = schema;
}

function computeTopographySchema(topography, runtime) {
  // TODO: validate ontological integrity/coherence;
  const schema = {
    ...obj.deepClone(runtime.schema.unit),
    title: topography.name,
    description: topography.description,
  };

  const branches = topography.dimensions.filter(({ branch }) => !!branch);
  for (const { branch, required } of branches) {
    const dimension = runtime.ontology.dimension //
      .find((dim) => [dim.slug].join() === branch.join());

    applyDimension(schema.properties.annotation, dimension, required);
  }

  // apply conditional dimensions
  const conditions = topography.dimensions //
    .filter((dimension) => !!dimension.condition)
    .map(({ condition }) => schema.properties.annotation.allOf.push(condition));

  if (schema.properties.annotation.allOf.length === 0)
    delete schema.properties.annotation.allOf;

  return schema;
}

function applyDimension(schema, dimension, required = false) {
  // TODO: implement annotation schema as root.
  schema.properties[dimension.slug] = {
    title: dimension.name,
    description: dimension.description,
  };

  if (dimension.traits.includes("CATEGORICAL")) {
    schema.properties[dimension.slug].type = "string";
    schema.properties[dimension.slug].enum = //
      dimension.descendants.map(({ slug }) => slug);
  } else if (dimension.traits.includes("FREE")) {
    schema.properties[dimension.slug].type = "string";
  }

  if (required) schema.required.push(dimension.slug);

  return schema;
}
