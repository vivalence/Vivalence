import { assertEquals, assertThrows, assertRejects } from "$std/assert";
import { sig } from "../../parser/index.js";
import { Vector } from "../../vector.js";
import { walk } from "../../controller/walk.js";

Deno.test("walk function finds effect in single step", async () => {
  const vector = new Vector([sig]);
  const mockEffect = () => "test effect";
  vector.open("/users/:id", mockEffect);

  const getSignal = (patterns) => Promise.resolve(sig.signal("/users/123"));

  const [effect, bundle, finalVector, steps] = await walk(vector, getSignal);

  assertEquals(effect, mockEffect);
  assertEquals(steps.length, 2);
});

Deno.test("walk function navigates through multiple steps", async () => {
  const vector = new Vector([sig]);
  const mockEffect = () => "profile effect";
  vector.branch("/api").branch("/users").open("/:id/profile", mockEffect);

  let callCount = 0;
  const getSignal = (patterns) => {
    callCount++;
    if (callCount === 1) return Promise.resolve(sig.signal("/api"));
    if (callCount === 2) return Promise.resolve(sig.signal("/users"));
    if (callCount === 3) return Promise.resolve(sig.signal("/123/profile"));
    return Promise.resolve([]);
  };

  const [effect, bundle, finalVector, steps] = await walk(vector, getSignal);

  assertEquals(effect, mockEffect);
  assertEquals(callCount, 3);
  assertEquals(steps.length, 4);
});

Deno.test("walk function composes middlewares across steps", async () => {
  const vector = new Vector([sig]);
  const log = [];

  const middleware1 = async (context, next) => {
    log.push("auth start");
    await next();
    log.push("auth end");
  };

  const middleware2 = async (context, next) => {
    log.push("validate start");
    await next();
    log.push("validate end");
  };

  const mockEffect = async (input, context) => {
    log.push("effect executed");
    return "result";
  };

  vector
    .use(middleware1)
    .branch("/api")
    .use(middleware2)
    .open("/test", mockEffect);

  let step = 0;
  const getSignal = (patterns) => {
    step++;
    if (step === 1) return Promise.resolve(sig.signal("/api"));
    if (step === 2) return Promise.resolve(sig.signal("/test"));
    return Promise.resolve([]);
  };

  const [effect, bundle, destination, steps] = await walk(vector, getSignal);

  const context = { input: "test input" };
  await bundle(context, async (ctx) => {
    ctx.result = await effect(ctx.input, ctx);
  });

  assertEquals(context.result, "result");
  assertEquals(log, [
    "auth start",
    "validate start",
    "effect executed",
    "validate end",
    "auth end",
  ]);
  assertEquals(steps.length, 2);
});

Deno.test("walk function throws on max steps", async () => {
  const vector = new Vector([sig]);

  let v = vector;
  for (let i = 0; i < 20; i++) {
    v = v.branch("/:step");
  }

  const getSignal = (patterns) => Promise.resolve(sig.signal("/next"));

  assertRejects(async () => await walk(vector, getSignal), Error, "Max steps");
});

Deno.test("walk function throws on no signals", async () => {
  const vector = new Vector([sig]);
  const getSignal = (patterns) => Promise.resolve([]);

  assertRejects(
    async () => await walk(vector, getSignal),
    Error,
    "No more signals",
  );
});

Deno.test("walk function with contextual signal generation", async () => {
  const vector = new Vector([sig]);
  vector
    .branch("/search")
    .branch("/:query")
    .open("/results", () => "search results");

  const getSignal = (patterns) => {
    const hasSearch = patterns.some((p) => p.signature === "search");
    const hasQuery = patterns.some(
      (p) => p.signature && p.signature.startsWith(":"),
    );
    const hasResults = patterns.some((p) => p.signature === "results");

    if (hasSearch) return Promise.resolve(sig.signal("/search"));
    if (hasQuery) return Promise.resolve(sig.signal("/javascript"));
    if (hasResults) return Promise.resolve(sig.signal("/results"));

    return Promise.resolve([]);
  };

  const [effect, bundle, finalVector, steps] = await walk(vector, getSignal);

  assertEquals(typeof effect, "function");
  assertEquals(steps.length, 3);
  assertEquals(steps[1].params.query, "javascript");
});
