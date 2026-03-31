import { is } from "@vivalence/typology";

export class Blacklist {
  constructor(input = {}) {
    this.literals = input.literals || [];
    this.symbols = input.symbols || [];
    this.buffers = input.buffers || [];
  }

  absorb(scope) {
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

      const lits = getArray(obj, "literals");

      lits.forEach((lit) => {
        if (is.string(lit)) this.literals.push(lit);
        else if (lit?.id) this.literals.push(lit.id);
        extractIds(lit);
      });

      getArray(obj, "symbols").forEach((sym) => {
        if (is.string(sym)) this.symbols.push(sym);
        else if (sym?.id) this.symbols.push(sym.id);
        extractIds(sym);
      });

      getArray(obj, "buffers").forEach((prod) => {
        if (is.string(prod)) this.buffers.push(prod);
        else if (prod?.id) this.buffers.push(prod.id);
        extractIds(prod);
      });

      Object.entries(obj).forEach(([key, val]) => {
        if (!["literals", "symbols", "buffers"].includes(key)) extractIds(val);
      });
    };

    if (scope) extractIds(scope);
    return this.prune();
  }

  // async fromQueue(scope, ctx) {const criteria = { status: { $in: ["PENDING", "ACTIVE"] } }; if (scope.buffer) criteria.id = scope.buffer; // if (scope.user) criteria.user = scope.user; if (scope.thread) criteria.thread = scope.thread; if (scope.mode) criteria.mode = scope.mode; const buffers = await ctx.daemon.entities.buffer.find(criteria, {populate: ["literals", "symbols"], fields: ["id", "literals.id", "symbols.id"],}); buffers.forEach((buffer) => this.absorb(buffer)); return this;}

  prune() {
    this.literals = [...new Set(this.literals)].filter(Boolean);
    this.symbols = [...new Set(this.symbols)].filter(Boolean);
    this.buffers = [...new Set(this.buffers)].filter(Boolean);
    return this;
  }
}
// // export class Blacklist {
// //   constructor(input = {}) {
// //     this.literals = input.literals || [];
// //     this.symbols = input.symbols || [];
// //     this.buffers = input.buffers || [];
// //   }
// //   absorb(scope) {
// //     const extractIds = (obj) => {
// //       // if (obj.literal) {this.literals.push(obj.literal.id); extractIds(obj.literal);} if (obj.symbol) {this.symbols.push(obj.symbol.id); extractIds(obj.symbol);} if (obj.buffer) {if (obj.buffer.id) this.buffers.push(obj.buffer.id);}

// //       if (obj.literals && Array.isArray(obj.literals)) {
// //         obj.literals.forEach((literal) => {
// //           this.literals.push(literal.id);
// //           extractIds(literal);
// //         });
// //       }

// //       if (obj.symbols && Array.isArray(obj.symbols)) {
// //         obj.symbols.forEach((symbol) => {
// //           this.symbols.push(symbol.id);
// //           extractIds(symbol);
// //         });
// //       }

// //       if (obj.buffers && Array.isArray(obj.buffers)) {
// //         obj.buffers.forEach((buffer) => this.buffers.push(buffer.id));
// //       }

// //       Object.keys(obj).forEach((key) => {
// //         if (["literals", "symbols", "buffers"].includes(key)) return;
// //         if (
// //           typeof obj[key] === "object" &&
// //           obj[key] !== null &&
// //           !Array.isArray(obj[key])
// //         ) {
// //           extractIds(obj[key]);
// //         }
// //       });
// //     };
// //     if (scope) extractIds(scope);
// //     return this.prune();
// //   }
// //   fromStall(stall) {
// //     [stall.active, ...stall.queue]
// //       .filter((item) => item?.buffer?.scope)
// //       .map((item) => item.scope)
// //       .forEach((scope) => this.absorb(scope));
// //     return this;
// //   }
// //   async fromQueue(scope, ctx) {
// //     const criteria = { type: { $ne: "SIGNAL" } };

// //     if (scope.buffer) criteria.id = scope.buffer.id;
// //     if (scope.user) criteria.user = scope.user.id;
// //     if (scope.producer) criteria.producer = scope.producer.id;
// //     if (scope.generator) criteria.generator = scope.generator.id;
// //     // if (scope.intent) criteria.intent = scope.intent.id;

// //     const buffers = await ctx.daemon.entities.buffer.find(criteria, {
// //       populate: ["literals", "symbols"],
// //       fields: ["id", "literals.id", "symbols.id"],
// //     });
// //     buffers.map((buffer) => this.absorb(buffer));

// //     return this;
// //   }

// //   prune() {
// //     if (this.literals && Array.isArray(this.literals)) {
// //       this.literals = Array.from(new Set(this.literals));
// //     }

// //     if (this.symbols && Array.isArray(this.symbols)) {
// //       this.symbols = Array.from(new Set(this.symbols));
// //     }

// //     if (this.buffers && Array.isArray(this.buffers)) {
// //       this.buffers = Array.from(new Set(this.buffers));
// //     }

// //     return this;
// //   }
// // }
