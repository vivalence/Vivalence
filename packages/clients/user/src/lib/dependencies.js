import { validator } from "@vivalence/shared";

export default async function (tag, ctx) {
  // console.log(ctx.runtime.manifest);
  const conditions = tag.data.DEPENDENCY.conditions;
  await Promise.all(
    conditions.map(async (condition) => {
      const isMet = await isConditionMet(condition, ctx);
      return isMet;
    }),
  );
}

const SubjectResolvers = {
  "TAG[DEPENDENCY]": async (subject, ctx) => {
    // return tag;
  },
  "TAG[COMPLETABLE]": async (subject, ctx) => {
    // return tag;
  },
  "TAG[LEARNABLE]": async (subject, ctx) => {
    // i could also search for the memory directly.

    let query = ctx.runtime.locals.supabase
      .from("Tag")
      .select("*, memory:Memory(id,status,unitId)")
      .eq("runtimeId", ctx.runtime.manifest.id);

    if (subject.id) query = query.eq("id", subject.id);
    if (subject.slug) query = query.eq("slug", subject.slug);

    const { data: tag, error } = await query.single();
    if (error) throw error;
    tag.memory = tag.memory.find((memory) => !memory.unitId);
    return tag;
  },
};
const ConditionResolvers = {
  LOGIC: (condition) => (data) => validator.logic(condition, data),
};

async function isConditionMet({ solver, subject, condition }, ctx) {
  const data = await SubjectResolvers[solver.subject](subject, ctx);
  const rule = await ConditionResolvers[solver.condition](condition, ctx);
  return rule(data);
}
