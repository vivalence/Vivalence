  it("P-posed: a piece a step poses sits where the step says, what hangs under it follows; a piece it does not pose keeps its seat; the fold is not mutated", () => {
    const tree = {
      parts: {},
      placements: [
        { slug: "r", ref: "rig", path: "r", children: ["r/m"], translation: [1, 0, 0] },
        { slug: "m", ref: "motor", path: "r/m", parent: "r", children: [], translation: [0, 2, 0] },
        { slug: "n", ref: "motor", path: "n", children: [] },
      ],
    };
    const one = [step("h.01", [["r"]], { placements: [{ literal: "r", translation: [5, 0, 0], colour: "warning" }] })];
    const moved = posed(tree, staged(one, 1, tree));
    expect(moved.placements.map((held) => held.translation)).toEqual([[5, 0, 0], [0, 2, 0], undefined]);
    expect(seats(moved)["r/m"].parentMatrix.slice(12, 15)).toEqual([5, 0, 0]);
    expect(seats(posed(tree, staged(one, 0, tree)))["r/m"].parentMatrix.slice(12, 15)).toEqual([1, 0, 0]);
    expect(seats(moved).n).toEqual({ path: "n", slug: "n", parentMatrix: IDENTITY });
    expect(tree.placements[0].translation).toEqual([1, 0, 0]);
  });

  it("P-pins: a label on each piece a step says so of, by the piece's own name, reaching what is under it; a callout for each anchored note, its tone from its kind; a note without an anchor pins nothing", () => {
    const tree = {
      parts: { rig: { LABELED: { name: "Rig" } }, motor: {} },
      placements: [
        { slug: "r", ref: "rig", name: "rig.0", path: "r", children: ["r/m"] },
        { slug: "m", ref: "motor", name: "motor.0", path: "r/m", parent: "r", children: [] },
      ],
    };
    const one = [step("h.01", [["r"]], { placements: [{ literal: "r", label: true }, { literal: "m", label: true, status: "ghost" }] })];
    const notes = [
      { text: "plain, in the panel" },
      { text: "Arrow to the front.", kind: "ORIENTATION", images: ["manual/a.webp"], at: { literals: ["r"], offset: [0, 0.02, 0] } },
      { text: "A tip.", kind: "TIP", at: { position: [0, 1, 0] } },
    ];
    expect(pins(one, 1, tree, notes)).toEqual([
      { id: "label:r", tone: "label", text: "Rig", literals: ["r", "m"] },
      { id: "label:m", tone: "label", text: "motor.0", literals: ["m"] },
      { id: "note:1", tone: "warning", text: "Arrow to the front.", images: ["manual/a.webp"], literals: ["r", "m"], offset: [0, 0.02, 0] },
      { id: "note:2", tone: "tip", text: "A tip.", images: [], position: [0, 1, 0], literals: [] },
    ]);
    expect(pins(one, 0, tree)).toEqual([]);
    expect([{ kind: "TIP" }, { kind: "LOOSE" }, {}].map(tone)).toEqual(["tip", "warning", "plain"]);
  });

