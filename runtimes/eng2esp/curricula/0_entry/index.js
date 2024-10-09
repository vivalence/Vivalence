const modules = {
  // what
  corpora: [await import("./corpus.viva.js")],
  // how
  tactics: [await import("./tactics/ontological-branch-introduction/tactic.viva.js")],
};

export default modules;
