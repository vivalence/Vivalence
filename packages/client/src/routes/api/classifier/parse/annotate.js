// https://universaldependencies.org/u/feat/index.html
// discarding/ignoring xpos

function parseFeats(featsString = "") {
    if (!featsString) return {};
    const feats = featsString.split("|").reduce((acc, feat) => {
        if (!feat || feat === "_") return acc;
        const [key, value] = feat.split("=");
        if (!!key && !!value) acc[key] = value;
        return acc;
    }, {});

    feats._ = featsString;
    return feats;
}

export default function annotate(token) {
    const feats = parseFeats(token.feats.toLowerCase());
    const pos = token.upos.toLowerCase();

    const annotation = {
        lemma: token.lemma,
        pos
    };

    switch (pos) {
        case "det":
            annotation.number = feats.number;
            annotation.prontype = feats.prontype;

            if (feats.person) annotation.person = feats.person;
            if (feats.poss) annotation.poss = feats.poss;
            if (feats.definite) annotation.definite = feats.definite;
            if (feats.gender) annotation.gender = feats.gender;
            break;

        case "noun":
            annotation.gender = feats.gender;
            annotation.number = feats.number;
            break;

        case "adj":
            annotation.gender = feats.gender;
            annotation.number = feats.number;
            if (feats.verbform) annotation.verbform = feats.verbform;
            break;

        case "verb":
            annotation.verbform = feats.verbform;
            if (feats.tense) annotation.tense = feats.tense;
            if (feats.mood) annotation.mood = feats.mood;
            if (feats.person) annotation.person = feats.person;
            if (feats.number) annotation.number = feats.number;
            if (feats.aspect) annotation.aspect = feats.aspect;
            break;

        case "aux":
            annotation.verbform = feats.verbform;
            if (feats.tense) annotation.tense = feats.tense;
            if (feats.mood) annotation.mood = feats.mood;
            if (feats.person) annotation.person = feats.person;
            if (feats.number) annotation.number = feats.number;
            break;

        case "num":
            annotation.number = feats.number;
            annotation.numtype = feats.numtype;
            if (feats.gender) annotation.gender = feats.gender;
            break;

        case "pron":
            annotation.number = feats.number;
            annotation.prontype = feats.prontype;
            if (feats.gender) annotation.gender = feats.gender;
            if (feats.person) annotation.person = feats.person;
            break;

        case "adv":
            if (feats.polarity) annotation.polarity = feats.polarity;
            if (feats.prontype) annotation.prontype = feats.prontype;
            if (feats.degree) annotation.degree = feats.degree;
            break;

        case "punct":
            if (feats.puncttype) annotation.puncttype = feats.puncttype;
        case "adp":
        case "sconj":
        case "cconj":
        case "intj":
        case "propn":
            break;

        default:
            break;
    }
    return annotation;
}
