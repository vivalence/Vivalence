// AI garb
// import { Vector } from "../../vector.js";
// import { sig } from "../../parser/index.js";

// const effect = (name) => (input, ctx) => ({ name, input, ctx });
// const middleware = (name) => (ctx, next) => {
//   ctx.trace = [...(ctx.trace || []), name];
//   return next();
// };

// export const vectors = {
//   simple: new Vector([sig])
//     .open("/ping", effect("pong"))
//     .open("/echo/:msg", effect("echo")),

//   medium: new Vector([sig])
//     .use(middleware("auth"))
//     .branch("/api")
//     .use(middleware("validate"))
//     .open("/users/:id", effect("getUser"))
//     .open("/posts/*", effect("getPosts"))
//     .branch("/admin")
//     .open("/stats", effect("getStats")),

//   complex: new Vector([sig])
//     .use(middleware("cors"))
//     .use(middleware("auth"))
//     .branch("/v1")
//     .use(middleware("v1-middleware"))
//     .branch("/users")
//     .open("/:id", effect("getUser"))
//     .open("/:id/posts", effect("getUserPosts"))
//     .branch("/:id/admin")
//     .use(middleware("admin-only"))
//     .open("/delete", effect("deleteUser"))
//     .open("/suspend", effect("suspendUser"))
//     .branch("/posts")
//     .open("/", effect("getAllPosts"))
//     .open("/:slug", effect("getPost"))
//     .branch("/:slug/comments")
//     .open("/", effect("getComments"))
//     .open("/:commentId", effect("getComment")),
// };

// export const signals = {
//   simple: ["/ping", "/echo/hello"],
//   medium: ["/api/users/123", "/api/posts/recent", "/api/admin/stats"],
//   complex: [
//     "/v1/users/123",
//     "/v1/users/123/posts",
//     "/v1/users/123/admin/delete",
//     "/v1/posts/my-post/comments/456",
//   ],
// };

// export const expect = {
//   toMatch: (result, expected) => {
//     if (!result || result.length === 0)
//       throw new Error(`Expected match, got: ${result}`);
//     if (expected.effect && result[1]?.name !== expected.effect) {
//       throw new Error(
//         `Expected effect "${expected.effect}", got: ${result[1]?.name}`,
//       );
//     }
//     if (expected.params) {
//       const params = result[0]?.params || {};
//       Object.entries(expected.params).forEach(([key, value]) => {
//         if (params[key] !== value) {
//           throw new Error(
//             `Expected param ${key}="${value}", got: ${params[key]}`,
//           );
//         }
//       });
//     }
//   },

//   toThrow: async (fn, message) => {
//     try {
//       await fn();
//       throw new Error(`Expected function to throw`);
//     } catch (err) {
//       if (message && !err.message.includes(message)) {
//         throw new Error(
//           `Expected error containing "${message}", got: ${err.message}`,
//         );
//       }
//     }
//   },

//   toEqual: (actual, expected) => {
//     if (JSON.stringify(actual) !== JSON.stringify(expected)) {
//       throw new Error(
//         `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
//       );
//     }
//   },
// };

// export const test = (name, fn) => {
//   try {
//     fn();
//     console.log(`✓ ${name}`);
//   } catch (err) {
//     console.error(`✗ ${name}: ${err.message}`);
//   }
// };
