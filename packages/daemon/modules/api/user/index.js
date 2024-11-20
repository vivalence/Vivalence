export default async function user(api) {
  api.router.route("/user/runtimes/view", async (input, ctx) => {
    const user = await ctx.api.locals.getUser();

    const { data, error } = await ctx.api.locals.supabase
      .from("Runtime")
      .select(
        `id,slug,name,installed,icon,
	corpora: Corpus(id,slug,name,installed,icon)`,
      )
      .eq("installed", true);
    if (error) throw error;

    return data;
  });

  return api;
}

// domain: Domain!inner(id,slug,name,installed),
// ontology: Ontology!inner(id,slug,name,installed),
// games: Game(id,slug,name,installed),
// tactics: Tactic(id,slug,name,installed),

// dependencies: Dependency(id,slug,name,available,satisfied,
// 	conditions: _Condition(condition:Condition(id,name,met)),
// 	preconditions: _Precondition(condition:Condition(id,name,met))
// )
