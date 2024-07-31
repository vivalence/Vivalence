async function createStrategyForUser(user, runtime) {
  await runtime.locals.supabase.from("Strategy").insert({
    runtimeId: runtime.id,
    userId: user.id,
    name: "A1 Spanish - Beginner",
    session: [
      {
        tactic: { slug: "intro-morphology-of-gender-and-number" },
        for: { type: "repetitions", value: 10 },
      },
    ],
  });
}

async function boot(runtime) {

  runtime.bus.on("@corpus/graduation",(ctx) => {
  await runtime.locals.supabase.from("Strategy").update({
    name: "A2 Spanish - Beginner",
    session: [
      {tactic: { slug: "intermediate-morphology-of-gender-and-number" }, for: { type: "repetitions", value: 10 },},
    ],
  })
      .eq("userId", ctx.event.userId)
    .eq("runtimeId", ctx.event.runtimeId);
  })
  // install hooks that
  // 1: assigns this strategy to a user on corpus join.
  // 2: moves to dfferent session on graduation event.
  return runtime;
}

async function install(runtime) {
  // insert the tactics into the db
  return runtime;
}
