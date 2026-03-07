import { is, cast } from "@vivalence/typology";
import { ProductionCondition, ProductionStatus } from "./enum.js";

export class ProductionResult {
  constructor(output = [], condition = undefined, meta = {}) {
    if (output instanceof ProductionResult) return output;

    if (is.array(output.products)) {
      this.products = output.products;
      this.condition =
        condition ??
        output.condition ??
        (is.empty(this.products) ? ProductionCondition.EXHAUSTED : ProductionCondition.NOMINAL);
      this.meta = output.meta || meta;
      return;
    }

    if (is.empty(output)) {
      this.products = [];
      this.condition = condition ?? ProductionCondition.EXHAUSTED;
      this.meta = meta;
      return;
    }

    if (is.array(output)) {
      this.products = output;
      this.condition = condition ?? ProductionCondition.NOMINAL;
      this.meta = meta;
      return;
    }

    if (is.product(output)) {
      this.products = cast.array(output);
      this.condition = condition ?? ProductionCondition.NOMINAL;
      this.meta = meta;
      return;
    }

    this.products = [];
    this.condition = ProductionCondition.ERROR;
    this.meta = { error: output };
  }
  get material() {
    return this.products.filter((p) => p.type !== "SIGNAL");
  }

  get isClosed() {
    return [ProductionStatus.EXHAUSTED, ProductionStatus.LOCKED, ProductionStatus.ERROR].includes(
      this.condition,
    );
  }

  statusGiven(request, inventory = 0) {
    if (this.condition === ProductionCondition.ERROR) return ProductionStatus.ERROR;
    if (this.condition === ProductionCondition.LOCKED) return ProductionStatus.LOCKED;

    const produced = this.material.length;
    if (produced === 0 && this.condition === ProductionCondition.EXHAUSTED)
      return ProductionStatus.EXHAUSTED;

    if (request.satisfiedBy(produced, inventory)) {
      const totalRequired = request.batch + request.stock;
      const totalAvailable = produced + inventory;
      if (totalAvailable > totalRequired) return ProductionStatus.OVERCAPACITY;
      return ProductionStatus.FULFILLED;
    }

    if (this.condition === ProductionCondition.EXHAUSTED) return ProductionStatus.EXHAUSTED;

    return ProductionStatus.PARTIAL;
  }

  recallGiven(request, inventory = 0) {
    const status = this.statusGiven(request, inventory);
    if (status === ProductionStatus.PARTIAL) return request.recall(this, inventory);
    return null;
  }

  static cast = {
    nominal: (products, meta) => new ProductionResult(products, ProductionCondition.NOMINAL, meta),
    exhausted: (meta) => new ProductionResult([], ProductionCondition.EXHAUSTED, meta),
    locked: (meta) => new ProductionResult([], ProductionCondition.LOCKED, meta),
    error: (error, meta) => new ProductionResult([], ProductionCondition.ERROR, { error, ...meta }),
  };
}
