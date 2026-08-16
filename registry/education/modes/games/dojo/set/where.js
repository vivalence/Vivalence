import { array } from "@vivalence/typology";
import * as types from "../types.js";

const branches = (symbols) => {
  const spec = Array.isArray(symbols) ? { $all: symbols } : (symbols ?? {});
  return [
    ...(spec.$all ?? []).map((slug) => ({ symbols: { slug } })),
    ...(spec.$in?.length ? [{ symbols: { slug: { $in: [...spec.$in] } } }] : []),
    ...(spec.$none?.length ? [{ symbols: { $none: { slug: { $in: [...spec.$none] } } } }] : []),
  ];
};

const blank = (traits) =>
  traits == null ||
  (Array.isArray(traits)
    ? !traits.length
    : !traits.$contains?.length && !traits.$overlap?.length && !traits.$none?.length);

export const compile = (query = {}) => {
  const { ontology, symbols, ...rest } = query;
  const compiled = {
    ...rest,
    ontology: ontology
      ? Array.isArray(ontology)
        ? { $in: ontology }
        : ontology
      : { $in: types.ONTOLOGY },
  };
  const joined = branches(symbols);
  if (joined.length) compiled.$and = [...(compiled.$and ?? []), ...joined];
  if (!compiled.search) delete compiled.search;
  if (blank(compiled.traits)) delete compiled.traits;
  if (compiled.rank && compiled.rank.$lte == null && compiled.rank.$gte == null) delete compiled.rank;
  return compiled;
};

export const mentioned = (symbols) =>
  Array.isArray(symbols)
    ? symbols
    : symbols
      ? [...(symbols.$all ?? []), ...(symbols.$in ?? []), ...(symbols.$none ?? [])]
      : [];

export const projection = (set = []) =>
  array.unique(set.flatMap((clause) => mentioned(clause.where?.symbols)));
