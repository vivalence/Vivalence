export const load = async ({ params, locals, ...event }) => {
  const { data: strategy, error } = await locals.supabase
    .from("Strategy")
    .select(`*, runtime:Runtime (*)`)
    .eq("id", params.id)
    .single();

  if (error) console.error(error);

  return { strategy };
};
