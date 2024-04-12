import * as ebisu from "ebisu-js";

const DECAY_THRESHOLD = 0.75;

// provides a defaul model thats used when a node is reviewed for the first time
const getDefaultModel = ({ alpha = 4, beta = 4, tau = 0.1 }) =>
    ebisu.defaultModel(tau, alpha, beta);

export const predictNextReviewTime = (model) => {
    return ebisu.modelToPercentileDecay(model, DECAY_THRESHOLD);
};

export const modelToPercentileDecay = ebisu.modelToPercentileDecay;
export const predictRecall = ebisu.predictRecall;
export default ebisu;

export const initiateModel = (response) => {
    let defaultModel = {};
    switch (response) {
        case "GRADUATE":
            defaultModel.tau = 24;
            break;
        case "KNOWN":
            defaultModel.tau = 3.4;
            break;
        case "UNKNOWN":
            defaultModel.tau = 0.26;
            break;
        default:
            throw new Error(`Invalid response: ${response}`);
    }
    return getDefaultModel(defaultModel);
};
export const updateModel = (model, response, elapsedTime) => {
    try {
        switch (response) {
            case "GRADUATE":
                model = ebisu.updateRecall(model, 1, 1, elapsedTime);
                model = ebisu.rescaleHalflife(model, 5);
                break;
            case "KNOWN":
                model = ebisu.updateRecall(model, 1, 1, elapsedTime);
                break;
            case "UNKNOWN":
                model = ebisu.updateRecall(model, 0, 1, elapsedTime);
                break;
            default:
                throw new Error(`Invalid response: ${response}`);
        }
    } catch (error) {
        console.log("\n\n\n\n\n\n\n\n");
        console.error(error);
        console.log("\n\nCONTINUING\n\n\n\n\n\n");
        return model;
    }

    return model;
};

// todo USE actually
export const defaults = {
    init: {
        unknown: 0.1,
        known: 1,
        graduate: 24
    },
    graduateScale: 10
};
