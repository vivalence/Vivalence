import adj from "./annotations/adj.js";
import adp from "./annotations/adp.js";
import adv from "./annotations/adv.js";
import cconj from "./annotations/cconj.js";
import det from "./annotations/det.js";
import intj from "./annotations/intj.js";
import noun from "./annotations/noun.js";
import num from "./annotations/num.js";
import pron from "./annotations/pron.js";
import sconj from "./annotations/sconj.js";
import punct from "./annotations/punct.js";
import verb from "./annotations/verb.js";

import { compile } from "./lib.js";

export default () => {
  const annotations = [
    adj,
    adp,
    adv,
    cconj,
    det,
    intj,
    noun,
    num,
    pron,
    sconj,
    punct,
    verb,
  ]
    .map((u) => u()).flat()
    .reduce((units, type) => [...units, ...compile(type)], []);
  return annotations;
};
