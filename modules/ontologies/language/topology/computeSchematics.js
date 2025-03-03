import { obj } from "@vivalence/shared";

export default function (ontology) {
  const topographies = ontology.annotations.filter((a) => a.traits.includes("TOPOGRAPHICAL"));
  const entitySchema = ontology.constraints.find((c) => c.traits.includes("SCHEMATIC"));

  for (const entityType of ["unit"]) {
    for (const { data } of topographies) {
      for (let { slug } of data["CATEGORICAL"]) {
        const topography = ontology.topographies.find((t) => slug === t.slug);
        if (!topography) continue;

        ontology.constraints.create({
          topology: topography.topology,
          branch: [entityType, slug],
          traits: ["SCHEMATIC"],
          data: {
            SCHEMATIC: computeSchematic(
              entitySchema.data.SCHEMATIC,
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
    .map(({ branch, required }) => [
      annotations.find((a) => [a.slug].join() === branch.join()),
      required,
    ])
    .reduce(
      (schema, [annotation, required]) => schematicAnnotation(annotation, schema, required),
      SCHEMATIC.properties.annotation,
    );

  return SCHEMATIC;
}

function schematicAnnotation(annotation, schema, required = false) {
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
