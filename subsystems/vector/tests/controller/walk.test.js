import { assertEquals, assertRejects } from "@std/assert";
import { Signal } from "@vivalence/typology";
import { Vector } from "../../vector.js";
import { walk } from "../../controller/walk.js";

// Test prototypes
const createMockEffect = (name) => () => `${name} effect`;
const createSignalGenerator = (...paths) => {
  let index = 0;
  return () =>
    Promise.resolve(index < paths.length ? new Signal(paths[index++]) : []);
};

Deno.test("walk finds effect in single step", async () => {
  const vector = new Vector();
  const effect = createMockEffect("test");
  vector.open("/users/:id", effect);

  const [foundEffect, , steps] = await walk(
    vector,
    createSignalGenerator("/users/123"),
  );

  assertEquals(foundEffect, effect);
  assertEquals(steps.length, 2);
});

Deno.test("walk navigates multiple steps", async () => {
  const vector = new Vector();
  const effect = createMockEffect("profile");
  vector.branch("/api").branch("/users").open("/:id/profile", effect);

  const [foundEffect, , steps] = await walk(
    vector,
    createSignalGenerator("/api", "/users", "/123/profile"),
  );

  assertEquals(foundEffect, effect);
  assertEquals(steps.length, 4);
});

Deno.test("walk composes middlewares across steps", async () => {
  const vector = new Vector();
  const log = [];

  vector
    .use(async (ctx, next) => {
      log.push("start");
      await next();
      log.push("end");
    })
    .branch("/api")
    .use(async (ctx, next) => {
      log.push("validate");
      await next();
    })
    .open("/test", () => {
      log.push("effect");
      return "result";
    });

  const [effect, middleware] = await walk(
    vector,
    createSignalGenerator("/api", "/test"),
  );

  const context = {};
  await middleware(context, async () => {
    context.result = effect();
  });

  assertEquals(context.result, "result");
  assertEquals(log, ["start", "validate", "effect", "end"]);
});

Deno.test("walk throws on limits", async () => {
  const vector = new Vector();

  assertRejects(() => walk(vector, () => Promise.resolve([])));
  assertRejects(() =>
    walk(vector, () => Promise.resolve(new Signal("/infinite"))),
  );
});
