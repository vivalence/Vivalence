import { specimen, v } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";

specimen.describe("Vector", () => {
  specimen.describe("construction", () => {
    specimen.it("creates with empty effects and trajectories", () => {
      const vector = new Vector();
      specimen.expect(vector.effects.size).toBe(0);
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
    specimen.it("registers effect", () => {
      const vector = new Vector();
      const f = () => {};
      vector.open("greet", f);
      specimen.expect(vector.effects.size).toBe(1);
    });

    specimen.it("decomposes multi-segment path", () => {
      const vector = new Vector();
      const f = () => {};
      vector.open("/users/:id", f);
      specimen.expect(vector.effects.size).toBe(0);
      specimen.expect(vector.trajectories.size).toBe(1);
      const branch = vector.branch("users");
      const effectPattern = Array.from(branch.effects.keys())[0];
      specimen.expect(effectPattern.nature).toBe(":id");
      specimen.expect(branch.effects.get(effectPattern)).toBe(f);
    });
  });

  specimen.describe("open with descriptor", () => {
    specimen.it("registers effect with object descriptor", () => {
      const vector = new Vector();
      const input = v.object({ limit: v.integer(), where: v.any() });
      const f = () => {};
      vector.open({ nature: "/feed", input, valence: "fetch items" }, f);

      const branch = vector.branch("feed");
      specimen.expect(branch).toBeDefined();
    });

    specimen.it("input lands on the leaf pattern", () => {
      const vector = new Vector();
      const input = v.object({ recall: v.string(), gameplay: v.string() });
      const f = () => {};
      vector.open({ nature: "/emit/literal", input }, f);

      const emit = vector.branch("emit");
      const pattern = Array.from(emit.effects.keys())[0];
      specimen.expect(pattern.nature).toBe("literal");
      specimen.expect(pattern.input).toBe(input);
      specimen.expect(emit.effects.get(pattern)).toBe(f);
    });

    specimen.it("registers effect with function descriptor", () => {
      const vector = new Vector();
      const input = v.object({ limit: v.integer() });
      const f = () => {};
      vector.open((s) => ({ nature: "/feed", input }), f);

      const branch = vector.branch("feed");
      specimen.expect(branch).toBeDefined();
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
    specimen.it("registers a null-keyed effect", () => {
      const vector = new Vector();
      const f = (ctx) => ctx.input;
      vector.affect(f);
      specimen.expect(vector.effects.size).toBe(1);
      specimen.expect(vector.effects.get(null)).toBe(f);
    });

    specimen.it("is chainable", () => {
      const vector = new Vector();
      specimen.expect(vector.affect(() => {})).toBe(vector);
    });

    specimen.it("sits alongside keyed effects without collision", () => {
      const vector = new Vector();
      const named = () => "named";
      const anon = () => "anon";
      vector.open("ping", named).affect(anon);
      specimen.expect(vector.effects.size).toBe(2);
      specimen.expect(vector.effects.get(null)).toBe(anon);
    });
  });
});
