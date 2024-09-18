export default async function connect({
  ontology,
  corpus,
  domain,
  games,
  strategies,
  tactics,
  locals,
  ...runtime
}) {
  const idfy = (m) => m.values().map((m) => m.id);
  const update = { runtimeId: runtime.id };

  await Promise.all([
    locals.supabase.from("Ontology").update(update).eq("id", ontology.id),
    locals.supabase.from("Corpus").update(update).eq("id", corpus.id),
    locals.supabase.from("Domain").update(update).eq("id", domain.id),
    locals.supabase.from("Game").update(update).in("id", idfy(games)),
    locals.supabase.from("Tactic").update(update).in("id", idfy(tactics)),
  ]);
}
