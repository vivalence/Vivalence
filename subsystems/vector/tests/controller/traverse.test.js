import { Signal } from "@vivalence/typology";
import { assertEquals, assertThrows } from "$std/assert";
import { Vector } from "../../vector.js";
import { traverse } from "../../controller/traverse.js";

Deno.test("traverse function finds effect", () => {
  const vector = new Vector();
  const mockEffect = () => "test effect";
  vector.open("/users/:id", mockEffect);

  const signals = new Signal("/users/123");
  const [effect, middlewares, path, finalVector] = traverse(vector, signals);

  assertEquals(effect, mockEffect);
  assertEquals(path.length, 2);
});

Deno.test("traverse function with nested descendants", () => {
  const vector = new Vector();
  const mockEffect = () => "profile effect";
  vector.branch("/api").branch("/users").open("/:id/profile", mockEffect);

  const signals = new Signal("/api/users/123/profile");
  const [effect, middlewares, path, finalVector] = traverse(vector, signals);

  assertEquals(effect, mockEffect);
  assertEquals(path.length, 4);
});

Deno.test("traverse function collects and chains middlewares", async () => {
  const vector = new Vector();
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
    log.push(input);

    return "result";
  };

  vector
    .use(middleware1)
    .branch("/api")
    .use(middleware2)
    .open("/test", mockEffect);

  const signals = new Signal("/api/test");

  const [effect, composed, steps] = traverse(vector, signals);
  const context = { input: "input handled" };
  await composed(context, async (ctx) => {
    ctx.result = await effect(ctx.input, ctx);
  });

  assertEquals(log, [
    "auth start",
    "validate start",
    "effect executed",
    "input handled",
    "validate end",
    "auth end",
  ]);
  assertEquals(context.result, "result");
  assertEquals(steps.length, 2);
});

Deno.test("traverse function throws on no match", () => {
  const vector = new Vector();
  const signals = new Signal("/nonexistent");

  assertThrows(() => traverse(vector, signals), Error, "Not found");
});
