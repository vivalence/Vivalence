import { obj } from "@vivalence/shared";

export default function schematics(runtime) {
  return (ontology) => {
    ontology.schema = {
      units: {},
      annotations: {},
    };

    const topographicalDims = ontology.dimensions //
      .filter((a) => a.traits.includes("TOPOGRAPHICAL"));
    const entitySchematic = ontology.constraints //
      .find((c) => c.traits.includes("SCHEMATIC"));

    for (const { data } of topographicalDims) {
      for (let { slug } of data["CATEGORICAL"]) {
        const topography = ontology.topographies.find((t) => slug === t.slug);
        if (!topography) continue;

        const schema = computeSchema(
          entitySchematic.data.SCHEMATIC,
          topography,
          ontology.dimensions,
        );

        // TODO: reduce to single source of truth. maybe schema can be a getter.
        ontology.schema.annotations[slug] = schema.properties.annotation;
        ontology.constraints.create({
          topology: topography.topology,
          branch: ["annotation", slug],
          traits: ["SCHEMATIC"],
          data: { SCHEMATIC: schema.properties.annotation },
        });

        ontology.schema.units[slug] = schema;
        ontology.constraints.create({
          topology: topography.topology,
          branch: ["unit", slug],
          traits: ["SCHEMATIC"],
          data: { SCHEMATIC: schema },
        });
      }
    }

    return ontology.schema;
  };
}

// TODO: validate ontological integrity;
function computeSchema(rootSchema, topography, dimensions) {
  const schema = {
    ...obj.deepClone(rootSchema),
    title: topography.name,
    description: topography.description,
  };

  // resolve annotation schema from topographical dimensions
  const branches = topography.dimensions.filter(({ branch }) => !!branch);
  for (const { branch, required } of branches) {
    const dimension = dimensions //
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
  schema.properties[dimension.slug] = {
    title: dimension.name,
    description: dimension.description,
  };

  if (dimension.traits.includes("CATEGORICAL")) {
    schema.properties[dimension.slug].type = "string";
    schema.properties[dimension.slug].enum = //
      dimension.data.CATEGORICAL.map(({ slug }) => slug);
  } else if (dimension.traits.includes("FREE")) {
    schema.properties[dimension.slug].type = "string";
  }

  if (required) schema.required.push(dimension.slug);

  return schema;
}
