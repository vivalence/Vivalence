import { specimen, v, Vector } from "@vivalence/typology";

specimen.describe("Vector", () => {
  specimen.it("a vector grows its trie and merges by nature", () => {
    const vector = new Vector();
    specimen.expect(vector.effect).toBe(null);
    specimen.expect(vector.trie.size).toBe(0);
    specimen.expect(vector.carry).toEqual([]);

    const users = vector.branch("users");
    specimen.expect(users).toBeInstanceOf(Vector);
    specimen.expect(vector.trie.size).toBe(1);
    specimen.expect(vector.branch("users")).toBe(users);
    specimen.expect(vector.trie.size).toBe(1);

    const posts = vector.branch("posts");
    specimen.expect(users).not.toBe(posts);
    specimen.expect(vector.trie.size).toBe(2);
  });

  specimen.it("an effect opens onto a leaf", () => {
    const flat = new Vector();
    const greeting = () => {};
    flat.open("greet", greeting);
    specimen.expect(flat.trie.size).toBe(1);
    specimen.expect(flat.branch("greet").effect).toBe(greeting);

    const deep = new Vector();
    const fetchUser = () => {};
    deep.open("/users/:id", fetchUser);
    specimen.expect(deep.trie.size).toBe(1);
    const users = deep.branch("users");
    specimen.expect(users.trie.size).toBe(1);
    specimen.expect(users.patterns[0].nature).toBe(":id");
    specimen.expect(users.branch(":id").effect).toBe(fetchUser);

    const contested = new Vector();
    const first = () => "a";
    const second = () => "b";
    contested.open("x", first).open("x", second);
    specimen.expect(contested.branch("x").effect).toBe(second);

    const dual = new Vector();
    const namedEffect = () => "named";
    const anonymousEffect = () => "anon";
    specimen.expect(dual.open("ping", namedEffect).affect(anonymousEffect)).toBe(dual);
    specimen.expect(dual.effect).toBe(anonymousEffect);
    specimen.expect(dual.branch("ping").effect).toBe(namedEffect);
  });

  specimen.it("a descriptor dresses the edge", () => {
    const described = new Vector();
    const feedInput = v.object({ limit: v.integer(), where: v.any() });
    described.open({ nature: "/feed", input: feedInput, valence: "fetch items" }, () => {});
    specimen.expect(described.branch("feed")).toBeDefined();

    const edged = new Vector();
    const emitInput = v.object({ recall: v.string(), gameplay: v.string() });
    const emitEffect = () => {};
    edged.open({ nature: "/emit/literal", input: emitInput }, emitEffect);
    const emit = edged.branch("emit");
    const pattern = emit.patterns[0];
    specimen.expect(pattern.nature).toBe("literal");
    specimen.expect(pattern.input).toBe(emitInput);
    specimen.expect(emit.branch("literal").effect).toBe(emitEffect);

    const functional = new Vector();
    const limitInput = v.object({ limit: v.integer() });
    functional.open(() => ({ nature: "/feed", input: limitInput }), () => {});
    specimen.expect(functional.branch("feed")).toBeDefined();
  });

  specimen.it("middleware rides the carry, never the branches", () => {
    const vector = new Vector();
    const firstMiddleware = async (context, next) => next();
    const secondMiddleware = async (context, next) => next();
    vector.use(firstMiddleware).use(secondMiddleware);
    specimen.expect(vector.carry.length).toBe(2);
    specimen.expect(vector.carry[0]).toBe(firstMiddleware);
    specimen.expect(vector.carry[1]).toBe(secondMiddleware);
    specimen.expect(vector.branch("test").carry.length).toBe(0);
  });

  specimen.it("slurp shares what swallow owns", () => {
    const source = new Vector().open("/a", () => 1).open("/b/c", () => 2);
    const before = {
      effect: source.effect,
      carry: source.carry.length,
      trie: source.trie.size,
    };
    new Vector().slurp(source);
    specimen.expect(source.effect).toBe(before.effect);
    specimen.expect(source.carry.length).toBe(before.carry);
    specimen.expect(source.trie.size).toBe(before.trie);

    const leaked = (merge) => {
      const shared = new Vector().open("/shared/a", () => "source-a");
      const destination = new Vector();
      destination[merge](shared);
      destination.branch("shared").open("b", () => "destination-b");
      const sharedBranch = shared.descendants[0];
      return sharedBranch.patterns.some((pattern) => pattern.nature === "b");
    };
    specimen.expect(leaked("slurp")).toBe(true);
    specimen.expect(leaked("swallow")).toBe(false);
  });

  specimen.it("slurp collision: later wins on effect AND edge, both sources unmutated", () => {
    const base = new Vector().open(
      { nature: "/literal/find", valence: "plain prose", input: { base: true } },
      () => "base",
    );
    const override = new Vector().open(
      { nature: "/literal/find", valence: "rich prose" },
      () => "override",
    );

    const armed = new Vector().slurp(base).slurp(override);

    const findNode = (vector) => {
      const literal = vector.descendants[0];
      const { pattern, trajectory } = [...literal.trie.values()][0];
      return [pattern, trajectory];
    };

    const [edge, node] = findNode(armed);
    specimen.expect(node.effect()).toBe("override");
    specimen.expect(edge.valence).toBe("rich prose");

    const [baseEdge, baseNode] = findNode(base);
    specimen.expect(baseNode.effect()).toBe("base");
    specimen.expect(baseEdge.valence).toBe("plain prose");
    specimen.expect(baseEdge.input).toEqual({ base: true });

    const [overrideEdge, overrideNode] = findNode(override);
    specimen.expect(overrideNode.effect()).toBe("override");
    specimen.expect(overrideEdge.valence).toBe("rich prose");
  });

  specimen.it("self-slurp is a no-op, never a loop", () => {
    const vector = new Vector().open({ nature: "/find", valence: "prose" }, () => "self");
    specimen.expect(vector.slurp(vector)).toBe(vector);
    specimen.expect(vector.trie.size).toBe(1);
    const node = vector.descendants[0];
    specimen.expect(node.effect()).toBe("self");
  });

  specimen.it("the trie keys by nature: one edge per sibling nature, declaration order immovable — a collision holds its slot", () => {
    const vector = new Vector();
    vector.branch("first");
    vector.branch(":param");
    vector.branch("first");
    specimen.expect(vector.trie.size).toBe(2);
    specimen.expect([...vector.trie.keys()]).toEqual(["first", ":param"]);
    specimen.expect(vector.patterns.map((pattern) => pattern.nature)).toEqual(["first", ":param"]);

    const base = new Vector().open("/a", () => 1).open("/b", () => 2);
    const override = new Vector().open("/a", () => 3);
    const merged = new Vector().slurp(base).slurp(override);
    specimen.expect([...merged.trie.keys()]).toEqual(["a", "b"]);
    specimen.expect(merged.branch("a").effect()).toBe(3);
  });

  specimen.it("slurp collision keeps the earlier effect when the later side has none", () => {
    const base = new Vector().open({ nature: "/find" }, () => "base");
    const branchOnly = new Vector();
    branchOnly.branch("/find").branch("deep");

    const merged = new Vector().slurp(base).slurp(branchOnly);
    const node = merged.descendants[0];
    specimen.expect(node.effect()).toBe("base");
    specimen.expect(node.patterns.some((edge) => edge.nature === "deep")).toBe(true);
  });
});
