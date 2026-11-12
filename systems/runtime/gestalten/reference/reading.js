import { belt, fromm, shape, Signal, Vector } from "@vivalence/typology";

export const { natures, within } = belt.reference;

const absolute = (owner, mode) =>
  `${owner.absolute}/mode/${mode.manifest.type}/${mode.manifest.slug}`;

export const home = (ctx) => absolute(ctx.reference, ctx.mode);

export const narrow = (ctx, reference) =>
  belt.reference.narrow(home(ctx), reference, ctx.thread.trait.HARNESSED.slugging);

export const readings = (ctx, reference) => {
  const [first, second, ...rest] = natures(reference);
  return [
    `${home(ctx)}${reference}`,
    `${ctx.reference.absolute}/mode${reference}`,
    ...(first === "runtime" ? [`${ctx.runtime.reference.absolute}/mode${new Signal([second, ...rest]).pathname}`] : []),
    ...(first === "daemon" ? [`/daemon/${second}/mode${new Signal(rest).pathname}`] : []),
    reference,
  ];
};

export const modes = (ctx) => [
  ...fromm.modes(ctx.runtime.modes).flat.map((mode) => ({
    mode,
    runtime: ctx.runtime,
    reference: absolute(ctx.runtime.reference, mode),
  })),
  ...Object.values(ctx.runtime.daemons).flatMap((daemon) =>
    fromm.modes(daemon.modes).flat.map((mode) => ({
      mode,
      daemon,
      reference: absolute(daemon.reference, mode),
    })),
  ),
];

export const covered = (ctx, reference) =>
  modes(ctx).filter((entry) => readings(ctx, reference).some((reading) => within(entry.reference, reading)));

const descend = (vector, nature) =>
  vector.edge(nature) ?? (vector.effect instanceof Vector ? vector.effect.edge(nature) : null);

const edged = (vector, steps) => steps.reduce((edge, nature) => (edge ? descend(edge[1], nature) : null), [null, vector]);

const reached = (ctx, reading, tree) =>
  modes(ctx)
    .filter((entry) => tree(entry.mode))
    .flatMap((entry) => {
      if (within(entry.reference, reading)) return [{ ...entry, vector: tree(entry.mode) }];
      if (!within(reading, entry.reference)) return [];
      const edge = edged(tree(entry.mode), natures(reading).slice(natures(entry.reference).length));
      return edge ? [{ ...entry, reference: reading, pattern: edge[0], vector: edge[1] }] : [];
    });

export const found = (ctx, reference, tree = (mode) => mode.tools) => {
  const matches = readings(ctx, reference).flatMap((reading) => reached(ctx, reading, tree));
  const named = Map.groupBy(matches, (entry) => narrow(ctx, entry.reference));
  // for (const [name, held] of named) if (new Set(held.map((entry) => entry.reference)).size > 1) console.log(name, "shadows", held.map((entry) => entry.reference));
  return [...named.values()].map((held) => held[0]);
};

export const keyed = (ctx, reference, tree = (mode) => mode.tools) => {
  const kept = found(ctx, reference, tree).map((entry) => entry.reference);
  const hits = readings(ctx, reference).filter((reading) =>
    reached(ctx, reading, tree).some((entry) => kept.includes(entry.reference)),
  );
  return hits.filter((reading) => !hits.some((other) => other !== reading && within(reading, other)));
};

export const listed = (vector, root) =>
  shape.primer.nodes(vector).map((node) => ({ reference: `${root}/${node.nature}`, valence: node.valence, load: node.load }));

export const index = (ctx) => ({
  TOOLED: modes(ctx)
    .filter((entry) => entry.mode.tools)
    .flatMap((entry) => listed(entry.mode.tools, entry.reference)),
  PRIMED: modes(ctx)
    .filter((entry) => entry.mode.primer)
    .flatMap((entry) => listed(entry.mode.primer, entry.reference)),
});

export const outline = (entry) =>
  entry.pattern
    ? [{ reference: entry.reference, valence: entry.pattern.valence }]
    : listed(entry.vector, entry.reference).map(({ reference, valence }) => ({ reference, valence }));

export const missed = (ctx, references, tree = (mode) => mode.tools) =>
  references.filter((reference) => !found(ctx, reference, tree).length);
