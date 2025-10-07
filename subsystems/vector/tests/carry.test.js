import { assertEquals } from "$std/assert";
import { compose, chain, forward } from "../../carry.js";

Deno.test("compose carry executes in order", async () => {
  const log = [];

  const carry1 = async (context, next) => {
    log.push("before1");
    await next();
    log.push("after1");
  };

  const carry2 = async (context, next) => {
    log.push("before2");
    await next();
    log.push("after2");
  };

  const finalHandler = async (ctx) => {
    log.push("handler");
    ctx.result = "result";
  };

  const composed = compose([carry1, carry2]);
  const context = {};
  await composed(context, finalHandler);

  assertEquals(log, ["before1", "before2", "handler", "after2", "after1"]);
  assertEquals(context.result, "result");
});

Deno.test("chain combines two carry functions", async () => {
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

Deno.test("next carry passes through", async () => {
  const finalHandler = async (context) => {
    return "passed";
  };

  const result = await forward({}, finalHandler);
  assertEquals(result, "passed");
});
