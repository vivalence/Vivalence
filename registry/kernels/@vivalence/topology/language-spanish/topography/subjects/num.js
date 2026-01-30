export default {
  slug: "num",
  name: "Number",
  description:
    "Numbers are words that denote a quantity. They can be cardinal, ordinal, multiplicative, or fractional.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["numtype"], required: true },
    { branch: ["gender"] },
    { branch: ["number"] },
    { branch: ["numform"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "num" } },
    { unique: { branch: "gender" } },
    { unique: { branch: "number" } },
    { unique: { branch: "numtype" } },
    { unique: { branch: "numform" } },
  ],
};
