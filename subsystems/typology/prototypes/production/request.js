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
    return this.batch + this.stock - inventory;
  }

  satisfiedBy(produced, inventory = 0) {
    const totalRequired = this.batch + this.stock;
    const totalAvailable = produced + inventory;
    return totalAvailable >= totalRequired;
  }

  recall(result, inventory = 0) {
    const produced = result.material.length;
    if (this.satisfiedBy(produced, inventory)) return null;

    const debt = Math.max(0, this.batch + this.stock - produced);

    return new ProductionRequest({
      seek: this.seek,
      scope: this.scope,
      blacklist: this.blacklist,
      stock: debt,
      batch: 0,
    });
  }

  static from(base, overrides = {}) {
    return new ProductionRequest({ ...base, ...overrides });
  }
}
