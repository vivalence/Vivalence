export const invertObj = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});
};
