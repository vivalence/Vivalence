const modules = {
  corpora: [await import("./corpus.viva.js")],
  games: [
    await import("@vivalence/games/prose/prose.viva.js"),
    await import("@vivalence/games/translations/translations.viva.js"),
    // await import("@vivalence/games/flashcards/flashcards.viva.js"),
  ],
  tactics: [await import("./tactic.viva.js")],
  // strategies: [],
};

export { modules };
