import { assertEquals } from "$std/assert";
import { compose, chain, forward } from "../../middleware.js";

Deno.test("compose middleware executes in order", async () => {
  const log = [];

  const middleware1 = async (context, next) => {
    log.push("before1");
    await next();
    log.push("after1");
  };

  const middleware2 = async (context, next) => {
    log.push("before2");
    await next();
    log.push("after2");
  };

  const finalHandler = async (ctx) => {
    log.push("handler");
    ctx.result = "result";
  };

  const composed = compose([middleware1, middleware2]);
  const context = {};
  await composed(context, finalHandler);

  assertEquals(log, ["before1", "before2", "handler", "after2", "after1"]);
  assertEquals(context.result, "result");
});

Deno.test("chain combines two middleware functions", async () => {
  const log = [];

  const first = async (context, next) => {
    log.push("first");
    await next();
  };

  const second = async (context, next) => {
    log.push("second");
    await next();
  };

  const finalHandler = async (context) => {
    log.push("final");
    return "done";
  };

  const chained = chain(first, second);
  await chained({}, finalHandler);

  assertEquals(log, ["first", "second", "final"]);
});

Deno.test("next middleware passes through", async () => {
  const finalHandler = async (context) => {
    return "passed";
  };

  const result = await forward({}, finalHandler);
  assertEquals(result, "passed");
});
