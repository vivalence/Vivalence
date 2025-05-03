import { obj } from "@vivalence/shared";

export default function schematics(ontology) {
  const topographies = ontology.annotations.filter((a) =>
    a.traits.includes("TOPOGRAPHICAL"),
  );
  const entitySchematic = ontology.constraints.find((c) =>
    c.traits.includes("SCHEMATIC"),
  );

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
      (schema, [annotation, required]) =>
        branchAnnotation(annotation, schema, required),
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
    schema.properties[annotation.slug].enum = annotation.data.CATEGORICAL.map(
      ({ slug }) => slug,
    );
  } else if (annotation.traits.includes("FREE")) {
    schema.properties[annotation.slug].type = "string";
  }

  if (required) schema.required.push(annotation.slug);

  return schema;
}
