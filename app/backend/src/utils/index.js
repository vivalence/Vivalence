export const invertObj = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});
};

// sleep function
export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
