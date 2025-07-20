import completables from "./completables.js";
import learnables from "./learnables.js";
import lemmas from "./lemmas.js";
import structural from "./structural.js";
import lemmaset from "../lemmas.js";

export default [
  ...completables,
  ...learnables,
  ...lemmas.filter((lemma) => lemmaset.includes(lemma.data.ONTOLOGICAL.leaf)),
  ...structural,
];
