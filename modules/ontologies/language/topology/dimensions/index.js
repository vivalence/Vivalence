const moduleNames = [
  "foreign",
  "compound",
  "advtype",
  "inflclass",
  "voice",
  "case",
  "pos",
  "lemma",
  "verbform",
  "suffix",
  "tense",
  "mood",
  "person",
  "nametype",
  "number",
  "aspect",
  "gender",
  "degree",
  "poss",
  "reflex",
  "definite",
  "prontype",
  "prepcase",
  "numtype",
  "numform",
  "polarity",
];

const modules = await Promise.all(
  moduleNames.map((name) =>
    import(`./${name}.js`).then((module) => module.node),
  ),
);

export default modules;

// import { node as pos } from "./pos.js";
// import { node as lemma } from "./lemma.js";
// import { node as verbform } from "./verbform.js";
// import { node as tense } from "./tense.js";
// import { node as mood } from "./mood.js";
// import { node as person } from "./person.js";
// import { node as number } from "./number.js";
// import { node as aspect } from "./aspect.js";
// import { node as gender } from "./gender.js";
// import { node as degree } from "./degree.js";
// import { node as poss } from "./poss.js";
// import { node as reflex } from "./reflex.js";
// import { node as definite } from "./definite.js";
// import { node as prontype } from "./prontype.js";
// import { node as prepcase } from "./prepcase.js";
// import { node as numtype } from "./numtype.js";
// import { node as numform } from "./numform.js";
// import { node as polarity } from "./polarity.js";
// import { node as suffix } from "./suffix.js";
// import { node as caseA } from "./case.js";
// import { node as voice } from "./voice.js";
// import { node as inflclass } from "./inflclass.js";
// import { node as advtype } from "./advtype.js";
// import { node as compound } from "./compound.js";
// import { node as foreign } from "./foreign.js";

// export default [
//   foreign,
//   compound,
//   advtype,
//   inflclass,
//   voice,
//   caseA,
//   pos,
//   lemma,
//   verbform,
//   suffix,
//   tense,
//   mood,
//   person,
//   number,
//   aspect,
//   gender,
//   degree,
//   poss,
//   reflex,
//   definite,
//   prontype,
//   prepcase,
//   numtype,
//   numform,
//   polarity,
// ];
