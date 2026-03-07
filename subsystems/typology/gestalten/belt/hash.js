import { deep } from "./sort.js";

const fnv1a = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
};

export const string = fnv1a;
export const object = (obj) => fnv1a(JSON.stringify(deep(obj)));
export const array = (arr) => fnv1a(JSON.stringify(deep(arr)));
