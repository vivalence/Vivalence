import * as array from "./array.js";

export const nearest = (items, target, { accessor = (item) => item.tune } = {}) => array.nearest(items, target, accessor);
