export const load = async ({ params, locals, ...event }) => {
  const { data: game, error } = await locals.supabase
    .from("Game")
    .select(`*, runtime:Runtime (*)`)
    .eq("id", params.id)
    .single();
  if (error) console.error(error);
  return { game, error };
};
