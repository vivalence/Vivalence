async function findAnnotation(annotation, runtime) {
  let query = runtime.locals.supabase.from("Unit").select(`*`);

  for (const key of Object.keys(annotation)) {
    query = query.eq(`annotation->>${key}`, annotation[key]);
  }

  const { data: duplicates, error } = await query;
  if (error) throw error;

  return duplicates;
}

export default async function ({ annotation }, ctx) {
  let units = await findAnnotation(annotation, ctx.runtime);

  units = units.filter((unit) => {
    const unitAnnotationKeys = Object.keys(unit.annotation);
    const givenAnnotationKeys = Object.keys(annotation);

    // Check if both annotations have the same number of keys
    if (unitAnnotationKeys.length !== givenAnnotationKeys.length) {
      return false;
    }

    // Check equality in both directions
    const unitToGivenCheck = unitAnnotationKeys.every(
      (key) => annotation[key] === unit.annotation[key]
    );
    const givenToUnitCheck = givenAnnotationKeys.every(
      (key) => unit.annotation[key] === annotation[key]
    );

    return unitToGivenCheck && givenToUnitCheck;
  });

  // If there's more than one unit after filtering, we have duplicates
  return units.length > 1
    ? {
        isValid: false,
        issues: [
          {
            message: `Found multiple units with exactly matching annotations.`,
            path: ["annotation"],
            violation: "duplication",
            context: {
              annotation: annotation,
              units: units,
            },
          },
        ],
      }
    : { isValid: true, issues: [] };
}
