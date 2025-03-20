import { assertEquals } from "$std/assert";
import { Trajectory, Walker, Deferred } from "../mod.ts";
import { signal, pattern } from "../src/parsers/path.ts";

Deno.test("Walker navigation through trajectory", async () => {
  const trajectory = setupTrajectory();
  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  let directionCalls = 0;
  const directionsSequence = async (currentTrajectory: any) => {
    directionCalls++;
    switch (directionCalls) {
      case 1:
        return signal("/");
      case 2:
        return signal("users");
      case 3:
        return signal("/finn");
      case 4:
        return signal("a.tson");
      default:
        return [];
    }
  };

  const steps = await walker.walk([], directionsSequence);

  assertEquals(directionCalls, 4);
  assertEquals(steps[1].username, "finn");
});

Deno.test("Parameter extraction during traversal", async () => {
  const trajectory = setupTrajectory();
  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  const initialPath = signal("/users/finn/a.tson");
  const steps = await walker.walk(initialPath, async () => []);

  assertEquals(steps[1].username, "finn");
});

Deno.test("Handler execution with parameters", async () => {
  const trajectory = setupTrajectory();
  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  const initialPath = signal("/users/finn/a.tson");
  const steps = await walker.walk(initialPath, async () => []);

  const handler = await deferred.promise;
  const context = { request: steps.reduce((p, s) => ({ ...p, ...s }), {}) };
  const result = await handler(context);

  assertEquals(result.user.name, "finn");
  assertEquals(result.user.id, "123");
});

Deno.test("Middleware execution order", async () => {
  const executionOrder = [];

  const trajectory = new Trajectory();

  // Root middleware
  trajectory.use(async (ctx, next) => {
    executionOrder.push("root-start");
    await next();
    executionOrder.push("root-end");
  });

  // /users branch
  const usersTrajectory = trajectory.branch(pattern("/users"));

  // Users middleware
  usersTrajectory.use(async (ctx, next) => {
    executionOrder.push("users-start");
    await next();
    executionOrder.push("users-end");
  });

  // /users/:username branch
  const userDetailTrajectory = usersTrajectory.branch(pattern("/:username"));

  // Username middleware
  userDetailTrajectory.use(async (ctx, next) => {
    executionOrder.push("username-start");
    await next();
    executionOrder.push("username-end");
  });

  // Effect
  userDetailTrajectory.open(pattern("/a.tson"), (ctx) => {
    executionOrder.push("effect");
    return { test: "success" };
  });

  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  const initialPath = signal("/users/finn/a.tson");
  await walker.walk(initialPath, async () => []);

  const handler = await deferred.promise;
  await handler({});

  assertEquals(executionOrder, [
    "root-start",
    "users-start",
    "username-start",
    "effect",
    "username-end",
    "users-end",
    "root-end",
  ]);
});

Deno.test("Error handling for non-existent routes", async () => {
  let errorThrown = false;

  const trajectory = setupTrajectory();
  const deferred = new Deferred();
  deferred.promise.catch((error) => {
    errorThrown = true;
    assertEquals(error.code, "NO_PATTERN_MATCHED");
  });

  const walker = new Walker(trajectory, deferred);
  await walker.walk(signal("/admin"), async () => []);

  assertEquals(errorThrown, true);
});

Deno.test("Strategy order prioritizes effects over descendants", async () => {
  const trajectory = new Trajectory();

  const ambiguousPattern = pattern("/users");

  trajectory.open(ambiguousPattern, (ctx) => ({ source: "effect" }));

  const descendant = trajectory.branch(ambiguousPattern);
  descendant.open(pattern("/detail"), (ctx) => ({ source: "descendant" }));

  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  await walker.walk(signal("/users"), async () => []);

  const handler = await deferred.promise;
  const result = await handler({});

  assertEquals(result.source, "effect");
});

function setupTrajectory() {
  const trajectory = new Trajectory();

  // Root middleware adds database
  trajectory.use(async (ctx, next) => {
    ctx.database = {
      users: (username) => ({
        name: username,
        id: username === "finn" ? "123" : "unknown",
      }),
    };
    await next();
  });

  // /users branch
  const usersTrajectory = trajectory.branch(pattern("/users"));

  // Users middleware fetches user
  usersTrajectory.use(async (ctx, next) => {
    if (ctx.request?.username) {
      ctx.user = ctx.database.users(ctx.request.username);
    }
    await next();
  });

  // /users/:username branch
  const userDetailTrajectory = usersTrajectory.branch(pattern("/:username"));

  // Log middleware
  userDetailTrajectory.use(async (ctx, next) => {
    await next();
  });

  // Effect for /users/:username/a.tson
  userDetailTrajectory.open(pattern("/a.tson"), (ctx) => {
    return { user: ctx.user };
  });

  return trajectory;
}
// import { assertEquals } from "$std/assert";
// import { Trajectory, Walker, Deferred } from "../src/index.ts";
// import { signal, pattern } from "../src/parsers/path.ts";

// Deno.test("Walker navigation through trajectory", async () => {
//   const trajectory = setupTrajectory();
//   const deferred = new Deferred();
//   const walker = new Walker(trajectory, deferred);

//   let directionCalls = 0;
//   const directionsSequence = async (currentTrajectory) => {
//     directionCalls++;
//     switch (directionCalls) {
//       case 1:
//         return signal("/");
//       case 2:
//         return signal("users");
//       case 3:
//         return signal("finn");
//       case 4:
//         return signal("a.tson");
//       default:
//         return [];
//     }
//   };

//   const params = await walker.walk([], directionsSequence);

//   assertEquals(directionCalls, 4);
//   assertEquals(params.username, "finn");
// });

// Deno.test("Parameter extraction during traversal", async () => {
//   const trajectory = setupTrajectory();
//   const deferred = new Deferred();
//   const walker = new Walker(trajectory, deferred);

//   const initialPath = signal("/users/finn/a.tson");
//   const params = await walker.walk(initialPath, async () => []);

//   assertEquals(params.username, "finn");
// });

// Deno.test("Handler execution with parameters", async () => {
//   const trajectory = setupTrajectory();
//   const deferred = new Deferred();
//   const walker = new Walker(trajectory, deferred);

//   const initialPath = signal("/users/finn/a.tson");
//   const params = await walker.walk(initialPath, async () => []);

//   const handler = await deferred.promise;
//   const result = await handler({ params });
//   console.log("await handler(params)", result);

//   assertEquals(result.user.name, "finn");
//   assertEquals(result.user.id, "123");
// });

// function setupTrajectory() {
//   const trajectory = new Trajectory();

//   const usersTrajectory = trajectory.branch(pattern("/users"));

//   usersTrajectory.use(async (ctx, next) => {
//     console.log("1");
//     ctx.database = {
//       users: (username) => ({
//         name: username,
//         id: username === "finn" ? "123" : "unknown",
//       }),
//     };
//     await next();
//   });

//   // Users middleware fetches user
//   usersTrajectory.use(async (ctx, next) => {
//     console.log("2");
//     if (ctx.params?.username) {
//       ctx.user = ctx.database.users(ctx.params.username);
//     }
//     await next();
//   });

//   // /users/:username branch
//   const userDetailTrajectory = usersTrajectory.branch(pattern("/:username"));

//   // Log middleware
//   userDetailTrajectory.use(async (ctx, next) => {
//     console.log("3");
//     let result = await next();
//     console.log("User lookup:", ctx, result);
//   });

//   // Effect for /users/:username/a.tson
//   userDetailTrajectory.open(pattern("/a.tson"), (ctx) => {
//     console.log("a.tson", ctx);
//     return { user: ctx.user };
//   });

//   return trajectory;
// }
