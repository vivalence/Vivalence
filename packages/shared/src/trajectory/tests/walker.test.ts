import { assertEquals } from "$std/assert";

import { Walker, Deferred } from "../controllers/index.ts";
import { Trajectory } from "../core/trajectory.ts";
import path from "../parsers/path.ts";

function setupTrajectory() {
  const trajectory = new Trajectory([path]);

  trajectory.use(async (input, ctx, next) => {
    ctx.database = {
      users: (username) => ({
        name: username,
        id: username === "finn" ? "123" : "unknown",
      }),
    };
    return await next();
  });

  const usersTrajectory = trajectory.branch(path.pattern("/users"));

  usersTrajectory.use(async (input, ctx, next) => {
    if (input.username) {
      ctx.user = ctx.database.users(input.username);
    }
    return await next();
  });

  const userDetailTrajectory = usersTrajectory.branch(
    path.pattern("/:username"),
  );

  userDetailTrajectory.use(async (input, ctx, next) => {
    // console.log("middleware input", input);
    const result = await next();
    // console.log("middleware result", result);
    return result;
  });

  userDetailTrajectory.open(path.pattern("/a.tson"), (input, ctx) => {
    return { world: "hello", user: ctx.user };
  });

  return trajectory;
}

Deno.test("Handler execution with parameters", async () => {
  const trajectory = setupTrajectory();
  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  const initialPath = path.signal("/users/finn/a.tson");
  const steps = await walker.walk(initialPath, async () => []);

  const handler = await deferred.handler;
  const context = {};
  const result = await handler({ username: "finn" }, {});

  assertEquals(result.user.name, "finn");
  assertEquals(result.user.id, "123");
});

Deno.test("Walker navigation through trajectory", async () => {
  const trajectory = setupTrajectory();
  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  let directionCalls = 0;
  const askForDirections = async (currentTrajectory: any) => {
    directionCalls++;
    switch (directionCalls) {
      case 1:
        return path.signal("/");
      case 2:
        return path.signal("users");
      case 3:
        return path.signal("/finn");
      case 4:
        return path.signal("a.tson");
      default:
        return [];
    }
  };

  const steps = await walker.walk([], askForDirections);

  assertEquals(directionCalls, 4);
  assertEquals(steps[1].match.params.username, "finn");
});

Deno.test("Middleware execution order", async () => {
  const executionOrder = [];

  const trajectory = new Trajectory([path]);

  // Root middleware
  trajectory.use(async (input, ctx, next) => {
    executionOrder.push("root-start");
    const result = await next();
    executionOrder.push("root-end");
    return result;
  });

  // /users branch
  const usersTrajectory = trajectory.branch(path.pattern("/users"));

  // Users middleware
  usersTrajectory.use(async (input, ctx, next) => {
    executionOrder.push("users-start");
    const result = await next();
    executionOrder.push("users-end");
    return result;
  });

  // /users/:username branch
  const userDetailTrajectory = usersTrajectory.branch(
    path.pattern("/:username"),
  );

  // Username middleware
  userDetailTrajectory.use(async (input, ctx, next) => {
    executionOrder.push("username-start");
    const result = await next();
    executionOrder.push("username-end");
    return result;
  });

  // Effect
  userDetailTrajectory.open(path.pattern("/a.tson"), (input, ctx) => {
    executionOrder.push("effect");
    return { test: "success" };
  });

  const deferred = new Deferred();
  const walker = new Walker(trajectory, deferred);

  const initialPath = path.signal("/users/finn/a.tson");
  await walker.walk(initialPath, async () => []);

  const handler = await deferred.handler;
  await handler({}, {});

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

// Deno.test("Error handling for non-existent routes", async () => {
//   let errorThrown = false;

//   const trajectory = setupTrajectory();
//   const deferred = new Deferred();

//   deferred.handler.catch((error) => {
//     errorThrown = true;
//     assertEquals(error.code, "NO_PATTERN_MATCHED");
//   });

//   const walker = new Walker(trajectory, deferred);
//   await walker.walk(path.signal("/admin"), async () => []);

//   assertEquals(errorThrown, true);
// });

// Deno.test("Strategy order prioritizes effects over descendants", async () => {
//   const trajectory = new Trajectory();

//   const ambiguousPattern = pattern("/users");

//   trajectory.open(ambiguousPattern, (ctx) => ({ source: "effect" }));

//   const descendant = trajectory.branch(ambiguousPattern);
//   descendant.open(pattern("/detail"), (ctx) => ({ source: "descendant" }));

//   const deferred = new Deferred();
//   const walker = new Walker(trajectory, deferred);

//   await walker.walk(signal("/users"), async () => []);

//   const handler = await deferred.promise;
//   const result = await handler({});

//   assertEquals(result.source, "effect");
// });

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
