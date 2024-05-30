const PROVIDE_META = false;

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
    ]
};
if (PROVIDE_META) {
    pos.meta = {
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
            num: { enum: "num", title: "Numeral", description: "A word that expresses a number." },
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
    };
}

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
    enum: ["fin", "inf", "part", "ger"]
};
if (PROVIDE_META) {
    verbform.meta = {
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
    };
}

const tense = {
    $id: "unit.annotation.tense",
    type: "string",
    title: "Tense",
    description:
        "The time of action or state expressed by the verb. Possible values: 'past' (Past: An action or state that occurred in the past), 'pres' (Present: An action or state that is currently occurring), 'fut' (Future: An action or state that will occur in the future), 'imp' (Imperfect: A past action or state that was ongoing or repeated), 'pqp' (Pluperfect: An action or state that was completed before another past action).",
    enum: ["past", "pres", "fut", "imp"] //, "pqp"],
};
if (PROVIDE_META) {
    tense.meta = {
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
    };
}

const mood = {
    $id: "unit.annotation.mood",
    type: "string",
    title: "Mood",
    description:
        "The grammatical mood of a verb, indicating modality. Possible values: 'ind' (Indicative: A mood used for statements of fact), 'sub' (Subjunctive: A mood used for hypothetical or non-real actions), 'imp' (Imperative: A mood used for commands or requests), 'cnd' (Conditional: A mood used to express conditions or hypothetical situations).",
    enum: ["ind", "sub", "imp", "cnd"]
};
if (PROVIDE_META) {
    mood.meta = {
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
    };
}

const person = {
    $id: "unit.annotation.person",
    type: "string",
    title: "Person",
    description:
        "The grammatical person of a verb, indicating the subject. Possible values: '1' (First Person: The speaker or writer), '2' (Second Person: The person being addressed), '3' (Third Person: The person or thing being talked about).",
    enum: ["1", "2", "3"]
};
if (PROVIDE_META) {
    person.meta = {
        enums: {
            1: { enum: "1", title: "First Person", description: "The speaker or writer." },
            2: { enum: "2", title: "Second Person", description: "The person being addressed." },
            3: {
                enum: "3",
                title: "Third Person",
                description: "The person or thing being talked about."
            }
        }
    };
}

const number = {
    $id: "unit.annotation.number",
    type: "string",
    title: "Number",
    description:
        "The grammatical number of a noun or verb, indicating singular, plural. Possible values: 'sing' (Singular: One person, place, thing, or idea), 'plur' (Plural: More than one person, place, thing, or idea).",
    enum: ["sing", "plur"]
};
if (PROVIDE_META) {
    number.meta = {
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
            }
        }
    };
}

const aspect = {
    $id: "unit.annotation.aspect",
    type: "string",
    title: "Aspect",
    description:
        "The aspect of a verb, indicating the flow of time in the action. Possible values: 'imp' (Imperfective: An action or state that is ongoing or repeated), 'perf' (Perfective: An action or state that is completed), 'prog' (Progressive: An action or state that is in progress), 'hab' (Habitual: An action that takes place habitually), 'iter' (Iterative: An action that is repeated), 'prosp' (Prospective: An action that is expected to take place).",
    enum: ["imp", "perf", "prog", "hab"]
};
if (PROVIDE_META) {
    aspect.meta = {
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
    };
}

const gender = {
    $id: "unit.annotation.gender",
    type: "string",
    title: "Gender",
    description:
        "The grammatical gender of a noun or pronoun. Possible values: 'fem' (Feminine: Female gender), 'masc' (Masculine: Male gender).",
    enum: ["fem", "masc"]
};
if (PROVIDE_META) {
    gender.meta = {
        enums: {
            fem: { enum: "fem", title: "Feminine", description: "" },
            masc: { enum: "masc", title: "Masculine", description: "" }
        }
    };
}

const degree = {
    $id: "unit.annotation.degree",
    type: "string",
    title: "Degree",
    description:
        "The degree of comparison for adjectives and adverbs. Possible values: 'Abs' (Absolute: An extreme degree of the base form), 'Cmp' (Comparative: A higher or lower degree of the base form), 'Dim' (Diminutive: A lesser degree or smaller version of something), 'Sup' (Superlative: The highest or lowest degree of the base form).",
    enum: ["abs", "cmp", "dim", "sup"]
};
if (PROVIDE_META) {
    degree.meta = {
        enums: {
            abs: {
                enum: "abs",
                title: "Absolute",
                description: "An extreme degree of the base form."
            },
            cmp: {
                enum: "cmp",
                title: "Comparative",
                description: "A higher or lower degree of the base form."
            },
            dim: {
                enum: "dim",
                title: "Diminutive",
                description: "A lesser degree or smaller version of something."
            },
            sup: {
                enum: "sup",
                title: "Superlative",
                description: "The highest or lowest degree of the base form."
            }
        }
    };
}

const poss = {
    $id: "unit.annotation.possessive",
    type: "string",
    title: "Possessive",
    description:
        "Indicates whether a noun or pronoun shows possession. Possible values: 'yes' (Possessive: Indicates possession), 'no' (Non-Possessive: Does not indicate possession).",
    enum: ["yes", "no"]
};
if (PROVIDE_META) {
    poss.meta = {
        enums: {
            yes: { enum: "yes", title: "Possessive", description: "" },
            no: { enum: "no", title: "Non-Possessive", description: "" }
        }
    };
}

const reflex = {
    $id: "unit.annotation.reflex",
    type: "string",
    title: "Reflexive",
    description:
        "Indicates whether a verb is reflexive. Possible values: 'yes' (Reflexive: Indicates the subject performs the action on itself), 'no' (Non-Reflexive: The action is not performed on the subject itself).",
    enum: ["yes", "no"]
};
if (PROVIDE_META) {
    reflex.meta = {
        enums: {
            yes: { enum: "yes", title: "Reflexive", description: "" },
            no: { enum: "no", title: "Non-Reflexive", description: "" }
        }
    };
}

const prontype = {
    $id: "unit.annotation.prontype",
    type: "string",
    title: "Pronoun Type",
    description:
        "The type of pronoun. Possible values: 'prs' (Personal: Refers to specific people or things), 'art' (Article: Introduces nouns), 'int' (Interrogative: Used to ask questions), 'exc' (Exclamative: Expresses strong emotions), 'rel' (Relative: Links clauses), 'dem' (Demonstrative: Points to specific things), 'tot' (Total: Refers to all members of a group), 'neg' (Negative: Indicates negation), 'ind' (Indefinite: Refers to non-specific things or people).",
    enum: ["prs", "art", "int", "exc", "rel", "dem", "tot", "neg", "ind"]
};
if (PROVIDE_META) {
    prontype.meta = {
        enums: {
            prs: {
                enum: "prs",
                title: "Personal",
                description: "Refers to specific people or things."
            },
            art: {
                enum: "art",
                title: "Article",
                description: "Introduces nouns."
            },
            int: {
                enum: "int",
                title: "Interrogative",
                description: "Used to ask questions."
            },
            exc: {
                enum: "exc",
                title: "Exclamative",
                description: "Expresses strong emotions."
            },
            rel: {
                enum: "rel",
                title: "Relative",
                description: "Links clauses."
            },
            dem: {
                enum: "dem",
                title: "Demonstrative",
                description: "Points to specific things."
            },
            tot: {
                enum: "tot",
                title: "Total",
                description: "Refers to all members of a group."
            },
            neg: {
                enum: "neg",
                title: "Negative",
                description: "Indicates negation."
            },
            ind: {
                enum: "ind",
                title: "Indefinite",
                description: "Refers to non-specific things or people."
            }
        }
    };
}

const numtype = {
    $id: "unit.annotation.numtype",
    type: "string",
    title: "Numeral Type",
    description:
        "The type of numeral. Possible values: 'card' (Cardinal: A numeral expressing a quantity), 'ord' (Ordinal: A numeral expressing position or order), 'mult' (Multiplicative: A numeral expressing how many times), 'frac' (Fraction: A numeral expressing a part of a whole).",
    enum: ["card", "ord", "mult", "frac"]
};
if (PROVIDE_META) {
    numtype.meta = {
        enums: {
            card: { enum: "card", title: "Cardinal", description: "" },
            ord: { enum: "ord", title: "Ordinal", description: "" },
            mult: { enum: "mult", title: "Multiplicative", description: "" },
            frac: { enum: "frac", title: "Fraction", description: "" }
        }
    };
}

const numform = {
    $id: "unit.annotation.numform",
    type: "string",
    title: "Numeral Form",
    description:
        "The form of numerals, indicating whether the number is expressed by digits, Roman numerals, or words.",
    enum: ["digit", "roman", "word"]
};
if (PROVIDE_META) {
    numform.meta = {
        enums: {
            digit: {
                enum: "digit",
                title: "Digit",
                description: "Number expressed using digits (0-9)."
            },
            roman: {
                enum: "roman",
                title: "Roman",
                description: "Number expressed using Roman numerals."
            },
            word: {
                enum: "word",
                title: "Word",
                description: "Number expressed in words."
            }
        }
    };
}

const polarity = {
    $id: "unit.annotation.polarity",
    type: "string",
    title: "Polarity",
    description:
        "The polarity of an adverb. Possible values: 'neg' (Negative: Indicates negation).",
    enum: ["neg"]
};
if (PROVIDE_META) {
    polarity.meta = {
        enums: {
            neg: { enum: "neg", title: "Negative", description: "Indicates negation." }
        }
    };
}

const definite = {
    $id: "unit.annotation.definite",
    type: "string",
    title: "Definiteness",
    description:
        "Indicates whether a noun is definite or indefinite. Possible values: 'def' (Definite: Refers to something specific or known), 'ind' (Indefinite: Refers to something nonspecific or unknown).",
    enum: ["def", "ind"]
};
if (PROVIDE_META) {
    definite.meta = {
        enums: {
            def: { enum: "def", title: "Definite", description: "" },
            ind: { enum: "ind", title: "Indefinite", description: "" }
        }
    };
}

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
    numtype,
    numform,
    polarity
};
