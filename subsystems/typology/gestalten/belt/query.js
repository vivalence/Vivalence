import * as is from "../is/index.js";

const like = (pattern) => {
  const source = String(pattern)
    .split("%")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  const expression = new RegExp(`^${source}$`);
  return (value) => is.string(value) && expression.test(value);
};

const refs = (value) =>
  [value ?? []].flat().map((item) => (is.string(item) ? { slug: item } : item));

const SCALAR = {
  $eq: (argument) => (value) => value === argument,
  $ne: (argument) => (value) => value !== argument,
  $in: (argument) => (value) => argument.includes(value),
  $nin: (argument) => (value) => !argument.includes(value),
  $gt: (argument) => (value) => value > argument,
  $gte: (argument) => (value) => value >= argument,
  $lt: (argument) => (value) => value < argument,
  $lte: (argument) => (value) => value <= argument,
  $like: like,
  $re: (argument) => (value) => new RegExp(argument).test(value),
  $exists: (argument) => (value) => (value != null) === argument,
};

const COLLECTION = {
  $some: (inner) => (items) => items.some(inner),
  $every: (inner) => (items) => items.every(inner),
  $none: (inner) => (items) => !items.some(inner),
};

const predicate = (expected) => {
  if (is.array(expected))
    return (value) => is.array(value) && expected.every((item) => value.includes(item));
  if (!is.object(expected)) return (value) => value === expected;

  const tests = [];
  for (const [operator, argument] of Object.entries(expected)) {
    if (COLLECTION[operator]) {
      const inner = where(argument);
      if (inner == null) return null;
      tests.push((value) => COLLECTION[operator](inner)(refs(value)));
    } else if (operator === "$not") {
      const inner = predicate(argument);
      if (inner == null) return null;
      tests.push((value) => !inner(value));
    } else if (SCALAR[operator]) {
      tests.push(SCALAR[operator](argument));
    } else if (operator.startsWith("$")) {
      return null;
    } else {
      const nested = predicate(argument);
      if (nested == null) return null;
      tests.push((value) => is.object(value) && nested(value[operator]));
    }
  }
  return (value) => tests.every((test) => test(value));
};

export const lift = (selector) => {
  if (selector == null || selector === true) return {};
  if (is.fn(selector)) return null;
  if (is.string(selector)) return { symbols: { $some: { slug: selector } } };
  if (is.array(selector)) return { $and: selector.map((slug) => ({ symbols: { $some: { slug } } })) };
  if (!is.object(selector)) return null;
  return selector;
};

export const where = (selector) => {
  if (is.fn(selector)) return selector;
  const query = lift(selector);
  if (query == null) return null;

  const tests = [];
  for (const [key, expected] of Object.entries(query)) {
    if (key === "$and" || key === "$or") {
      const parts = expected.map(where);
      if (parts.some((part) => part == null)) return null;
      const fold = key === "$and" ? "every" : "some";
      tests.push((row) => parts[fold]((part) => part(row)));
      continue;
    }
    const test = predicate(expected);
    if (test == null) return null;
    tests.push((row) => test(row?.[key]));
  }
  return (row) => tests.every((test) => test(row));
};
