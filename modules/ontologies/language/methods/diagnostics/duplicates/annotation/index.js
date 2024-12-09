export default async function ({ unit }, ctx) {
  const { annotation } = unit;
  const units = await findAnnotation(annotation, ctx);

  const duplicates = units.filter((unit) => findDuplicates({ unit, annotation }));

  const issues = [];
  if (duplicates.length > 1) {
    issues.push({
      message: `Found multiple units with exactly matching annotations.`,
      path: ["unit", "annotation"],
      violation: "duplication",
      context: {
        annotation: annotation,
        units: units,
      },
    });
  }
  return issues;
}

async function findAnnotation(annotation, ctx) {
  let query = ctx.runtime.services.supabase
    .from("Unit")
    .select(`*`)
    .eq("runtimeId", ctx.runtime.manifest.id);

  for (const key of Object.keys(annotation)) {
    query = query.eq(`annotation->>${key}`, annotation[key]);
  }

  const { data: duplicates, error } = await query;
  if (error) throw error;

  return duplicates;
}

async function findDuplicates({ unit, annotation }) {
  const unitAnnotationKeys = Object.keys(unit.annotation);
  const givenAnnotationKeys = Object.keys(annotation);

  // Check if both annotations have the same number of keys
  if (unitAnnotationKeys.length !== givenAnnotationKeys.length) {
    return false;
  }

  // Check equality in both directions
  const unitToGivenCheck = unitAnnotationKeys.every(
    (key) => annotation[key] === unit.annotation[key],
  );
  const givenToUnitCheck = givenAnnotationKeys.every(
    (key) => unit.annotation[key] === annotation[key],
  );

  return unitToGivenCheck && givenToUnitCheck;
}
