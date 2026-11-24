// one placement as the stage seats it: the parent frame it composes, its own TRS, its colour
const node = (one, parents) => ({
  path: one.path,
  slug: one.slug,
  parentMatrix: parents.get(one.path),
  ...(one.translation && { translation: one.translation }),
  ...(one.rotation && { rotation: one.rotation }),
  ...(one.scale && { scale: one.scale }),
  ...(one.colour && { colour: one.colour }),
});

// every placement of a fold as the stage seats it, by path — what a step that poses a piece re-seats from
export const seats = (fold) => {
  const parents = frames(fold.placements);
  return Object.fromEntries(fold.placements.map((one) => [one.path, node(one, parents)]));
};

