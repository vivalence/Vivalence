export default async function ({ unit }, ctx) {
  const { annotation } = unit.data;
  if (!["pron", "det"].includes(annotation.pos)) {
    return {
      isValid: false,
      message: "Unit deduplication not implemented for pos: " + annotation.pos,
    };
  }

  let query = ctx.locals.supabase.from("Unit").select(`*`).neq("id", unit.id);
  for (const key of Object.keys(annotation)) {
    query = query.eq(`data->annotation->>${key}`, annotation[key]);
  }
  const { data: duplicates, error } = await query;
  if (error) throw error;

  const issues = duplicates.reduce((issues, duplicate) => {
    const isDuplicate = Object.keys(duplicate.data.annotation).every(
      (key) => duplicate.data.annotation[key] === annotation[key],
    );
    if (isDuplicate) {
      issues.push({
        message: `unit with id: ${imposterUnit.id} is a duplicate of unit with id: ${id}`,
        path: ["unit"],
        violation: "forbidden",
        context: { unit: duplicate, original: unit },
      });
    }
    return issues;
  }, []);

  return { isValid: issues.length === 0, issues };
}
