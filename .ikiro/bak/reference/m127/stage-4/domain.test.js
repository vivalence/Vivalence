  it("P-coloured: /part and /placement take a colour into STAGED beside what it holds; null takes it off; absent leaves STAGED alone; the verb refuses what is no colour", async () => {
    const said = [];
    const repository = (held) =>
      Object.assign({}, ...domain.traits.literal.map((trait) => trait.repository), {
        findOne: async () => held,
        named: async (slug) => ({ slug, ontology: "part" }),
        closure: async () => new Map(),
        uses: async () => {},
        em: { flush: async () => {} },
        over: async (kind, slug, carried, trait) => said.push({ kind, carried, trait }),
      });
    const worn = { ontology: "part", trait: { LABELED: { name: "Hinge" }, STAGED: { colour: "warning", explode: 0.2 } } };
    await repository(worn).part({ slug: "hinge", colour: "#e8590c" });
    await repository(worn).part({ slug: "hinge", colour: null });
    await repository(worn).part({ slug: "hinge", qty: 4 });
    await repository(null).placement({ layer: "tail", name: "hinge.0", ref: "hinge", colour: "info" });
    expect(said.map((one) => [one.kind, one.carried, one.trait.STAGED])).toEqual([
      ["part", ["STAGED"], { explode: 0.2, colour: "#e8590c" }],
      ["part", ["STAGED"], { explode: 0.2 }],
      ["part", ["COUNTED"], undefined],
      ["placement", ["LABELED", "PLACED", "STAGED"], { colour: "info" }],
    ]);
    expect(worn.trait.STAGED).toEqual({ colour: "warning", explode: 0.2 });
    const input = v.object(schematics.VERBS.part);
    const refused = (colour) => [...input.errors({ slug: "hinge", colour })].length > 0;
    expect(["#e8590c", "warning", null, "orange", "#FFF"].map(refused)).toEqual([false, false, false, true, true]);
  });

