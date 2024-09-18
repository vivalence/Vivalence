export const load = async ({ params, locals, ...event }) => {
  const { data: strategy, error } = await locals.supabase
    .from("Strategy")
    .select(`*, runtime:Runtime (*)`)
    .eq("id", params.id)
    .single();

  if (error) console.error(error);

  strategy.session = await Promise.all(
    strategy.session.map(async (session) => {
      if (session.tactic) {
        const { data: tactic, error } = await locals.supabase
          .from("Tactic")
          .select("id, slug, name, description")
          .eq("id", session.tactic.id)
          .single();

        if (error) console.error(error);

        session.tactic = tactic;
      }
      return session;
    }),
  );

  return { strategy };
};
