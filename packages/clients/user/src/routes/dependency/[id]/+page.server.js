export const load = async ({ params, locals, ...event }) => {
  const { data: tag, error } = await locals.supabase
    .from("Tag")
    .select(`*, runtime:Runtime (*)`)
    .eq("id", params.id)
    .single();

  if (error) console.error(error);

  return { tag };
};
