import { specimen, v, Vector } from "@vivalence/typology";

specimen.describe("Vector", () => {
  specimen.it("a vector grows trajectories and merges by hash", () => {
    const vector = new Vector();
    specimen.expect(vector.effect).toBe(null);
    specimen.expect(vector.trajectories.size).toBe(0);
    specimen.expect(vector.carry).toEqual([]);

    const users = vector.branch("users");
    specimen.expect(users).toBeInstanceOf(Vector);
    specimen.expect(vector.trajectories.size).toBe(1);
    specimen.expect(vector.branch("users")).toBe(users);
    specimen.expect(vector.trajectories.size).toBe(1);

    const posts = vector.branch("posts");
    specimen.expect(users).not.toBe(posts);
    specimen.expect(vector.trajectories.size).toBe(2);
  });

  specimen.it("an effect opens onto a leaf", () => {
    const flat = new Vector();
    const greeting = () => {};
    flat.open("greet", greeting);
    specimen.expect(flat.trajectories.size).toBe(1);
    specimen.expect(flat.branch("greet").effect).toBe(greeting);

    const deep = new Vector();
    const fetchUser = () => {};
    deep.open("/users/:id", fetchUser);
    specimen.expect(deep.trajectories.size).toBe(1);
    const users = deep.branch("users");
    specimen.expect(users.trajectories.size).toBe(1);
    specimen.expect([...users.trajectories.keys()][0].nature).toBe(":id");
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
    const pattern = [...emit.trajectories.keys()][0];
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
      trajectories: source.trajectories.size,
    };
    new Vector().slurp(source);
    specimen.expect(source.effect).toBe(before.effect);
    specimen.expect(source.carry.length).toBe(before.carry);
    specimen.expect(source.trajectories.size).toBe(before.trajectories);

    const leaked = (merge) => {
      const shared = new Vector().open("/shared/a", () => "source-a");
      const destination = new Vector();
      destination[merge](shared);
      destination.branch("shared").open("b", () => "destination-b");
      const sharedBranch = [...shared.trajectories.values()][0];
      return [...sharedBranch.trajectories.keys()].some((pattern) => pattern.nature === "b");
    };
    specimen.expect(leaked("slurp")).toBe(true);
    specimen.expect(leaked("swallow")).toBe(false);
  });
});
