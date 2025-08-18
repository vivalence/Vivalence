import { assertEquals, assertNotEquals } from "$std/assert";

// import { Signal, Pattern, Factory } from "../types.ts";
// import { createFactory } from "../src/factory.ts";
import { Trajectory, parsers } from "../mod.ts";

// Test trajectory basic functionality
Deno.test("Trajectory - open and process", async () => {
  // Create trajectory
  const trajectory = new Trajectory();

  trajectory.open(parsers.path.pattern("/users/all"), async (ctx: any) => {
    return { result: "user list" };
  });
  // console.log("trajectory", trajectory);

  // what do i want here?
  // i want the trajectory to yield available branches.
  //

  // const effect = trajectory.invoke(parsers.path.signal("/users"));
  // this effect should be a nother trajectory
  // one that i can call with '/all'.

  // const effect = trajectory.invoke(parsers.path.signal("/users/all"));
  // this effect should be the handler we installed earlier.

  // BUT!! the effect somehow contains previous middlewares.
  // hmmm.
  // i could split this in two separate processes.
  // build the signal and then invoke the whole tree once i am done.
  // that could be implemented as a ui for any router.
  // but thats not what i want.
  // this would also be simplified if id just literally collect the middlewares.
  // ok. what if i pass my middlewares forward.
  // so, trajectory calls trajectory with the rest of the signal, and a next method.
  // trajectory.traverse(restofsignal, this.compose())
  // traverse(signal, next)

  // the walker

  // const effect = trajectory.invoke(parsers.path.signal("/users/all"));
  // console.log("effect", await effect({} as any));

  // assertEquals(result.type, "handler");
  // assertNotEquals(result.handler, undefined);
  // assertEquals(await result.handler!(ctx), { result: "user list" });
});

// // Test trajectory with branching
// Deno.test("Trajectory - branching", async () => {
//   // Create trajectory
//   const trajectory = new Trajectory();

//   // Create a branch
//   const userBranch = trajectory.branch("/users");
//   userBranch.open("/:id", async (ctx) => {
//     return { userId: ctx.params.id };
//   });

//   // Create contexts
//   const ctx1 = createTestContext();
//   const ctx2 = createTestContext();

//   // Create signals
//   const rootSignal = SignalFactory.parse("/users")![0];
//   const userIdSignal = SignalFactory.parse("/:id")![0];

//   // Test root signal - should return paths
//   const rootResult = await trajectory.process(rootSignal, ctx1);
//   assertEquals(rootResult.type, "multiple_paths");
//   assertNotEquals(rootResult.paths, undefined);

//   // Test child signal - should return handler
//   if (rootResult.paths && rootResult.paths[0].trajectory) {
//     const childResult = await rootResult.paths[0].trajectory.process(userIdSignal, ctx2);
//     assertEquals(childResult.type, "handler");
//     assertNotEquals(childResult.handler, undefined);

//     // Test handler execution
//     ctx2.params.id = "123"; // Set parameter
//     const handlerResult = await childResult.handler!(ctx2);
//     assertEquals(handlerResult.userId, "123");
//   }
// });

// // Test trajectory with middleware
// Deno.test("Trajectory - middleware", async () => {
//   // Create trajectory
//   const trajectory = new Trajectory();

//   // Add middleware
//   trajectory.use(async (ctx, next) => {
//     ctx.response.headers = { "Content-Type": "application/json" };
//     await next();
//   });

//   // Add a handler
//   trajectory.open("/api", async (ctx) => {
//     return { data: "API response" };
//   });

//   // Create context
//   const ctx = createTestContext();

//   // Create signal
//   const signal = SignalFactory.parse("/api")![0];

//   // Process signal
//   const result = await trajectory.process(signal, ctx);

//   // Verify middleware was applied
//   assertEquals(ctx.response.headers["Content-Type"], "application/json");

//   // Verify handler works
//   assertEquals(result.type, "handler");
//   assertNotEquals(result.handler, undefined);
//   assertEquals(await result.handler!(ctx), { data: "API response" });
// });

// Helper function to create a test context
function createTestContext(): any {
  let resolve: () => void;
  let reject: (error: Error) => void;

  const released = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    request: {},
    response: {},
    params: {},
  };
}
