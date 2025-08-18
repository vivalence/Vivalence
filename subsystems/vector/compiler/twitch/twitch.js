import { traverse } from "../../controller/index.js";
import { sig } from "../../parser/index.js";

export const twitch = (runtime) => {
  return subscriber;
};

//   const triggerVector = async (path, args) => {
//     try {
//       const signals = vector.parsers[0].signal(path);
//       const [_, effect, bundle] = traverse(vector, signals);
//       return effect ? await bundle(args, () => effect(args)) : undefined;
//     } catch (err) {
//       if (err.message.includes("No match")) return undefined;
//       throw err;
//     }
//   };

// const buildEntityPath = (method, entityName) => {

//   if (/^(before|after)(Create|Update|Delete|Upsert)$/.test(method)) {
//     const [_, stage, action] = method.match(/^(before|after)(.+)$/);
//     return `/${entityName.toLowerCase()}/${action.toLowerCase()}/${stage}`;
//   }
//   if (/^(onInit|onLoad)$/.test(method)) {
//     return `/${entityName.toLowerCase()}/${method.replace("on", "").toLowerCase()}`;
//   }
//   return null;
// };

// const entityLifecycleMethods = [
//   "onInit",
//   "onLoad",
//   "beforeCreate",
//   "afterCreate",
//   "beforeUpdate",
//   "afterUpdate",
// ];

// export const twitch = (runtime) => {
//   const vector = runtime.entities.on;

//   class VectorSubscriber {}

//   const triggerVector = async (path, args) => {
//     try {
//       const signals = vector.parsers[0].signal(path);
//       const [_, effect, bundle] = traverse(vector, signals);
//       return effect ? await bundle(args, () => effect(args)) : undefined;
//     } catch (err) {
//       if (err.message.includes("No match")) return undefined;
//       throw err;
//     }
//   };

//   const triggerLifecycle = (method) =>
//     async function (args) {
//       console.log(args, method);
//       const entityName = args.entity?.constructor?.name;
//       if (!entityName) return;

//       const path = buildEntityPath(method, entityName);
//       return path ? await triggerVector(path, args) : undefined;
//     };

//   entityLifecycleMethods.forEach((method) => {
//     VectorSubscriber.prototype[method] = triggerLifecycle(method);
//   });

//   const subscribedEntities = vector.patterns
//     .map((p) => p.signature)
//     .map((s) => runtime.domain.data.entities[s]);

//   VectorSubscriber.prototype.getSubscribedEntities = () => subscribedEntities;

//   const subscriber = new VectorSubscriber();
//   return subscriber;
// };

// // // Usage Example:
// // const subscriber = createVectorSubscriber(vector);
// // em.getEventManager().registerSubscriber(subscriber);

// // // Vector setup example:
// // vector
// //   .open('/user/create/before', async (args) => {
// //     console.log('Before creating user:', args.entity);
// //   })
// //   .open('/user/create/after', async (args) => {
// //     console.log('User created:', args.entity);
// //   })
// //   .open('/user/update/before', async (args) => {
// //     console.log('Before updating user:', args.entity);
// //   })
// //   .open('/user/delete/after', async (args) => {
// //     console.log('User deleted:', args.entity);
// //   })
// //   .open('/user/init', async (args) => {
// //     console.log('User entity initialized:', args.entity);
// // //   });

// // import { strings } from "@vivalence/shared";

// // // import { Vector, parser, controller, compiler } from "@vivalence/vector";
// // // const twitch = new Twitch(runtime.entities.on);
// // // const signals = sig.signal("/api/test");
// // // const [_, effect, composed, steps] = traverse(vector, signals);
// // // const context = { input: "input handled" };
// // // await composed(context, async (ctx) => {ctx.result = await effect(ctx.input, ctx);});
// // // runtime.entities.em.getEventManager().registerSubscriber(twitch.subscription);

// // const MIKRO_SUBSCRIBER_REGEX = /^(before|after)(Create|Update|Delete|Upsert)$/;

// // export const twitch = (runtime) => {
// //   const entities = ["tag", "user"];
// //   const actions = ["update", "create"];
// //   const stages = ["after"];

// //   return new Proxy(
// //     {
// //       getSubscribedEntities: () =>
// //         entities.map((entity) => runtime.domain.data.entities[entity]),

// //       // onInit: () => console.log("onInit"),

// //       // console.log("getSubscribedEntities", patterns), patterns
// //     },
// //     {
// //       get: (methods, method) => {
// //         console.log("proxy get", method);
// //         if (methods[method]) return methods[method];
// //         const [i, stage, action] = method.match(/^(before|after)(.+)$/);
// //         console.log("i, stage, action", i, stage, action);

// //         return async (args) => {
// //           const entityname = args.entity.constructor.name.toLowerCase();
// //           const actionname = action.toLowerCase();

// //           const path = `/${entityname}/${actionname}/${stage}`;

// //           // const signals = vector.parsers[0].signal(path);
// //           // console.log("[EVENT SUBSCRIBER]");
// //           // console.log(method, methods);
// //           // const [_, effect, bundle] = traverse(vector, signals);
// //           // return effect && bundle({}, () => effect(args));
// //         };
// //       },
// //     },
// //   );
// // };

// // // export function twitch(runtime) {
// // //   return new Proxy(
// // //     { getSubscribedEntities: async () => await Promise.resolve([]) },
// // //     {
// // //       get: (methods, method) =>
// // //         !MIKRO_SUBSCRIBER_REGEX.test(method)
// // //           ? async (args) => {
// // //               console.log("[EVENT SUBSCRIBER]");
// // //               console.log(method, methods);
// // //               // console.log(method in methods, methods[method]);
// // //               // console.log(args);
// // //               // if (method in methods) return methods[method](args);
// // //               // console.log(
// // //               //   "/^(before|after)(Create|Update|Delete|Upsert)$/.test(method)",
// // //               // );
// // //               // console.log(
// // //               //   /^(before|after)(Create|Update|Delete|Upsert)$/.test(method),
// // //               // );
// // //               // if (
// // //               //   false ===
// // //               //   /^(before|after)(Create|Update|Delete|Upsert)$/.test(method)
// // //               // ) {
// // //               //   console.log("return indefined");
// // //               //   return undefined;
// // //               // }
// // //               // const [_, stage, action] = method.match(/^(before|after)(.+)$/);
// // //               // const path = `/${args.entity.constructor.name.toLowerCase()}/${action.toLowerCase()}/${stage}`;
// // //               // const signals = vector.parsers[0].signal(path);
// // //               // const [_, effect, bundle] = traverse(vector, signals);
// // //               // return effect && bundle({}, () => effect(args));
// // //             }
// // //           : undefined,
// // //       // get: (_, method) =>
// // //       //   /^(before|after)(Create|Update|Delete|Upsert)$/.test(method)
// // //       //     ? async (args) => {
// // //       //         console.log("[EVENT SUBSCRIBER ]method,args");
// // //       //         console.log(method, args);
// // //       //         // const [_, stage, action] = method.match(/^(before|after)(.+)$/);
// // //       //         // const path = `/${args.entity.constructor.name.toLowerCase()}/${action.toLowerCase()}/${stage}`;
// // //       //         // const signals = vector.parsers[0].signal(path);
// // //       //         // const [_, effect, bundle] = traverse(vector, signals);
// // //       //         // return effect && bundle({}, () => effect(args));
// // //       //       }
// // //       //     : undefined,
// // //     },
// // //   );
// // // }
// // //   subscribed = [];

// // //   // withEntity() this.subscribed.push(UserEntity)

// // //   getSubscribedEntities() {
// // //     return this.subscribed;
// // //   }

// // //   async afterUpdate(args) {
// // //     console.log("after Update args this", { args, this: this });
// // //     console.log("json", JSON.stringify(args));
// // //   }
// // // }

// // // constructor(em) {em.getEventManager().registerSubscriber(this);}
// // // console.log("UserSchema.hooks", UserSchema._meta.hooks);
// // // TagSchema._meta.hooks["beforeCreate"] = [
// // //   (args) => console.log("beforeCreate", args, Object.keys(args)), //args.entity
// // // ];
// // // console.log("Schema.hooks", TagSchema._meta.hooks);

// // // async afterCreate(args) {console.log("after create args this", { args, this: this });}
// // // async beforeCreate(args) {}
// // // async beforeUpdate(args) {}
// // // async afterUpdate(args) {}
// // // async beforeUpsert(args) {}
// // // async afterUpsert(args) {}
// // // async beforeDelete(args) {}
// // // async afterDelete(args) {}
