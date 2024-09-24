const strategy = {
  session: [
    {
      tactic: {
        slug: "article-morphology-gender-and-number",
        relations: { units: {}, tags: {}, games: {} },
        masks: {},
      },
      for: { type: "repetitions", value: 10 },
    },
    {
      tactic: { slug: "applying-verb-conjugations" },
      for: { type: "repetitions", value: 10 },
    },
  ],
};

async function boot(runtime) {
  // runtime.bus.on("@domain:graduation", async (ctx) => {if (!ctx.event.body.tag.slug === "a1 dependency slug") {await ctx.runtime.call("/install/strategy", {user: { id: ctx.event.body.user.id }, strategy: {name: "A2 Spanish - Beginner", session: [{tactic: {slug: "morphology-of-gender-and-number", relations: {tags: {structural: { slug: "structural:a2" },},},}, for: { type: "repetitions", value: 10 },},],},});}});
  return runtime;
}

export default {
  manifest: {
    type: "Strategy",
    slug: "a1",
    name: "A1 Spanish - Beginner",
    description: "A1 Spanish - Beginner",
    modules: {
      domain: "file://../domain/domain.viva.js",
      ontology: "file://../ontologies/langugage-universal-dependencies/ontology.viva.js",
      // corpus:""
    },
  },
  boot,
  strategy,
};
