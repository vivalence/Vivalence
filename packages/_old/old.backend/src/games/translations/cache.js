let cachedSentence = null;

const set = (sentence) => {
    cachedSentence = sentence;
};
const get = () => {
    return cachedSentence;
};
const clear = () => {
    cachedSentence = null;
};

export default {
    set,
    get,
    clear,
};
