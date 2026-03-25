import bayesian from "./bayesian.js";
import boolean from "./boolean.js";
import counter from "./counter.js";

const registry = [bayesian, boolean, counter];

export const drivers = Object.fromEntries(
  registry.map((d) => [d.type, d]),
);

export default drivers;
