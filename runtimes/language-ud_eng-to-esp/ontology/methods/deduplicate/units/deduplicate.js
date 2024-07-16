export default async function (unit, { supabase, validate }) {
  const issues = [];
  const { annotation } = unit.data;

  let query = supabase.from("Unit").select(`*`).neq("id", unit.id);

  for (const key of Object.keys(annotation)) {
    query = query.eq(`data->annotation->>${key}`, annotation[key]);
  }

  const { data: duplicates, error } = await query;
  if (error) throw error;

  duplicates.forEach((duplicateUnit) => {
    console.log("unit annotation:");
    console.log(annotation);
    console.log("duplicate annotation:");
    console.log(duplicateUnit.data.annotation);
    if (
      Object.keys(duplicateUnit.data.annotation).every(
        (key) => duplicateUnit.data.annotation[key] === annotation[key],
      )
    ) {
      issues.push({
        message: `unit with id: ${imposterUnit.id} is a duplicate of unit with id: ${id}`,
        path: ["unit"],
        violation: "forbidden",
        context: { unit: duplicateUnit, original: unit },
      });
    }
  });
  console.log("duplicates:", duplicates.length);
  console.log("issues:", issues.length);

  return { isValid: issues.length === 0, issues };
}
