export const load = async ({ params, locals, ...event }) => {
  const { data: dependency, error } = await locals.supabase
    .from("Dependency")
    .select(`*, runtime:Runtime (*)`)
    .eq("id", params.id)
    .single();
  if (error) console.error(error);
  return { dependency, error };
};
