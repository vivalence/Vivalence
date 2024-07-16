import * as pos from "./pos.js";
import * as lemma from "./lemma.js";
import * as verbform from "./verbform.js";
import * as tense from "./tense.js";
import * as mood from "./mood.js";
import * as person from "./person.js";
import * as number from "./number.js";
import * as aspect from "./aspect.js";
import * as gender from "./gender.js";
import * as degree from "./degree.js";
import * as poss from "./poss.js";
import * as reflex from "./reflex.js";
import * as definite from "./definite.js";
import * as prontype from "./prontype.js";
import * as prepcase from "./prepcase.js";
import * as numtype from "./numtype.js";
import * as numform from "./numform.js";
import * as polarity from "./polarity.js";

export const annotations = {};
export const metas = {};

Object.entries({
  pos,
  lemma,
  verbform,
  tense,
  mood,
  person,
  number,
  aspect,
  gender,
  degree,
  poss,
  reflex,
  definite,
  prontype,
  prepcase,
  numtype,
  numform,
  polarity,
}).forEach(([key, value]) => {
  annotations[key] = value[key];
  metas[key] = value.meta;
});

export default annotations;
