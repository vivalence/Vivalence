// https://universaldependencies.org/u/feat/index.html
export default function parseFeats(featsString = "") {
    const feats = featsString.split("|").reduce((acc, feat) => {
        let [key, value] = feat.split("=");
        const keyMapping = VALUE_MAPPINGS[key];
        value = keyMapping && keyMapping[value] ? keyMapping[value] : value;
        acc[key] = value;
        return acc;
    }, {});

    feats.ENUM = {
        mood: FEATS_ENUM_MAPPING.mood[feats.Mood],
    };
    return feats;
}

export const FEATS_ENUM_MAPPING = {
    mood: {
        Indicative: "INDICATIVO",
        Subjunctive: "SUBJUNTIVO",
    },
};

const VALUE_MAPPINGS = {
    Number: {
        Sing: "Singular",
        Plur: "Plural",
        Dual: "Dual",
    },
    Person: {
        1: "First",
        2: "Second",
        3: "Third",
    },
    Tense: {
        Past: "Past",
        Pres: "Present",
        Fut: "Future",
        Imp: "Imperfect",
        Pqp: "Preterite Perfect",
    },
    Mood: {
        Ind: "Indicative",
        Sub: "Subjunctive",
        Imp: "Imperative",
        Part: "Participle",
        Inf: "Infinitive",
        Ger: "Gerund",
        Cnd: "Conditional",
    },
    VerbForm: {
        Fin: "Finite",
        Inf: "Infinitive",
        Part: "Participle",
        Ger: "Gerund",
        Sup: "Supine",
    },
    Gender: {
        Masc: "Masculine",
        Fem: "Feminine",
        Neut: "Neuter",
    },
    Voice: {
        Act: "Active",
        Pass: "Passive",
        Mid: "Middle",
    },
    Case: {
        Nom: "Nominative",
        Acc: "Accusative",
        Dat: "Dative",
        Gen: "Genitive",
        Voc: "Vocative",
        Loc: "Locative",
        Ins: "Instrumental",
        Abl: "Ablative",
    },
    Degree: {
        Pos: "Positive",
        Comp: "Comparative",
        Sup: "Superlative",
    },
    Aspect: {
        Impf: "Imperfective",
        Perf: "Perfective",
        Prog: "Progressive",
    },
    Polarity: {
        Pos: "Positive",
        Neg: "Negative",
    },
    Possessive: {
        Yes: "Yes",
        No: "No",
    },
    Reflex: {
        Yes: "Yes",
        No: "No",
    },
    Definite: {
        Ind: "Indefinite",
        Def: "Definite",
        Com: "Complex",
    },
    Evident: {
        Fh: "Direct",
        Nfh: "Non-direct",
    },
    PronType: {
        Prs: "Personal",
        Dem: "Demonstrative",
        Int: "Interrogative",
        Rel: "Relative",
        Exc: "Exclusive",
        Incl: "Inclusive",
        Art: "Article",
    },
    Foreign: {
        Yes: "Yes",
        No: "No",
    },
    Typo: {
        Yes: "Yes",
        No: "No",
    },
    PrepCase: {
        Npr: "Non-Prepositional",
        Pre: "Prepositional",
    },
    NumType: {
        Card: "Cardinal",
        Ord: "Ordinal",
        Mult: "Multiplicative",
        Frac: "Fraction",
    },
    AdvType: {
        Man: "Manner",
        Loc: "Locative",
        Tim: "Temporal",
        Cau: "Causal",
        Deg: "Degree",
    },
};
