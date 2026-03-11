import { is } from "@vivalence/typology";

export class Seek {
  constructor(data = {}) {
    Object.assign(this, data);
  }
  async fromMask(mask = {}, ctx) {
    const resolve = async (node, entity) => {
      if (node == null) return node;

      if (is.array(node)) {
        return Promise.all(node.map((n) => resolve(n, entity)));
      }

      if (is.string(node)) {
        if (is.id(node)) return { id: node };
        const found = await ctx.daemon.entities[entity].findOne(
          { $or: [{ id: node }, { slug: node }] },
          { fields: ["id", "slug"] },
        );
        return found?.id ? { id: found.id, slug: found.slug } : node;
      }

      if (is.object(node)) {
        if (node.id) return node;
        if (node.slug) {
          const found = await ctx.daemon.entities[entity].findOne(
            { slug: node.slug },
            { fields: ["id", "slug"] },
          );
          return found?.id ? { id: found.id, slug: found.slug } : node;
        }
        return Object.fromEntries(
          await Promise.all(
            Object.entries(node).map(async ([k, v]) => [k, await resolve(v, entity)]),
          ),
        );
      }

      return node;
    };

    for (const [key, val] of Object.entries(mask?.seek || mask)) {
      const entity = (/^symbols?$/.test(key) && "symbol") || (/^literals?$/.test(key) && "literal");
      this[key] = entity ? await resolve(val, entity) : val;
    }

    return this;
  }
}

// export class Seek {
//   constructor(seek = {}) {
//     Object.assign(this, seek);
//   }

//   async fromMask(mask, ctx) {
//     const seek = mask.seek || mask;

//     const entityFor = (key) => {
//       if (key === "symbol" || key === "symbols") return "symbol";
//       if (key === "literal" || key === "literals") return "literal";
//       return null;
//     };

//     const resolve = async (node, entity) => {
//       if (typeof node === "string") return node;
//       if (Array.isArray(node))
//         return Promise.all(node.map((n) => resolve(n, entity)));
//       if (node && typeof node === "object") {
//         if (node.id) return node.id;
//         if (node.slug) {
//           const found = await ctx.daemon.entities[entity].findOne({
//             slug: node.slug,
//           });
//           return found?.id;
//         }
//         const out = {};
//         for (const [k, v] of Object.entries(node)) {
//           out[k] = await resolve(v, entity);
//         }
//         return out;
//       }
//       return node;
//     };

//     for (const [key, val] of Object.entries(seek)) {
//       const entity = entityFor(key);
//       if (entity) {
//         this[key] = await resolve(val, entity);
//       }
//     }

//     return this;
//   }
// }

// const resolve = async (node, entity) => {
//   console.log({ node, entity, isId: is.id(node), isObj: is.object(node) });
//   if (node == null) return node;
//   if (is.id(node)) node = { id: node };
//   // if (is.slug(node)) node = {slug:node}
//   if (!is.object(node)) return node;
//   if (node.id) return node.id;
//   if (node.slug) return (await ctx.daemon.entities[entity].findOne({ slug: node.slug }))?.id;
//   if (Array.isArray(node)) return Promise.all(node.map((n) => resolve(n, entity)));
//   return Object.fromEntries(
//     await Promise.all(
//       Object.entries(node).map(async ([k, v]) => [k, await resolve(v, entity)]),
//     ),
//   );
// };
