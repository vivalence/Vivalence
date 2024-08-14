export default async function (body, ctx) {
  const { strategy, user } = body;
  for (const session of strategy.session) {
    if (session.tactic) {
      const tactic = await ctx.call("/tactic/fromSlug", session.tactic);
      session.tactic.id = tactic.id;
    }
  }

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Strategy")
    .insert({
      runtimeId: ctx.runtime.manifest.id,
      userId: user.id,
      ...strategy,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

// strategy: {
//   name: "A1 Spanish - Beginner",
//   session: [
//     {
//       tactic: {
//         slug: "morphology-of-gender-and-number",
//         relations: {
//           tags: {
//             structural: { slug: "structural:a1" },
//           },
//         },
//       },
//       for: { type: "repetitions", value: 10 },
//     },
//   ],
// },
