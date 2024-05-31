export const numtype = {
    $id: "unit.annotation.numtype",
    type: "string",
    title: "Numeral Type",
    description:
        "The type of numeral. Possible values: 'card' (Cardinal: A numeral expressing a quantity), 'ord' (Ordinal: A numeral expressing position or order), 'mult' (Multiplicative: A numeral expressing how many times), 'frac' (Fraction: A numeral expressing a part of a whole).",
    enum: ["card", "ord", "mult", "frac"]
};
export const meta = {
    enums: {
        card: { enum: "card", title: "Cardinal", description: "" },
        ord: { enum: "ord", title: "Ordinal", description: "" },
        mult: { enum: "mult", title: "Multiplicative", description: "" },
        frac: { enum: "frac", title: "Fraction", description: "" }
    }
};
