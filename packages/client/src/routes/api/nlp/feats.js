// https://universaldependencies.org/u/feat/index.html

const relevantFeats = [
    "PronType",
    "NumType",
    "Poss",
    "Reflex",
    "Gender",
    "Number",
    "Definite",
    "Degree",
    "VerbForm",
    "Tense",
    "Person",
    "Mood",
    "Aspect"
];

export default function parseFeats(featsString = "") {
    const feats = featsString.split("|").reduce((acc, feat) => {
        if (!feat || feat === "_") return acc;
        let [key, value] = feat.split("=");
        if (!!key && !!value && relevantFeats.includes(key)) acc[key] = value;
        return acc;
    }, {});

    feats._ = featsString;
    return feats;
}
