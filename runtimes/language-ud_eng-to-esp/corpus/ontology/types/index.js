import * as noun from "./noun.js";
import * as verb from "./verb.js";
import * as adj from "./adj.js";
import * as adp from "./adp.js";
import * as adv from "./adv.js";
import * as cconj from "./cconj.js";
import * as det from "./det.js";
import * as intj from "./intj.js";
import * as num from "./num.js";
import * as pron from "./pron.js";
import * as sconj from "./sconj.js";
import * as punct from "./punct.js";
import * as aux from "./aux.js";

export const units = {
  verb,
  aux,
  noun,
  propn: noun,
  adj,
  punct,
  adp,
  adv,
  cconj,
  det,
  intj,
  num,
  pron,
  sconj,
};

export default units;
