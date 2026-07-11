import { specimen, Vector, Aperture, Signal, steer, shape } from "@vivalence/typology";
const { expect, it, describe } = specimen;

// The root/empty/"/" signal (null-nature) addresses a node's OWN effect.
// "no path is a path" — branch("/") is the identity; open("/") ≡ affect().
// Construction: Vector.branch. Dispatch: traverse arrives at the node on a null segment.

describe("root-effect: branch identity (the rotation)", () => {
  it("branch('/') and branch('') return the node itself", () => {
    const v = new Vector();
    expect(v.branch("/")).toBe(v);
    expect(v.branch("")).toBe(v);
    expect(v.patterns.length).toBe(0);
  });
  it("open('/', fn) sets the root effect, no child", () => {
    const v = new Vector().open("/", async () => 1);
    expect(v.effect).not.toBe(null);
    expect(v.patterns.length).toBe(0);
  });
  it("open('/', fn) is equivalent to affect(fn)", async () => {
    const viaOpen = new Vector().open("/", async (i, c) => "R");
    const viaAffect = new Vector().affect(async (i, c) => "R");
    expect(await shape.object(viaOpen)({})).toBe("R");
    expect(await shape.object(viaAffect)({})).toBe("R");
  });
  it("'.' stays a named child (not root)", () => {
    const v = new Vector().open("/.", async () => 1);
    expect(v.patterns.map((p) => p.nature)).toEqual(["."]);
  });
});

describe("root-effect: dispatch arrives at the root", () => {
  const build = () => new Vector()
    .affect(async (body, c) => `ROOT:${body?.a}`)
    .open("/child", async (body, c) => `CHILD:${body?.b}`);

  it("invoke('') and invoke('/') hit the root effect", async () => {
    expect(await steer.dispatch.invoke(build(), "")({ a: 1 })).toBe("ROOT:1");
    expect(await steer.dispatch.invoke(build(), "/")({ a: 2 })).toBe("ROOT:2");
  });
  it("invoke('/child') still reaches the child", async () => {
    expect(await steer.dispatch.invoke(build(), "/child")({ b: 9 })).toBe("CHILD:9");
  });
  it("point vector invoke('') runs its middleware + effect", async () => {
    const trace = [];
    const p = new Vector()
      .use(async (ctx, next) => { trace.push("in"); await next(); trace.push("out"); })
      .affect(async (b, c) => `P:${b?.x}`);
    expect(await steer.dispatch.invoke(p, "")({ x: 5 })).toBe("P:5");
    expect(trace).toEqual(["in", "out"]);
  });
  it("scope stays a pure trajectory-matcher (root is the walker's job)", () => {
    expect(steer.match.scope(build(), new Signal("/")).length).toBe(0);
    expect(steer.match.scope(build(), new Signal("child")).length).toBe(1);
  });
});

describe("root-effect: Aperture root route via http", () => {
  it("GET / and GET /users both resolve", async () => {
    const api = new Aperture();
    api.get("/", async (i, c) => "INDEX");
    api.get("/users", async (i, c) => "USERS");
    const handler = shape.http(api);
    const call = async (path) => (await handler({
      method: "GET", url: `http://x${path}`,
      headers: new Headers({ "content-type": "application/json" }), json: async () => ({}),
    })).status;
    expect(await call("/")).toBe(200);
    expect(await call("/users")).toBe(200);
  });
});

describe("root-effect: object() stays callable-AND-namespace", () => {
  it("root callable + child namespace", async () => {
    const o = shape.object(new Vector().affect(async (b, c) => `R:${b?.a}`).open("/child", async (b, c) => `C:${b?.b}`));
    expect(await o({ a: 1 })).toBe("R:1");
    expect(await o.child({ b: 2 })).toBe("C:2");
  });
});
