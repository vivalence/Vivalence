// @ts-self-types="./sets.d.ts"
import { v } from "../v.js";

export const optional = (set) => Object.fromEntries(Object.entries(set).map(([key, schema]) => [key, schema.optional()]));
export const of = (...sets) => v.object(Object.assign({}, ...sets));
