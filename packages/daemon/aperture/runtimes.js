export default async function runtimes(aperture) {
  aperture.router.route("/runtimes/all", async (input, ctx) => {
    const user = await ctx.services.identity.getUser();

    const { data, error } = await ctx.services.supabase
      .from("Runtime")
      .select(
        `id,slug,name,installed,icon,
	corpora: Corpus(id,slug,name,installed,icon)`,
      )
      .eq("installed", true);
    if (error) throw error;

    return data;
  });

  return aperture;
}

// domain: Domain!inner(id,slug,name,installed),
// ontology: Ontology!inner(id,slug,name,installed),
// games: Game(id,slug,name,installed),
// tactics: Tactic(id,slug,name,installed),

// dependencies: Dependency(id,slug,name,available,satisfied,
// 	conditions: _Condition(condition:Condition(id,name,met)),
// 	preconditions: _Precondition(condition:Condition(id,name,met))
// )

// export default async function runtimes(aperture) {
//   const router = aperture.router.create();
//   // aperture.router.use("/runtimes", ...router.middleware, router.routes(), router.allowedMethods(),);
//   return aperture;
// }
