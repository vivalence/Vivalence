import { specimen, v } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";

specimen.describe("Vector", () => {
  specimen.describe("construction", () => {
    specimen.it("creates with empty effect and trajectories", () => {
      const vector = new Vector();
      specimen.expect(vector.effect).toBe(null);
      specimen.expect(vector.trajectories.size).toBe(0);
      specimen.expect(vector.carry).toEqual([]);
    });
  });

  specimen.describe("branch", () => {
    specimen.it("creates trajectory", () => {
      const vector = new Vector();
      const branch = vector.branch("users");
      specimen.expect(vector.trajectories.size).toBe(1);
      specimen.expect(branch).toBeInstanceOf(Vector);
    });

    specimen.it("merges by hash", () => {
      const vector = new Vector();
      const a = vector.branch("users");
      const b = vector.branch("users");
      specimen.expect(a).toBe(b);
      specimen.expect(vector.trajectories.size).toBe(1);
    });

    specimen.it("separates distinct branches", () => {
      const vector = new Vector();
      const users = vector.branch("users");
      const posts = vector.branch("posts");
      specimen.expect(users).not.toBe(posts);
      specimen.expect(vector.trajectories.size).toBe(2);
    });
  });

  specimen.describe("open", () => {
    specimen.it("registers effect on a leaf trajectory", () => {
      const vector = new Vector();
      const f = () => {};
      vector.open("greet", f);
      specimen.expect(vector.trajectories.size).toBe(1);
      specimen.expect(vector.branch("greet").effect).toBe(f);
    });

    specimen.it("decomposes multi-segment path", () => {
      const vector = new Vector();
      const f = () => {};
      vector.open("/users/:id", f);
      specimen.expect(vector.trajectories.size).toBe(1);
      const users = vector.branch("users");
      specimen.expect(users.trajectories.size).toBe(1);
      const id = [...users.trajectories.keys()][0];
      specimen.expect(id.nature).toBe(":id");
      specimen.expect(users.branch(":id").effect).toBe(f);
    });

    specimen.it("overwrites on re-open (last-wins)", () => {
      const vector = new Vector();
      const a = () => "a";
      const b = () => "b";
      vector.open("x", a).open("x", b);
      specimen.expect(vector.branch("x").effect).toBe(b);
    });
  });

  specimen.describe("open with descriptor", () => {
    specimen.it("registers effect with object descriptor", () => {
      const vector = new Vector();
      const input = v.object({ limit: v.integer(), where: v.any() });
      const f = () => {};
      vector.open({ nature: "/feed", input, valence: "fetch items" }, f);
      specimen.expect(vector.branch("feed")).toBeDefined();
    });

    specimen.it("input lands on the leaf trajectory key", () => {
      const vector = new Vector();
      const input = v.object({ recall: v.string(), gameplay: v.string() });
      const f = () => {};
      vector.open({ nature: "/emit/literal", input }, f);
      const emit = vector.branch("emit");
      const pattern = [...emit.trajectories.keys()][0];
      specimen.expect(pattern.nature).toBe("literal");
      specimen.expect(pattern.input).toBe(input);
      specimen.expect(emit.branch("literal").effect).toBe(f);
    });

    specimen.it("registers effect with function descriptor", () => {
      const vector = new Vector();
      const input = v.object({ limit: v.integer() });
      const f = () => {};
      vector.open((s) => ({ nature: "/feed", input }), f);
      specimen.expect(vector.branch("feed")).toBeDefined();
    });
  });

  specimen.describe("use", () => {
    specimen.it("pushes middleware to carry", () => {
      const vector = new Vector();
      const mw1 = async (_, next) => next();
      const mw2 = async (_, next) => next();
      vector.use(mw1).use(mw2);
      specimen.expect(vector.carry.length).toBe(2);
      specimen.expect(vector.carry[0]).toBe(mw1);
      specimen.expect(vector.carry[1]).toBe(mw2);
    });

    specimen.it("does not inherit to branches", () => {
      const vector = new Vector();
      vector.use(async (_, next) => next());
      const branch = vector.branch("test");
      specimen.expect(branch.carry.length).toBe(0);
    });
  });

  specimen.describe("affect", () => {
    specimen.it("sets the node's singular effect", () => {
      const vector = new Vector();
      const f = (ctx) => ctx.input;
      vector.affect(f);
      specimen.expect(vector.effect).toBe(f);
    });

    specimen.it("is chainable", () => {
      const vector = new Vector();
      specimen.expect(vector.affect(() => {})).toBe(vector);
    });

    specimen.it("a node is both leaf and branch", () => {
      const vector = new Vector();
      const named = () => "named";
      const anon = () => "anon";
      vector.open("ping", named).affect(anon);
      specimen.expect(vector.effect).toBe(anon);
      specimen.expect(vector.branch("ping").effect).toBe(named);
    });
  });
});

specimen.describe("Vector: slurp invariants", () => {
  specimen.it("leaves the SOURCE vector unmutated", () => {
    const src = new Vector().open("/a", () => 1).open("/b/c", () => 2);
    const before = {
      effect: src.effect,
      carry: src.carry.length,
      trajectories: src.trajectories.size,
    };
    new Vector().slurp(src);
    specimen.expect(src.effect).toBe(before.effect);
    specimen.expect(src.carry.length).toBe(before.carry);
    specimen.expect(src.trajectories.size).toBe(before.trajectories);
  });
});

specimen.describe("Vector: slurp shares, swallow owns", () => {
  const trial = (merge) => {
    const src = new Vector().open("/shared/a", () => "src-a");
    const dest = new Vector();
    dest[merge](src);
    dest.branch("shared").open("b", () => "dest-b");
    const srcShared = [...src.trajectories.values()][0];
    return [...srcShared.trajectories.keys()].some((pattern) => pattern.nature === "b");
  };

  specimen.it("slurp shares the branch — edit leaks into src (by design)", () => {
    specimen.expect(trial("slurp")).toBe(true);
  });

  specimen.it("swallow owns the branch — src stays clean", () => {
    specimen.expect(trial("swallow")).toBe(false);
  });
});
