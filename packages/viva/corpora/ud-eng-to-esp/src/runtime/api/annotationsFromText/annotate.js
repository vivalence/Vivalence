import { validate } from "@vivalence/services";
import { units } from "../../ontology";

export default function annotate(token) {
    const feats = parseFeats(token.feats);

    const annotation = {
        lemma: token.lemma,
        pos: token.upos.toLowerCase()
    };

    for (const key in feats) {
        annotation[key] = feats[key];
    }

    if (!units[annotation.pos]) throw new Error(`Schema not found for pos: ${annotation.pos}`);
    const schema = units[annotation.pos].schema.properties.annotation;
    schema.additionalProperties = false;

    const { isValid, errors } = validate(schema, annotation);

    annotation.meta = {
        token: token.token,
        index: token.index,
        start_char: token.start_char,
        end_char: token.end_char,
        upos: token.upos,
        feats: token.feats
    };

    return annotation;
}

function parseFeats(featsString = "") {
    let feats = {};
    if (!featsString) return feats;

    feats = featsString
        .toLowerCase()
        .split("|")
        .reduce((acc, feat) => {
            if (!feat || feat === "_") return acc;
            let [key, value] = feat.split("=");

            if (!key || !value) return acc;
            if (key.includes("[")) return acc;
            if (value.includes(",")) value = value.split(",")[0];

            acc[key] = value;
            return acc;
        }, feats);

    return feats;
}
