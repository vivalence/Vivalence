import * as ebisu from "ebisu-js";

// provides a defaul model thats used when a node is reviewed for the first time

export const getDefaultModel = ({ alpha = 4, beta = 4, tau = 0.1 }) =>
    ebisu.defaultModel(tau, alpha, beta);

export const predictNextReviewTime = (model) => {
    let decay = ebisu.modelToPercentileDecay(model, 0.8);
    return decay;
};

export const updateModel = (model, success, total, elapsedTime) => {
    const updatedModel = ebisu.updateRecall(model, success, total, elapsedTime);
    return updatedModel;
};

export const scaleModel = (model, scale = defaults.graduateScale) => {
    const updatedModel = ebisu.rescaleHalflife(model, scale);
    return updatedModel;
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
