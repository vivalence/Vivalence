export const prontype = {
    $id: "unit.annotation.prontype",
    type: "string",
    title: "Pronoun Type",
    description:
        "The type of pronoun. Possible values: 'prs' (Personal: Refers to specific people or things), 'art' (Article: Introduces nouns), 'int' (Interrogative: Used to ask questions), 'exc' (Exclamative: Expresses strong emotions), 'rel' (Relative: Links clauses), 'dem' (Demonstrative: Points to specific things), 'tot' (Total: Refers to all members of a group), 'neg' (Negative: Indicates negation), 'ind' (Indefinite: Refers to non-specific things or people).",
    enum: ["prs", "art", "int", "exc", "rel", "dem", "tot", "neg", "ind"]
};
export const meta = {
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
