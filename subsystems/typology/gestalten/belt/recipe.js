import * as array from "./array.js";

export const nearest = (
  items,
  target,
  { tiers = {}, accessor = (item) => item.tune, fallback = [0.5, 0.5, 0.5, 0.5] } = {},
) => {
  const point = typeof target === "string" ? (tiers[target] ?? fallback) : target;
  return array.nearest(items, point, accessor);
};
