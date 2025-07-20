import { assertEquals, assertThrows } from "$std/assert";
import { Vector } from "../vector.js";
import { sig } from "../parser/index.js";

function createTestVector() {
  const vector = new Vector([sig]);

  vector
    .branch("/users")
    .open("/profile", async (input, ctx) => ({ user: input.id }))
    .open("/:id", async (input, ctx) => ({ id: input.id }));

  vector
    .branch("/posts")
    .open("/create", async (input, ctx) => ({ created: true }))
    .open("/:postId", async (input, ctx) => ({ post: input.postId }));

  return vector;
}

Deno.test("Vector instantiation and parser setup", () => {
  const vector = new Vector(sig);

  assertEquals(vector.parsers.length, 1);
  assertEquals(vector.parsers[0], sig);
  assertEquals(vector.effects.size, 0);
  assertEquals(vector.descendants.size, 0);
  assertEquals(vector.middlewares.length, 0);
});

Deno.test("Vector branch creation and descendant tracking", () => {
  const vector = createTestVector();

  assertEquals(vector.descendants.size, 2);

  const usersBranch = vector.branch("/users");
  const postsBranch = vector.branch("/posts");

  assertEquals(usersBranch.effects.size, 2);
  assertEquals(postsBranch.effects.size, 2);
  assertEquals(usersBranch !== postsBranch, true);
});

Deno.test("Vector hash-based branch merging", () => {
  const vector = new Vector([sig]);

  const branch1 = vector.branch("/users");
  const branch2 = vector.branch("/users");

  assertEquals(branch1 === branch2, true);
  assertEquals(vector.descendants.size, 1);

  branch1.open("/test", async () => ({ test: true }));

  assertEquals(branch2.effects.size, 1);
});

Deno.test("Vector effect registration with open method", () => {
  const vector = new Vector([sig]);
  const testEffect = async (input, ctx) => ({ result: "test" });

  vector.open("/users/:id", testEffect);

  const patterns = vector.patterns;
  assertEquals(patterns.length, 1);

  const usersBranch = vector.branch("/users");
  assertEquals(usersBranch.effects.size, 1);

  const effectPattern = Array.from(usersBranch.effects.keys())[0];
  assertEquals(effectPattern.segment, ":id");
  assertEquals(usersBranch.effects.get(effectPattern), testEffect);
});

Deno.test("Vector middleware registration and chaining", () => {
  const vector = new Vector([sig]);
  const middleware1 = async (input, ctx, next) => {
    ctx.step1 = true;
    return next();
  };
  const middleware2 = async (input, ctx, next) => {
    ctx.step2 = true;
    return next();
  };

  vector.use(middleware1).use(middleware2);

  assertEquals(vector.middlewares.length, 2);
  assertEquals(vector.middlewares[0], middleware1);
  assertEquals(vector.middlewares[1], middleware2);

  const branch = vector.branch("/test");
  assertEquals(branch.middlewares.length, 0);
});
