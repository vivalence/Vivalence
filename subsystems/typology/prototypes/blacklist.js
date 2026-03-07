import { is } from "@vivalence/typology";

export class Blacklist {
  constructor(input = {}) {
    this.literals = input.literals || [];
    this.symbols = input.symbols || [];
    this.products = input.products || [];
  }

  fromScope(scope) {
    const visited = new WeakSet();

    const getArray = (obj, prop) => {
      const val = obj?.[prop];
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (val.isInitialized?.() === false) return [];
      if (val.getItems) return val.getItems();
      if (typeof val[Symbol.iterator] === "function") return [...val];
      return [];
    };

    const extractIds = (obj) => {
      if (!obj || typeof obj !== "object" || visited.has(obj)) return;
      visited.add(obj);

      getArray(obj, "literals").forEach((lit) => {
        if (is.string(lit)) this.literals.push(lit);
        else if (lit?.id) this.literals.push(lit.id);
        extractIds(lit);
      });

      getArray(obj, "symbols").forEach((sym) => {
        if (is.string(sym)) this.symbols.push(sym);
        else if (sym?.id) this.symbols.push(sym.id);
        extractIds(sym);
      });

      getArray(obj, "products").forEach((prod) => {
        if (is.string(prod)) this.products.push(prod);
        else if (prod?.id) this.products.push(prod.id);
        extractIds(prod);
      });

      Object.entries(obj).forEach(([key, val]) => {
        if (!["literals", "symbols", "products"].includes(key)) extractIds(val);
      });
    };

    if (scope) extractIds(scope);
    return this.prune();
  }

  async fromQueue(scope, ctx) {
    const criteria = { type: { $eq: "MODAL" }, status: { $in: ["PENDING", "ACTIVE"] } };
    if (scope.product) criteria.id = scope.product;
    // if (scope.user) criteria.user = scope.user;
    if (scope.session) criteria.session = scope.session;
    if (scope.producer) criteria.producer = scope.producer;
    if (scope.commissioner) criteria.commissioner = scope.commissioner;

    const products = await ctx.daemon.entities.product.find(criteria, {
      populate: ["literals", "symbols"],
      fields: ["id", "literals.id", "symbols.id"],
    });

    products.forEach((product) => this.fromScope(product));
    return this;
  }

  prune() {
    this.literals = [...new Set(this.literals)];
    this.symbols = [...new Set(this.symbols)];
    this.products = [...new Set(this.products)];
    return this;
  }
}
// export class Blacklist {
//   constructor(input = {}) {
//     this.literals = input.literals || [];
//     this.symbols = input.symbols || [];
//     this.products = input.products || [];
//   }
//   fromScope(scope) {
//     const extractIds = (obj) => {
//       // if (obj.literal) {this.literals.push(obj.literal.id); extractIds(obj.literal);} if (obj.symbol) {this.symbols.push(obj.symbol.id); extractIds(obj.symbol);} if (obj.product) {if (obj.product.id) this.products.push(obj.product.id);}

//       if (obj.literals && Array.isArray(obj.literals)) {
//         obj.literals.forEach((literal) => {
//           this.literals.push(literal.id);
//           extractIds(literal);
//         });
//       }

//       if (obj.symbols && Array.isArray(obj.symbols)) {
//         obj.symbols.forEach((symbol) => {
//           this.symbols.push(symbol.id);
//           extractIds(symbol);
//         });
//       }

//       if (obj.products && Array.isArray(obj.products)) {
//         obj.products.forEach((product) => this.products.push(product.id));
//       }

//       Object.keys(obj).forEach((key) => {
//         if (["literals", "symbols", "products"].includes(key)) return;
//         if (
//           typeof obj[key] === "object" &&
//           obj[key] !== null &&
//           !Array.isArray(obj[key])
//         ) {
//           extractIds(obj[key]);
//         }
//       });
//     };
//     if (scope) extractIds(scope);
//     return this.prune();
//   }
//   fromStall(stall) {
//     [stall.active, ...stall.queue]
//       .filter((item) => item?.product?.scope)
//       .map((item) => item.scope)
//       .forEach((scope) => this.fromScope(scope));
//     return this;
//   }
//   async fromQueue(scope, ctx) {
//     const criteria = { type: { $ne: "SIGNAL" } };

//     if (scope.product) criteria.id = scope.product.id;
//     if (scope.user) criteria.user = scope.user.id;
//     if (scope.producer) criteria.producer = scope.producer.id;
//     if (scope.generator) criteria.generator = scope.generator.id;
//     // if (scope.intent) criteria.intent = scope.intent.id;

//     const products = await ctx.daemon.entities.product.find(criteria, {
//       populate: ["literals", "symbols"],
//       fields: ["id", "literals.id", "symbols.id"],
//     });
//     products.map((product) => this.fromScope(product));

//     return this;
//   }

//   prune() {
//     if (this.literals && Array.isArray(this.literals)) {
//       this.literals = Array.from(new Set(this.literals));
//     }

//     if (this.symbols && Array.isArray(this.symbols)) {
//       this.symbols = Array.from(new Set(this.symbols));
//     }

//     if (this.products && Array.isArray(this.products)) {
//       this.products = Array.from(new Set(this.products));
//     }

//     return this;
//   }
// }
