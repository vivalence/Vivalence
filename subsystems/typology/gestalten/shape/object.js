import { steer, Signal } from "@vivalence/typology";

const route = (steps) => new Signal(steps.map((s) => s.nature).join("/"));

export const object = (vector, execute = steer.strategy.request) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const namespace = {};
      for (const child of f.trajectories) namespace[child.key] = child.namespace;
      const compiled = f.effect !== undefined ? execute(f.carry, f.effect, f.steps, route(f.steps)) : undefined;
      const value = compiled !== undefined ? Object.assign(compiled, namespace) : namespace;
      return f.signature ? { key: f.signature.nature, namespace: value } : value;
    },
  });

export function proxy(vector, execute = steer.strategy.request) {
  return chart(vector, execute, vector, []);
}

const chart = (root, execute, position, segments) =>
  new Proxy(function () {}, {
    get(_, key) {
      if (typeof key === "symbol") return undefined;
      const [step] = new Signal(key).array;
      if (!step) return undefined;
      const matches = steer.match.scope(position, step);
      if (!matches.length) return undefined;
      const [match, trajectory] = steer.match.feed(matches, step);
      const next = match.type === "remainder" ? position : trajectory;
      return chart(root, execute, next, [...segments, key]);
    },
    apply(_, __, args) {
      return steer.dispatch.invoke(root, segments.join("/"), execute)(...args);
    },
  });
