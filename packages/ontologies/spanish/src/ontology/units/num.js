import annotations from "../annotations";
import unit from "../unit";

export const schema = {
    ...unit,
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "num.annotation.pos",
                    enum: ["num"]
                },
                lemma: { ...annotations.lemma },
                gender: { ...annotations.gender },
                number: { ...annotations.number },
                numtype: { ...annotations.numtype },
                numform: { ...annotations.numform }
            },
            required: ["pos", "lemma", "numtype"]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "num" } },
    { unique: { branch: "gender" } },
    { unique: { branch: "number" } },
    { unique: { branch: "numtype" } },
    { unique: { branch: "numform" } }
];

// @lj numbers are badly annotated by NLP ud/stanza.
export const annotationSpace = [
    // Cardinal numerals
    [
        ["pos", ["num"]],
        ["numtype", ["card"]],
        [
            "lemma",
            [
                "uno",
                "dos",
                "tres",
                "cuatro",
                "cinco",
                "seis",
                "siete",
                "ocho",
                "nueve",
                "diez",
                "once",
                "doce",
                "trece",
                "catorce",
                "quince",
                "dieciséis",
                "diecisiete",
                "dieciocho",
                "diecinueve",
                "veinte",
                "veintiuno",
                "veintidós",
                "veintitrés",
                "veinticuatro",
                "veinticinco",
                "veintiséis",
                "veintisiete",
                "veintiocho",
                "veintinueve",
                "treinta",
                "cuarenta",
                "cincuenta",
                "sesenta",
                "setenta",
                "ochenta",
                "noventa",
                "cien",
                "ciento",
                "doscientos",
                "trescientos",
                "cuatrocientos",
                "quinientos",
                "seiscientos",
                "setecientos",
                "ochocientos",
                "novecientos",
                "mil",
                "millón"
            ]
        ]
    ],
    // Ordinal numerals
    [
        ["pos", ["num"]],
        ["numtype", ["ord"]],
        [
            "lemma",
            [
                "primero",
                "segundo",
                "tercero",
                "cuarto",
                "quinto",
                "sexto",
                "séptimo",
                "octavo",
                "noveno",
                "décimo",
                "undécimo",
                "duodécimo",
                "decimotercero",
                "decimocuarto",
                "decimoquinto",
                "decimosexto",
                "decimoséptimo",
                "decimoctavo",
                "decimonoveno",
                "vigésimo",
                "trigésimo",
                "cuadragésimo",
                "quincuagésimo",
                "sexagésimo",
                "septuagésimo",
                "octogésimo",
                "nonagésimo",
                "centésimo",
                "milésimo",
                "millonésimo"
            ]
        ]
    ],
    // Multiplicative numerals
    [
        ["pos", ["num"]],
        ["numtype", ["mult"]],
        [
            "lemma",
            [
                "doble",
                "triple",
                "cuádruple",
                "quintuple",
                "séxtuple",
                "séptuple",
                "óctuple",
                "nónuple",
                "décuple"
            ]
        ]
    ],
    // Fractional numerals
    [
        ["pos", ["num"]],
        ["numtype", ["frac"]],
        [
            "lemma",
            [
                "medio",
                "tercio",
                "cuarto",
                "quinto",
                "sexto",
                "séptimo",
                "octavo",
                "noveno",
                "décimo"
            ]
        ]
    ]
];

export const lemmas = [];
for (const [branch, leaves] of annotationSpace.flat()) {
    if (branch !== "lemma") continue;
    lemmas.push(...leaves);
}
