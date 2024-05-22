const pos = {
    $id: "unit.annotation.pos",
    type: "string",
    title: "Part of Speech",
    description: "The part of speech category. ",
    enum: [
        "adj",
        "adp",
        "adv",
        "aux",
        "cconj",
        "det",
        "intj",
        "noun",
        "num",
        "part",
        "pron",
        "propn",
        "punct",
        "sconj",
        "verb"
    ],
    meta: {
        enums: {
            adj: {
                enum: "adj",
                title: "Adjective",
                description: "A word that modifies a noun or pronoun."
            },
            adp: {
                enum: "adp",
                title: "Adposition",
                description:
                    "A word that shows the relationship between its object and another word."
            },
            adv: {
                enum: "adv",
                title: "Adverb",
                description: "A word that modifies a verb, an adjective, or another adverb."
            },
            aux: {
                enum: "aux",
                title: "Auxiliary",
                description: "A verb used in forming tenses, moods, and voices."
            },
            cconj: {
                enum: "cconj",
                title: "Coordinating Conjunction",
                description: "A word that connects words, phrases, or clauses of equal rank."
            },
            det: {
                enum: "det",
                title: "Determiner",
                description: "A word that introduces a noun."
            },
            intj: {
                enum: "intj",
                title: "Interjection",
                description: "A word or phrase that expresses strong emotion or surprise."
            },
            noun: {
                enum: "noun",
                title: "Noun",
                description: "A word that refers to a person, place, thing, or idea."
            },
            num: {
                enum: "num",
                title: "Numeral",
                description: "A word that expresses a number."
            },
            part: {
                enum: "part",
                title: "Particle",
                description:
                    "A word that has grammatical function but does not fit into the main parts of speech."
            },
            pron: {
                enum: "pron",
                title: "Pronoun",
                description: "A word that takes the place of a noun."
            },
            propn: {
                enum: "propn",
                title: "Proper Noun",
                description: "A noun that denotes a particular person, place, or thing."
            },
            punct: {
                enum: "punct",
                title: "Punctuation",
                description: "A symbol that indicates the structure and organization of writing."
            },
            sconj: {
                enum: "sconj",
                title: "Subordinating Conjunction",
                description: "A conjunction that introduces a subordinate clause."
            },
            verb: {
                enum: "verb",
                title: "Verb",
                description: "A word that expresses an action or a state of being."
            }
        }
    }
};
const lemma = {
    $id: "unit.annotation.lemma",
    type: "string",
    title: "Lemma",
    description: "The canonical form or base form of a word."
};
const verbform = {
    $id: "unit.annotation.verbform",
    type: "string",
    title: "Verb Form",
    description:
        "The form of a verb, indicating its function in a sentence. Possible values: 'fin' (Finite: A verb form that is limited by subject and tense), 'inf' (Infinitive: The base form of a verb, usually preceded by 'to'), 'part' (Participle: A form of a verb used as an adjective or to form compound tenses), 'ger' (Gerund: A verb form that functions as a noun), 'sup' (Supine: A form of a verb used in some languages to denote purpose or intention).",
    enum: ["fin", "inf", "part", "ger"],
    meta: {
        enums: {
            fin: {
                enum: "fin",
                title: "Finite",
                description: "A verb form that is limited by subject and tense."
            },
            inf: {
                enum: "inf",
                title: "Infinitive",
                description: "The base form of a verb, usually preceded by 'to'."
            },
            part: {
                enum: "part",
                title: "Participle",
                description: "A form of a verb used as an adjective or to form compound tenses."
            },
            ger: {
                enum: "ger",
                title: "Gerund",
                description: "A verb form that functions as a noun."
            }
        }
    }
};
const tense = {
    $id: "unit.annotation.tense",
    type: "string",
    title: "Tense",
    description:
        "The time of action or state expressed by the verb. Possible values: 'past' (Past: An action or state that occurred in the past), 'pres' (Present: An action or state that is currently occurring), 'fut' (Future: An action or state that will occur in the future), 'imp' (Imperfect: A past action or state that was ongoing or repeated), 'pqp' (Pluperfect: An action or state that was completed before another past action).",
    enum: ["past", "pres", "fut", "imp"], //, "pqp"],
    meta: {
        enums: {
            past: {
                enum: "past",
                title: "Past",
                description: "An action or state that occurred in the past."
            },
            pres: {
                enum: "pres",
                title: "Present",
                description: "An action or state that is currently occurring."
            },
            fut: {
                enum: "fut",
                title: "Future",
                description: "An action or state that will occur in the future."
            },
            imp: {
                enum: "imp",
                title: "Imperfect",
                description: "A past action or state that was ongoing or repeated."
            }
            // pqp: {enum: "pqp", title: "Pluperfect", description: "An action or state that was completed before another past action."}
        }
    }
};
const mood = {
    $id: "unit.annotation.mood",
    type: "string",
    title: "Mood",
    description:
        "The grammatical mood of a verb, indicating modality. Possible values: 'ind' (Indicative: A mood used for statements of fact), 'sub' (Subjunctive: A mood used for hypothetical or non-real actions), 'imp' (Imperative: A mood used for commands or requests), 'cnd' (Conditional: A mood used to express conditions or hypothetical situations).",
    enum: ["ind", "sub", "imp", "cnd"],
    meta: {
        enums: {
            ind: {
                enum: "ind",
                title: "Indicative",
                description: "A mood used for statements of fact."
            },
            sub: {
                enum: "sub",
                title: "Subjunctive",
                description: "A mood used for hypothetical or non-real actions."
            },
            imp: {
                enum: "imp",
                title: "Imperative",
                description: "A mood used for commands or requests."
            },
            cnd: {
                enum: "cnd",
                title: "Conditional",
                description: "A mood used to express conditions or hypothetical situations."
            }
        }
    }
};
const person = {
    $id: "unit.annotation.person",
    type: "string",
    title: "Person",
    description:
        "The grammatical person of a verb, indicating the subject. Possible values: '1' (First Person: The speaker or writer), '2' (Second Person: The person being addressed), '3' (Third Person: The person or thing being talked about).",
    enum: ["1", "2", "3"],
    meta: {
        enums: {
            1: {
                enum: "1",
                title: "First Person",
                description: "The speaker or writer."
            },
            2: {
                enum: "2",
                title: "Second Person",
                description: "The person being addressed."
            },
            3: {
                enum: "3",
                title: "Third Person",
                description: "The person or thing being talked about."
            }
        }
    }
};
const number = {
    $id: "unit.annotation.number",
    type: "string",
    title: "Number",
    description:
        "The grammatical number of a noun or verb, indicating singular, plural, or dual. Possible values: 'sing' (Singular: One person, place, thing, or idea), 'plur' (Plural: More than one person, place, thing, or idea), 'dual' (Dual: Two persons, places, things, or ideas).",
    enum: ["sing", "plur", "dual"],
    meta: {
        enums: {
            sing: {
                enum: "sing",
                title: "Singular",
                description: "One person, place, thing, or idea"
            },
            plur: {
                enum: "plur",
                title: "Plural",
                description: "More than one person, place, thing, or idea"
            },
            dual: {
                enum: "dual",
                title: "Dual",
                description: "Two persons, places, things, or ideas"
            }
        }
    }
};
const aspect = {
    $id: "unit.annotation.aspect",
    type: "string",
    title: "Aspect",
    description:
        "The aspect of a verb, indicating the flow of time in the action. Possible values: 'imp' (Imperfective: An action or state that is ongoing or repeated), 'perf' (Perfective: An action or state that is completed), 'prog' (Progressive: An action or state that is in progress), 'hab' (Habitual: An action that takes place habitually), 'iter' (Iterative: An action that is repeated), 'prosp' (Prospective: An action that is expected to take place).",
    enum: ["imp", "perf", "prog", "hab"],
    meta: {
        enums: {
            imp: {
                enum: "imp",
                title: "Imperfective",
                description: "An action or state that is ongoing or repeated"
            },
            perf: {
                enum: "perf",
                title: "Perfective",
                description: "An action or state that is completed"
            },
            prog: {
                enum: "prog",
                title: "Progressive",
                description: "An action or state that is in progress"
            },
            hab: {
                enum: "hab",
                title: "Habitual",
                description: "An action that takes place habitually"
            }
        }
    }
};
const gender = {
    $id: "unit.annotation.gender",
    type: "string",
    title: "Gender",
    description:
        "The grammatical gender of a noun or pronoun. Possible values: 'fem' (Feminine: Female gender), 'masc' (Masculine: Male gender).",
    enum: ["fem", "masc"],
    meta: {
        enums: {
            fem: { enum: "fem", title: "Feminine", description: "" },
            masc: { enum: "masc", title: "Masculine", description: "" }
        }
    }
};
const degree = {
    $id: "unit.annotation.degree",
    type: "string",
    title: "Degree",
    description:
        "The degree of comparison for adjectives and adverbs. Possible values: 'pos' (Positive: The base form of an adjective or adverb), 'comp' (Comparative: A higher or lower degree of the base form), 'sup' (Superlative: The highest or lowest degree of the base form).",
    enum: ["pos", "comp", "sup"],
    meta: {
        enums: {
            pos: { enum: "pos", title: "Positive", description: "" },
            comp: { enum: "comp", title: "Comparative", description: "" },
            sup: { enum: "sup", title: "Superlative", description: "" }
        }
    }
};
const poss = {
    $id: "unit.annotation.possessive",
    type: "string",
    title: "Possessive",
    description:
        "Indicates whether a noun or pronoun shows possession. Possible values: 'yes' (Possessive: Indicates possession), 'no' (Non-Possessive: Does not indicate possession).",
    enum: ["yes", "no"],
    meta: {
        enums: {
            yes: { enum: "yes", title: "Possessive", description: "" },
            no: { enum: "no", title: "Non-Possessive", description: "" }
        }
    }
};
const reflex = {
    $id: "unit.annotation.reflex",
    type: "string",
    title: "Reflexive",
    description:
        "Indicates whether a verb is reflexive. Possible values: 'yes' (Reflexive: Indicates the subject performs the action on itself), 'no' (Non-Reflexive: The action is not performed on the subject itself).",
    enum: ["yes", "no"],
    meta: {
        enums: {
            yes: { enum: "yes", title: "Reflexive", description: "" },
            no: { enum: "no", title: "Non-Reflexive", description: "" }
        }
    }
};
const definite = {
    $id: "unit.annotation.definite",
    type: "string",
    title: "Definiteness",
    description:
        "Indicates whether a noun is definite or indefinite. Possible values: 'def' (Definite: Refers to something specific or known), 'ind' (Indefinite: Refers to something nonspecific or unknown).",
    enum: ["def", "ind"],
    meta: {
        enums: {
            def: { enum: "def", title: "Definite", description: "" },
            ind: { enum: "ind", title: "Indefinite", description: "" }
        }
    }
};
const prontype = {
    $id: "unit.annotation.prontype",
    type: "string",
    title: "Pronoun Type",
    description:
        "The type of pronoun. Possible values: 'prs' (Personal: A pronoun that refers to a specific person or thing), 'dem' (Demonstrative: A pronoun that points to specific things), 'int' (Interrogative: A pronoun used to ask questions), 'rel' (Relative: A pronoun that introduces a relative clause), 'exc' (Exclusive: A pronoun that excludes the speaker), 'incl' (Inclusive: A pronoun that includes the speaker), 'art' (Article: A word that introduces a noun), 'ind' (Indefinite: A pronoun that refers to non-specific things or people), 'neg' (Negative: A pronoun that indicates negation).",
    enum: ["prs", "dem", "int", "rel", "exc", "incl", "art", "ind", "neg"],
    meta: {
        enums: {
            prs: {
                enum: "prs",
                title: "Personal",
                description: "A pronoun that refers to a specific person or thing."
            },
            dem: {
                enum: "dem",
                title: "Demonstrative",
                description: "A pronoun that points to specific things."
            },
            int: {
                enum: "int",
                title: "Interrogative",
                description: "A pronoun used to ask questions."
            },
            rel: {
                enum: "rel",
                title: "Relative",
                description: "A pronoun that introduces a relative clause."
            },
            exc: {
                enum: "exc",
                title: "Exclusive",
                description: "A pronoun that excludes the speaker."
            },
            incl: {
                enum: "incl",
                title: "Inclusive",
                description: "A pronoun that includes the speaker."
            },
            art: { enum: "art", title: "Article", description: "A word that introduces a noun." },
            ind: {
                enum: "ind",
                title: "Indefinite",
                description: "A pronoun that refers to non-specific things or people."
            },
            neg: {
                enum: "neg",
                title: "Negative",
                description: "A pronoun that indicates negation."
            }
        }
    }
};

const numtype = {
    $id: "unit.annotation.numtype",
    type: "string",
    title: "Numeral Type",
    description:
        "The type of numeral. Possible values: 'card' (Cardinal: A numeral expressing a quantity), 'ord' (Ordinal: A numeral expressing position or order), 'mult' (Multiplicative: A numeral expressing how many times), 'frac' (Fraction: A numeral expressing a part of a whole).",
    enum: ["card", "ord", "mult", "frac"],
    meta: {
        enums: {
            card: { enum: "card", title: "Cardinal", description: "" },
            ord: { enum: "ord", title: "Ordinal", description: "" },
            mult: { enum: "mult", title: "Multiplicative", description: "" },
            frac: { enum: "frac", title: "Fraction", description: "" }
        }
    }
};

export const annotations = {
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
    numtype
};
