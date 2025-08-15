// Complete Latin Topographies - Universal Dependencies Based
// Each topography captures the essential grammatical requirements for Latin morphosyntax
// Organized by grammatical complexity: Core Inflected → Functional → Structural

// =============================================================================
// CORE INFLECTED TOPOGRAPHIES
// These carry the primary grammatical load in Latin through systematic inflection
// =============================================================================
import sentence from "./sentence.js";

const noun = {
  manifest: {
    slug: "noun",
    name: "Noun",
    description:
      "A word referring to persons, places, things, or concepts. Latin nouns inflect for case, gender, and number through systematic declension patterns.",
  },
  dimensions: [
    // { branch: ["pos"], required: true },
    { branch: ["pos", "noun"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["case"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
    { branch: ["inflclass"], required: false },
  ],
  // relations: [
  constraints: [
    { unique: { branch: "pos" } }, // @beef should be: every topographical instance requires one of dimension with branch trait TOPOGRAPHICAL
    { required: { branch: "pos", leaf: "noun" } }, // this is the de facto topographical identity
    { required: { branch: "case" } }, // every required dimension needs to be present as a relationship
    { required: { branch: "gender" } },
    { required: { branch: "number" } },
  ],
};

const verb = {
  slug: "verb",
  name: "Verb",
  description:
    "A word expressing actions, states, or processes. Latin verbs show complex inflection for person, number, tense, mood, voice, and aspect.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["verbform"], required: true }, // Finite vs. infinitive vs. participle
    { branch: ["voice"], required: true }, // Active/passive distinction always relevant
    { branch: ["aspect"], required: false }, // Imperfective/perfective/prospective
    { branch: ["tense"], required: false }, // Only for finite forms
    { branch: ["mood"], required: false }, // Only for finite forms
    { branch: ["person"], required: false }, // Only for finite forms
    { branch: ["number"], required: false }, // Only for finite forms
    { branch: ["inflclass"], required: false }, // Conjugation pattern (1st, 2nd, 3rd, 4th)
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "verb" } },
    { required: { branch: "verbform" } },
    { required: { branch: "voice" } }, // Voice is always grammatically relevant
    // Conditional requirements: finite verbs need full inflectional marking
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "fin" } },
        then: [
          { required: { branch: "tense" } },
          { required: { branch: "mood" } },
          { required: { branch: "person" } },
          { required: { branch: "number" } },
        ],
      },
    },
  ],
};

const adj = {
  slug: "adj",
  name: "Adjective",
  description:
    "A word modifying nouns by describing qualities or attributes. Latin adjectives must agree with their nouns in case, gender, and number.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["case"], required: true }, // Must match the noun it modifies
    { branch: ["gender"], required: true }, // Must match the noun it modifies
    { branch: ["number"], required: true }, // Must match the noun it modifies
    { branch: ["degree"], required: false }, // Positive/comparative/superlative
    { branch: ["inflclass"], required: false }, // Adjectival declension pattern
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adj" } },
    { required: { branch: "case" } }, // Agreement is mandatory, not optional
    { required: { branch: "gender" } }, // Gender agreement is systematic
    { required: { branch: "number" } }, // Number agreement is systematic
  ],
};

const pron = {
  slug: "pron",
  name: "Pronoun",
  description:
    "A word substituting for nouns or referring to participants in discourse. Latin pronouns inflect for case, number, and often gender and person.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"], required: true }, // Personal/demonstrative/relative/interrogative
    { branch: ["case"], required: true }, // All pronouns inflect for case
    { branch: ["person"], required: false }, // All pronouns show person // error when gender neutral on "quis (quid)"
    { branch: ["gender"], required: false }, // Not all pronoun types have gender
    { branch: ["reflex"], required: false }, // Only reflexive pronouns need this
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "pron" } },
    { required: { branch: "prontype" } }, // Type determines other requirements
    { required: { branch: "case" } }, // Case inflection is universal
    // { required: { branch: "person" } }, // Personal pronouns need person marking
  ],
};

const det = {
  slug: "det",
  name: "Determiner",
  description:
    "A word that introduces and specifies nouns. Latin determiners agree with their nouns in case, gender, and number.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"], required: true }, // Article/demonstrative/quantifier type
    { branch: ["case"], required: true }, // Must agree with the noun
    { branch: ["gender"], required: true }, // Must agree with the noun
    { branch: ["number"], required: true }, // Must agree with the noun
    { branch: ["numtype"], required: false }, // For quantifying determiners
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "det" } },
    { required: { branch: "prontype" } }, // Determines the determiner's function
    { required: { branch: "case" } }, // Agreement is obligatory
    { required: { branch: "gender" } }, // Gender agreement is systematic
    { required: { branch: "number" } }, // Number agreement is systematic
  ],
};

const aux = {
  slug: "aux",
  name: "Auxiliary",
  description:
    "A helping verb used to form compound tenses, passive voice, or periphrastic constructions. Inflects like main verbs.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["verbform"], required: true }, // Finite/infinitive/participle
    { branch: ["tense"], required: false }, // Only for finite forms
    { branch: ["mood"], required: false }, // Only for finite forms
    { branch: ["person"], required: false }, // Only for finite forms
    { branch: ["number"], required: false }, // Only for finite forms
    { branch: ["aspect"], required: false }, // Aspectual distinctions
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "aux" } },
    { required: { branch: "verbform" } },
    // Finite auxiliaries need full inflection like main verbs
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "fin" } },
        then: [
          { required: { branch: "tense" } },
          { required: { branch: "mood" } },
          { required: { branch: "person" } },
          { required: { branch: "number" } },
        ],
      },
    },
  ],
};

// =============================================================================
// FUNCTIONAL TOPOGRAPHIES
// Important for syntax but with less morphological complexity
// =============================================================================

const adp = {
  slug: "adp",
  name: "Adposition",
  description:
    "A word showing spatial, temporal, or abstract relationships. Latin prepositions govern specific cases of their objects.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    // Prepositions are generally invariant but may have compound marking
    { branch: ["compound"], required: false },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adp" } },
  ],
};

const adv = {
  slug: "adv",
  name: "Adverb",
  description:
    "A word modifying verbs, adjectives, other adverbs, or entire clauses. May show degree distinctions.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["degree"], required: false }, // Positive/comparative/superlative
    { branch: ["advtype"], required: false }, // Locative/temporal classification
    { branch: ["polarity"], required: false }, // For negative adverbs
    { branch: ["compound"], required: false }, // For morphologically complex adverbs
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adv" } },
  ],
};

const num = {
  slug: "num",
  name: "Numeral",
  description:
    "A word expressing number or quantity. Latin numerals inflect for case agreement with the nouns they modify.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["numtype"], required: true }, // Cardinal/ordinal/distributive
    { branch: ["case"], required: false }, // Many numerals inflect for case
    { branch: ["gender"], required: false }, // Some numerals show gender agreement
    { branch: ["number"], required: false }, // Some numerals have plural forms
    { branch: ["numform"], required: false }, // Word/digit/roman representation
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "num" } },
    { required: { branch: "numtype" } }, // Type determines inflectional behavior
  ],
};

const propn = {
  slug: "propn",
  name: "Proper Noun",
  description:
    "A word naming specific persons, places, or entities. Inflects like common nouns but may have special name type marking.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["case"], required: true }, // Proper nouns inflect like common nouns
    { branch: ["gender"], required: true }, // Inherent gender affects agreement
    { branch: ["number"], required: true }, // Usually singular but not always
    { branch: ["nametype"], required: false }, // Personal/geographic/literary classification
    { branch: ["foreign"], required: false }, // For borrowed names (especially Greek)
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "propn" } },
    { required: { branch: "case" } }, // Case inflection is systematic
    { required: { branch: "gender" } }, // Gender drives agreement patterns
    { required: { branch: "number" } }, // Number marking is consistent
  ],
};

// =============================================================================
// STRUCTURAL TOPOGRAPHIES
// Provide syntactic framework but carry minimal grammatical information
// =============================================================================

const cconj = {
  slug: "cconj",
  name: "Coordinating Conjunction",
  description:
    "A word connecting elements of equal syntactic status. Generally invariant in Latin.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    // Conjunctions may be morphologically complex but don't inflect
    { branch: ["compound"], required: false },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "cconj" } },
  ],
};

const sconj = {
  slug: "sconj",
  name: "Subordinating Conjunction",
  description:
    "A word introducing dependent clauses. Generally invariant but may have pronominal origins.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["compound"], required: false }, // Many subordinators are compound
    { branch: ["prontype"], required: false }, // Some have pronominal characteristics
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "sconj" } },
  ],
};

const part = {
  slug: "part",
  name: "Particle",
  description:
    "A function word that doesn't fit other categories. Includes negation, emphasis, and discourse markers.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["polarity"], required: false }, // For negative particles like 'non'
    { branch: ["compound"], required: false }, // Some particles are morphologically complex
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "part" } },
  ],
};

const punct = {
  slug: "punct",
  name: "Punctuation",
  description:
    "Orthographic symbols marking sentence structure and prosody. No grammatical features in Latin.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    // Punctuation carries no grammatical information
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "punct" } },
  ],
};

export default [
  sentence,
  // Core inflected classes - these drive Latin's grammatical system
  noun, // Foundation: establishes case relationships
  verb, // Action center: complex morphology with voice/mood/tense
  adj, // Modifier: must agree with nouns in all categories
  pron, // Reference: complex person/case/gender interactions
  det, // Specification: agrees with nouns like adjectives
  aux, // Helper: inflects like main verbs but with syntactic differences

  // Functional classes - participate in grammar but less morphologically dense
  adp, // Relationship: governs case of noun phrases
  adv, // Modification: may show degree but generally invariant
  num, // Quantity: selective case agreement based on function
  propn, // Naming: inflects like nouns but with semantic specialization

  // Structural classes - provide syntactic scaffolding
  cconj, // Coordination: connects equal elements
  sconj, // Subordination: introduces dependent structures
  part, // Function: discourse and logical operators
  punct, // Orthography: structural markers only
];
