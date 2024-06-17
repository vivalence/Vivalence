export const poss = {
    $id: "unit.annotation.possessive",
    type: "string",
    title: "Possessive",
    description:
        "Indicates whether a noun or pronoun shows possession. Possible values: 'yes' (Possessive: Indicates possession), 'no' (Non-Possessive: Does not indicate possession).",
    enum: ["yes", "no"]
};
export const meta = {
    enums: {
        yes: { enum: "yes", title: "Possessive", description: "" },
        no: { enum: "no", title: "Non-Possessive", description: "" }
    }
};
