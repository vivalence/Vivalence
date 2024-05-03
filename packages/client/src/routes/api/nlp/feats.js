// https://universaldependencies.org/u/feat/index.html

export default function parseFeats(featsString = "") {
    const feats = featsString.split("|").reduce((acc, feat) => {
        let [key, value] = feat.split("=");
        if (!!key && !!value) acc[key] = value;
        return acc;
    }, {});

    feats._ = featsString;
    return feats;
}
