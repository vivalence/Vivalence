export class ProductionRequest {
  constructor(request = {}) {
    if (request instanceof this.constructor) return request;
    this.batch = request.batch || 0;
    this.stock = request.stock || 0;
    this.seek = request.seek || {};
    this.scope = request.scope || {};
    this.blacklist = request.blacklist || {};
  }

  demand(inventory = 0) {
    return Math.max(this.batch, this.stock - inventory, 0);
  }

  satisfiedBy(produced, inventory = 0) {
    const batchMet = this.batch <= 0 || produced >= this.batch;
    const stockMet = this.stock <= 0 || inventory + produced >= this.stock;
    return batchMet && stockMet;
  }

  recall(result, inventory = 0) {
    const produced = result.material.length;
    if (this.satisfiedBy(produced, inventory)) return null;
    return new ProductionRequest({
      seek: this.seek,
      scope: this.scope,
      blacklist: this.blacklist,
      batch: Math.max(0, this.batch - produced),
      stock: Math.max(0, this.stock - (inventory + produced)),
    });
  }

  static from(base, overrides = {}) {
    return new ProductionRequest({ ...base, ...overrides });
  }
}
// export class ProductionRequest {
//   constructor({
//     batch = 0,
//     stock = 0,
//     seek = {},
//     scope = {},
//     blacklist = {},
//   } = {}) {
//     this.batch = batch;
//     this.stock = stock;
//     this.seek = seek;
//     this.scope = scope;
//     this.blacklist = blacklist;
//   }

//   demand(inventory = 0) {
//     return this.batch + this.stock - inventory;
//   }

//   recall(result, inventory = 0) {
//     if (result.is.terminal()) return null;
//     const produced = result.products.length;
//     const batchDebt = this.batch - produced;
//     const stockDebt = this.stock - (inventory + produced);
//     if (batchDebt <= 0 && stockDebt <= 0) return null;
//     return ProductionRequest.from(this, {
//       batch: Math.max(0, batchDebt),
//       stock: Math.max(0, stockDebt),
//     });
//   }

//   static from(base, overrides = {}) {
//     return new ProductionRequest({
//       seek: base.seek,
//       scope: base.scope,
//       blacklist: base.blacklist,
//       batch: base.batch,
//       stock: base.stock,
//       ...overrides,
//     });
//   }
// }
