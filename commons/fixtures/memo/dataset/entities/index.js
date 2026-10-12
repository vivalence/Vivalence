import { symbols } from "./symbols.js";
import { words } from "./words.js";
import { sentences } from "./sentences.js";
import { vocalize, depict, lemmasOf } from "./build.js";

const VOCALIZED = [
  "in-principio-erat-verbum",
  "amor-omnia-vincit",
  "veni-vidi-vici",
  "carpe-diem",
  "tempus-fugit",
  "cogito-ergo-sum",
  "vox-populi-vox-dei",
  "ave-maria-gratia-plena",
  "alea-iacta-est",
  "si-vis-pacem-para-bellum",
];

const DEPICTED = [
  "gladius.noun",
  "aquila.noun",
  "templum.noun",
  "corona.noun",
  "amphora.noun",
  "columna.noun",
  "crux.noun",
  "lupus.noun",
  "denarius.noun",
  "liber.noun",
];

const decorate = (literal) => {
  if (VOCALIZED.includes(literal.slug)) return vocalize(literal, `audio/${literal.slug}.wav`);
  if (DEPICTED.includes(literal.slug)) return depict(literal, `images/${literal.slug}.png`);
  return literal;
};

const literal = [...words, ...sentences].map(decorate);
const symbol = [...symbols, ...lemmasOf(literal)];

export const entities = { symbol, literal };
