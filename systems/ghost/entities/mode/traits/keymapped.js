import { Vector, steer } from "@vivalence/typology";

const bound = (mode, keymap) =>
  steer.trie.rollup(keymap, (carry, effect) => effect).reduce(
    (vector, { steps, fn: effect }) =>
      vector.open(
        { nature: steps.map((step) => step.nature).join("/"), valence: steps.at(-1).valence },
        (ctx) => steer.strategy.fire(effect, Object.assign(ctx, { mode })),
      ),
    new Vector(),
  );

export const KEYMAPPED = (mode) => {
  if (mode.module === null) throw new Error(`[keymapped] ${mode.reference.absolute}: a remote mode's keymap rides its view module, which m87's view.load has not landed`);
  mode.keymap.graft(bound(mode, mode.module.keymap));
};
