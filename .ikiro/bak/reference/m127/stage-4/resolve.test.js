  it("P-colour: a placement wears its own colour, else its part's; a piece of neither wears none", () => {
    const painted = at("stool", { name: "plate.1", ref: "plate" });
    painted.trait.STAGED = { colour: "warning" };
    const held = new Map(
      [
        part("plate", { STAGED: { colour: "#e8590c" } }),
        part("bolt", {}),
        part("stool", {}),
        at("stool", { name: "plate.0", ref: "plate" }),
        painted,
        at("stool", { name: "bolt.0", ref: "bolt" }),
      ].map((one) => [one.slug, one]),
    );
    const colours = resolve(held, "stool").placements.map((one) => [one.slug, one.colour]);
    expect(colours).toEqual([
      ["stool.plate.0", "#e8590c"],
      ["stool.plate.1", "warning"],
      ["stool.bolt.0", undefined],
    ]);
  });

