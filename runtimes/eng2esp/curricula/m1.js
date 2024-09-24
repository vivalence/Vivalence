async function install(runtime) {
  const units = [];
  for (const unit of units) {
    const installed = await runtime.call("/install/unit", { unit });
  }
}

const Corpus = {
  manifest: {
    type: "Corpus",
    slug: "nounForm",
    name: "",
  },
  install,
  // schema: (s) => s,
  // boot: (r) => r,
};

const modules = {
  corpora: [Corpus],
  games: [
    await import("@vivalence/games/prose/prose.viva.js"),
    // await import("@vivalence/games/flashcards/flashcards.viva.js"),
    // await import("@vivalence/games/translations/translations.viva.js"),
  ],
  // tactics: [],
  // strategies: [],
};

export { modules };
