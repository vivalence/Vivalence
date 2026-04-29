import sconj from "./sconj.js";
import adv from "./adv.js";
import verb from "./verb.js";
import noun from "./noun.js";
import adj from "./adj.js";
import intj from "./intj.js";
import adp from "./adp.js";
import pron from "./pron.js";
import aux from "./aux.js";
import cconj from "./cconj.js";
import num from "./num.js";
import det from "./det.js";
import punct from "./punct.js";
import propn from "./propn.js";
import lemmaset from "../lemmas.js";

const index = 1000;

const verbfilter = (unit) => {
  if (!lemmaset.includes(unit.annotation.lemma)) return;
  // if (["inf"].includes(unit.annotation.verbform)) {return unit.index && unit.index < index;}
  if (["fin"].includes(unit.annotation.verbform)) {
    return (
      ["ind"].includes(unit.annotation.mood) && //
      ["imp", "perf"].includes(unit.annotation.aspect) && //
      ["pres", "fut", "past", "imp"].includes(unit.annotation.tense)
    );
  }
  return false;
};

const indexfilter = (unit) => {
  return unit.index && unit.index < index;
};

export default [
  //
  sconj,
  adv,
  verb.filter(verbfilter),
  aux.filter(verbfilter),
  noun.filter(indexfilter),
  adj.filter(indexfilter),
  intj,
  adp,
  pron,
  cconj,
  num,
  det,
  punct,
  propn,
].flat();
