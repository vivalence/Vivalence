import { is, cast } from "@vivalence/typology";
import { ProductionCondition, ProductionStatus } from "./enum.js";

export class ProductionResult {
  constructor(output = [], condition = ProductionCondition.NOMINAL, meta = {}) {
    if (output instanceof ProductionResult) return output;

    if (is.empty(output)) {
      this.products = [];
      this.condition = ProductionCondition.EXHAUSTED;
      this.meta = meta;
      return;
    }

    if (is.array(output)) {
      this.products = output;
      this.condition = condition;
      return;
    }

    if (is.array(output.products)) {
      this.products = output.products;
      this.condition = output.condition || condition;
      this.meta = output.meta || meta;
      return;
    }

    if (is.product(output)) {
      this.products = cast.array(output);
      this.condition = condition;
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

  get terminal() {
    return [
      ProductionStatus.EXHAUSTED,
      ProductionStatus.LOCKED,
      ProductionStatus.ERROR,
    ].includes(this.condition);
  }

  statusGiven(request, inventory = 0) {
    if (this.condition === ProductionCondition.ERROR)
      return ProductionStatus.ERROR;
    if (this.condition === ProductionCondition.LOCKED)
      return ProductionStatus.LOCKED;

    const produced = this.material.length;
    if (produced === 0 && this.condition === ProductionCondition.EXHAUSTED)
      return ProductionStatus.EXHAUSTED;

    if (request.satisfiedBy(produced, inventory))
      return ProductionStatus.FULFILLED;

    if (this.condition === ProductionCondition.EXHAUSTED)
      return ProductionStatus.EXHAUSTED;

    return ProductionStatus.PARTIAL;
  }

  recallGiven(request, inventory = 0) {
    const status = this.statusGiven(request, inventory);
    if (status === ProductionStatus.PARTIAL)
      return request.recall(this, inventory);
    return null;
  }

  static cast = {
    nominal: (products, meta) =>
      new ProductionResult(products, ProductionCondition.NOMINAL, meta),
    exhausted: (meta) =>
      new ProductionResult([], ProductionCondition.EXHAUSTED, meta),
    locked: (meta) =>
      new ProductionResult([], ProductionCondition.LOCKED, meta),
    error: (error, meta) =>
      new ProductionResult([], ProductionCondition.ERROR, { error, ...meta }),
  };
}
// import { cast, is } from "@vivalence/typology";
// import { ProductionError } from "./error.js";
// import { ProductionSignal } from "./enum.js";

// export const TERMINAL = [
//   ProductionSignal.EXHAUSTED,
//   ProductionSignal.COMPLETED,
//   ProductionSignal.LOCKED,
//   ProductionSignal.ERROR,
// ];

// export class ProductionResult {
//   constructor(products = [], signal = ProductionSignal.FULFILLED, meta = {}) {
//     if (products instanceof this.constructor) return products;
//     this.products = cast.array(products);
//     this.signal = signal;
//     this.meta = meta;
//   }

//   get is() {
//     return {
//       terminal: () => TERMINAL.includes(this.signal),
//       retryable: () => this.signal === ProductionSignal.INCOMPLETE,
//       populated: () => this.products.length > 0,
//       fulfilled: () => this.signal === ProductionSignal.FULFILLED,
//       degraded: () => this.signal === ProductionSignal.DEGRADED,
//       error: () => this.signal === ProductionSignal.ERROR,
//     };
//   }

//   static cast = {
//     locked: (meta) => new ProductionResult([], ProductionSignal.LOCKED, meta),
//     fulfilled: (products, meta) =>
//       new ProductionResult(products, ProductionSignal.FULFILLED, meta),
//     exhausted: (meta) =>
//       new ProductionResult([], ProductionSignal.EXHAUSTED, meta),
//     incomplete: (products, meta) =>
//       new ProductionResult(products, ProductionSignal.INCOMPLETE, meta),
//     error: (error, meta) =>
//       new ProductionResult([], ProductionSignal.ERROR, { error, ...meta }),
//     completed: (products, meta) =>
//       new ProductionResult(products, ProductionSignal.COMPLETED, meta),
//   };

//   static from = {
//     output: (output) => {
//       let result;
//       if (output instanceof this.constructor) return output;
//       if (is.empty(output)) return this.constructor.cast.exhausted();
//       if (is.array(output)) return new this.constructor(output);
//       if (is.array(output.products))
//         return new this.constructor(
//           output.products,
//           output.signal,
//           output.meta,
//         );
//       return ProductionError.result(output);
//     },
//   };
// }
