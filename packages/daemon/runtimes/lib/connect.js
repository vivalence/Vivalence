export default async function connect({ ontology, corpus, domain, games, locals, ...runtime }) {
  await Promise.all([
    locals.supabase
      .from("Ontology")
      .update({ installed: true, runtimeId: runtime.id })
      .eq("id", ontology.id),
    locals.supabase
      .from("Corpus")
      .update({ installed: true, runtimeId: runtime.id })
      .eq("id", corpus.id),
    locals.supabase
      .from("Domain")
      .update({ installed: true, runtimeId: runtime.id })
      .eq("id", domain.id),
    locals.supabase
      .from("Game")
      .update({ runtimeId: runtime.id })
      .in(
        "id",
        games.values().map((g) => g.id)
      ),
    locals.supabase.from("Runtime").update({ installed: true }).eq("id", runtime.id),
  ]);
}
