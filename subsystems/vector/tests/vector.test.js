import { assertEquals, assertThrows } from "@std/assert";
import { Vector } from "@vivalence/vector";

function createTestVector() {
  const vector = new Vector();

  vector
    .branch("/users")
    .open("/profile", async (ctx) => ({ user: input.id }))
    .open("/:id", async (ctx) => ({ id: input.id }));

  vector
    .branch("/posts")
    .open("/create", async (ctx) => ({ created: true }))
    .open("/:postId", async (ctx) => ({ post: input.postId }));

  return vector;
}

Deno.test("Vector branch creation and descendant tracking", () => {
  const vector = createTestVector();

  assertEquals(vector.trajectories.size, 2);

  const usersBranch = vector.branch("/users");
  const postsBranch = vector.branch("/posts");

  assertEquals(usersBranch.effects.size, 2);
  assertEquals(postsBranch.effects.size, 2);
  assertEquals(usersBranch !== postsBranch, true);
});

Deno.test("Vector hash-based branch merging", () => {
  const vector = new Vector();

  const branch1 = vector.branch("/users");
  const branch2 = vector.branch("/users");

  assertEquals(branch1 === branch2, true);
  assertEquals(vector.trajectories.size, 1);

  branch1.open("/test", async () => ({ test: true }));

  assertEquals(branch2.effects.size, 1);
});

Deno.test("@beef Vector effect registration with open method", () => {
  const vector = new Vector();
  const testEffect = async (ctx) => ({ result: "test" });

  const usersBranch = vector.branch("/users");
  vector.open("/users/:id", testEffect);

  assertEquals(vector.trajectories.size, 1);
  assertEquals(vector.effects.size, 0);

  const effectPattern = Array.from(usersBranch.effects.keys())[0];

  assertEquals(effectPattern.signature, ":id");
  assertEquals(usersBranch.effects.get(effectPattern), testEffect);
});

Deno.test("Vector middleware registration and chaining", () => {
  const vector = new Vector();
  const middleware1 = async (ctx, next) => {
    ctx.step1 = true;
    return next();
  };
  const middleware2 = async (ctx, next) => {
    ctx.step2 = true;
    return next();
  };

  vector.use(middleware1).use(middleware2);

  assertEquals(vector.carry.length, 2);
  assertEquals(vector.carry[0], middleware1);
  assertEquals(vector.carry[1], middleware2);

  const branch = vector.branch("/test");
  assertEquals(branch.carry.length, 0);
});
