export default async function connect({ ontology, corpus, games, locals, ...runtime }) {
  await Promise.all([
    locals.supabase
      .from("Runtime")
      .update({ installed: true, ontologyId: ontology.id, corpusId: corpus.id })
      .eq("id", runtime.id),

    locals.supabase
      .from("Game")
      .update({ runtimeId: runtime.id })
      .in(
        "id",
        games.values().map((g) => g.id)
      ),
  ]);
}
