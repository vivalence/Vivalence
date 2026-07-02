import adjective from "./adjective.js";
import adposition from "./adposition.js";
import adverb from "./adverb.js";
import coordinatingConjunction from "./coordinating-conjunction.js";
import determiner from "./determiner.js";
import interjection from "./interjection.js";
import noun from "./noun.js";
import numeral from "./numeral.js";
import particle from "./particle.js";
import pronoun from "./pronoun.js";
import subordinatingConjunction from "./subordinating-conjunction.js";
import * as verb from "./verb/index.js";

export default [
  adjective,
  adposition,
  adverb,
  coordinatingConjunction,
  determiner,
  interjection,
  noun,
  numeral,
  particle,
  pronoun,
  subordinatingConjunction,
  ...Object.values(verb),
].flat();
