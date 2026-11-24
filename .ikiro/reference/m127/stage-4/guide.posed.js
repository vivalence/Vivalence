// the fold as this step seats it: a piece the step poses sits where the step says, in its parent's frame;
// what hangs under it follows through the frames
export const POSE = ["translation", "rotation", "scale"];
export const posed = (fold, said) => ({
  ...fold,
  placements: fold.placements.map((one) => ({
    ...one,
    ...Object.fromEntries(POSE.filter((key) => said[one.slug]?.[key]).map((key) => [key, said[one.slug][key]])),
  })),
});

// a callout's tone: a tip, a warning (any other kind), or plain
export const tone = (note) => (note.kind === "TIP" ? "tip" : note.kind ? "warning" : "plain");

// what a step pins on the stage: a label on each piece it says so of, the piece's own name; a callout for
// each note with an anchor. a pin reaches every piece under what it names
export const pins = (steps, step, fold, notes = []) => {
  const placed = new Map(fold.placements.map((one) => [one.slug, one]));
  const name = (one) => fold.parts[one.ref]?.LABELED?.name ?? one.name;
  const under = (literals) => literals.flatMap((literal) => expand(literal, steps, fold));

  const labels = Object.entries(staged(steps, step, fold))
    .filter(([slug, said]) => said.label && placed.has(slug))
    .map(([slug]) => ({ id: `label:${slug}`, tone: "label", text: name(placed.get(slug)), literals: under([slug]) }));

  const callouts = notes.flatMap((note, k) => {
    if (!note.at) return [];
    const literals = under(note.at.literals ?? []);
    return [{ id: `note:${k}`, tone: tone(note), text: note.text, images: note.images ?? [], ...note.at, literals }];
  });

  return [...labels, ...callouts];
};

