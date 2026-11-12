import { Signal, ToolCall, Vector } from "@vivalence/typology";

export const REPO = "/Users/finn/vivalence/code/vivalence";
export const PROBES = `${REPO}/.ikiro/reference/harness-layout`;

export const natures = (reference) => new Signal(reference).array.map((step) => step.nature).filter(Boolean);
export const named = (reference) => new ToolCall(natures(reference).map((nature) => ({ nature }))).name;
export const GRAMMAR = /^[a-zA-Z0-9_-]{1,64}$/;

export const toolTree = (paths, tag) => {
  const tools = new Vector();
  for (const path of paths)
    tools.open({ nature: path, valence: `${tag} ${path}` }, (ctx) => ({
      output: {
        tag,
        path,
        mode: ctx.mode?.manifest?.slug ?? null,
        daemon: ctx.daemon?.reference ?? null,
        runtime: ctx.runtime?.reference ?? null,
        reference: ctx.reference ?? null,
        statics: ctx.statics ?? null,
      },
    }));
  return tools;
};

export const mode = (type, slug, paths = [], primer = null) => ({
  manifest: { type, slug, description: `${type}/${slug}` },
  tools: toolTree(paths, `${type}/${slug}`),
  primer: primer ?? new Vector(),
});

export const host = (reference, modes, extra = {}) => {
  const grouped = {};
  for (const held of modes) (grouped[held.manifest.type] ??= {})[held.manifest.slug] = held;
  return { reference, modes: grouped, statics: { host: reference }, entities: { em: { flush: async () => {} } }, ...extra };
};

export const world = (runtimeModes, daemons) => {
  const daemonHosts = Object.fromEntries(
    Object.entries(daemons).map(([slug, modes]) => [slug, host(`/daemon/${slug}`, modes)]),
  );
  return { ...host("/runtime/runtime", runtimeModes), daemons: daemonHosts };
};

export const hosts = (runtime) => [runtime, ...Object.values(runtime.daemons)];
export const flat = (held) => Object.values(held.modes).flatMap((type) => Object.values(type));
export const absolute = (held, m) => `${held.reference}/mode/${m.manifest.type}/${m.manifest.slug}`;

export const leafReferences = (runtime) =>
  hosts(runtime).flatMap((held) =>
    flat(held).flatMap((m) => {
      const out = [];
      const walk = (vector, steps) => {
        for (const [pattern, child] of vector.trie) {
          const next = [...steps, ...natures(pattern.nature)];
          if (child.effect) out.push(`${absolute(held, m)}/${next.join("/")}`);
          walk(child, next);
        }
      };
      walk(m.tools, []);
      return out;
    }),
  );

export const homes = (runtime) =>
  hosts(runtime).flatMap((held) => flat(held).map((m) => ({ host: held, mode: m, label: absolute(held, m) })));

export const print = (label, value) => console.log(`\n── ${label}\n${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`);
