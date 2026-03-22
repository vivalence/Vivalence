import { specimen, is } from "@vivalence/typology";
import {
  ProductionRequest,
  ProductionResult,
  ProductionCondition,
  ProductionStatus,
} from "@vivalence/typology";

specimen.describe("ProductionRequest", () => {
  specimen.describe("construction", () => {
    specimen.it("from object", () => {
      const request = new ProductionRequest({
        batch: 5,
        stock: 10,
        seek: { literal: "test" },
        scope: { session: "123" },
        blacklist: { products: ["abc"] },
      });

      specimen.expect(request.batch).toBe(5);
      specimen.expect(request.stock).toBe(10);
      specimen.expect(request.seek).toEqual({ literal: "test" });
      specimen.expect(request.scope).toEqual({ session: "123" });
      specimen.expect(request.blacklist).toEqual({ products: ["abc"] });
    });

    specimen.it("handles defaults", () => {
      const request = new ProductionRequest();

      specimen.expect(request.batch).toBe(0);
      specimen.expect(request.stock).toBe(0);
      specimen.expect(request.seek).toEqual({});
      specimen.expect(request.scope).toEqual({});
      specimen.expect(request.blacklist).toEqual({});
    });

    specimen.it("absorbs existing request", () => {
      const original = new ProductionRequest({ batch: 3 });
      const copy = new ProductionRequest(original);

      specimen.expect(copy.batch).toBe(3);
      specimen.expect(copy).toBe(original);
    });
  });

  specimen.describe("demand", () => {
    specimen.it("calculates from batch and stock", () => {
      const request = new ProductionRequest({ batch: 5, stock: 10 });

      specimen.expect(request.demand(0)).toBe(15);
      specimen.expect(request.demand(10)).toBe(5);
    });
  });

  specimen.describe("satisfiedBy", () => {
    specimen.it("checks if produced + inventory meets batch + stock", () => {
      const request = new ProductionRequest({ batch: 5, stock: 10 });

      specimen.expect(request.satisfiedBy(8, 7)).toBe(true);
      specimen.expect(request.satisfiedBy(10, 5)).toBe(true);
      specimen.expect(request.satisfiedBy(15, 0)).toBe(true);
      specimen.expect(request.satisfiedBy(5, 5)).toBe(false);
      specimen.expect(request.satisfiedBy(14, 0)).toBe(false);
    });

    specimen.it("handles zero requirements", () => {
      const request = new ProductionRequest({ batch: 0, stock: 0 });

      specimen.expect(request.satisfiedBy(0, 0)).toBe(true);
      specimen.expect(request.satisfiedBy(1, 0)).toBe(true);
    });

    specimen.it("handles batch only", () => {
      const request = new ProductionRequest({ batch: 5 });

      specimen.expect(request.satisfiedBy(5, 0)).toBe(true);
      specimen.expect(request.satisfiedBy(3, 2)).toBe(true);
      specimen.expect(request.satisfiedBy(4, 0)).toBe(false);
    });

    specimen.it("handles stock only", () => {
      const request = new ProductionRequest({ stock: 10 });

      specimen.expect(request.satisfiedBy(10, 0)).toBe(true);
      specimen.expect(request.satisfiedBy(5, 5)).toBe(true);
      specimen.expect(request.satisfiedBy(0, 10)).toBe(true);
      specimen.expect(request.satisfiedBy(5, 4)).toBe(false);
    });
  });

  specimen.describe("recall", () => {
    specimen.it("returns null when satisfied", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = new ProductionResult([1, 2, 3, 4, 5]);

      specimen.expect(request.recall(result, 0)).toBe(null);
    });

    specimen.it("batch first, then stock - partial batch", () => {
      const request = new ProductionRequest({ batch: 5, stock: 10 });
      const result = new ProductionResult([1, 2, 3]);

      const recall = request.recall(result, 0);

      specimen.expect(recall.batch).toBe(2);
      specimen.expect(recall.stock).toBe(10);
    });

    specimen.it("batch first, then stock - overflow to stock", () => {
      const request = new ProductionRequest({ batch: 5, stock: 10 });
      const result = new ProductionResult([1, 2, 3, 4, 5, 6, 7, 8]);

      const recall = request.recall(result, 0);

      specimen.expect(recall.batch).toBe(0);
      specimen.expect(recall.stock).toBe(7);
    });

    specimen.it("batch first, then stock - with inventory", () => {
      const request = new ProductionRequest({ batch: 5, stock: 10 });
      const result = new ProductionResult([1, 2, 3, 4, 5, 6, 7, 8]);

      const recall = request.recall(result, 5);

      specimen.expect(recall.batch).toBe(0);
      specimen.expect(recall.stock).toBe(2);
    });

    specimen.it("batch only", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = new ProductionResult([1, 2, 3]);

      const recall = request.recall(result, 0);

      specimen.expect(recall.batch).toBe(2);
      specimen.expect(recall.stock).toBe(0);
    });
  });
});

specimen.describe("ProductionResult", () => {
  specimen.describe("construction", () => {
    specimen.it("from array", () => {
      const result = new ProductionResult([1, 2, 3]);

      specimen.expect(result.products).toEqual([1, 2, 3]);
      specimen.expect(result.condition).toBe(ProductionCondition.NOMINAL);
    });

    specimen.it("handles empty as exhausted", () => {
      const result = new ProductionResult([]);

      specimen.expect(result.products).toEqual([]);
      specimen.expect(result.condition).toBe(ProductionCondition.EXHAUSTED);
    });

    specimen.it("absorbs existing result", () => {
      const original = new ProductionResult([1, 2]);
      const copy = new ProductionResult(original);

      specimen.expect(copy).toBe(original);
    });

    specimen.it("from object with products", () => {
      const result = new ProductionResult({
        products: [1, 2],
        condition: ProductionCondition.LOCKED,
      });

      specimen.expect(result.products).toEqual([1, 2]);
      specimen.expect(result.condition).toBe(ProductionCondition.LOCKED);
    });
  });

  specimen.describe("cast methods", () => {
    specimen.it("nominal", () => {
      const result = ProductionResult.cast.nominal([1, 2, 3]);

      specimen.expect(result.products).toEqual([1, 2, 3]);
      specimen.expect(result.condition).toBe(ProductionCondition.NOMINAL);
    });

    specimen.it("exhausted", () => {
      const result = ProductionResult.cast.exhausted();

      specimen.expect(result.products).toEqual([]);
      specimen.expect(result.condition).toBe(ProductionCondition.EXHAUSTED);
    });

    specimen.it("locked", () => {
      const result = ProductionResult.cast.locked();

      specimen.expect(result.condition).toBe(ProductionCondition.LOCKED);
    });

    specimen.it("error", () => {
      const result = ProductionResult.cast.error("test error");

      specimen.expect(result.condition).toBe(ProductionCondition.ERROR);
      specimen.expect(result.meta.error).toBe("test error");
    });
  });

  specimen.describe("material", () => {
    specimen.it("filters non-signal products", () => {
      const result = new ProductionResult([
        { type: "PRODUCT", data: "a" },
        { type: "SIGNAL", data: "s" },
        { type: "PRODUCT", data: "b" },
      ]);

      specimen.expect(result.material.length).toBe(2);
    });
  });

  specimen.describe("isClosed", () => {
    specimen.it("true for terminal conditions", () => {
      specimen.expect(new ProductionResult([], ProductionCondition.EXHAUSTED).isClosed).toBe(true);
      specimen.expect(new ProductionResult([], ProductionCondition.LOCKED).isClosed).toBe(true);
      specimen.expect(new ProductionResult([], ProductionCondition.ERROR).isClosed).toBe(true);
    });

    specimen.it("false for nominal", () => {
      specimen.expect(new ProductionResult([1], ProductionCondition.NOMINAL).isClosed).toBe(false);
    });
  });

  specimen.describe("statusGiven", () => {
    specimen.it("returns FULFILLED when satisfied", () => {
      const request = new ProductionRequest({ batch: 3 });
      const result = new ProductionResult([1, 2, 3]);

      specimen.expect(result.statusGiven(request, 0)).toBe(ProductionStatus.FULFILLED);
    });

    specimen.it("returns PARTIAL when incomplete", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = new ProductionResult([1, 2]);

      specimen.expect(result.statusGiven(request, 0)).toBe(ProductionStatus.PARTIAL);
    });

    specimen.it("returns EXHAUSTED when empty and exhausted", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = new ProductionResult([], ProductionCondition.EXHAUSTED);

      specimen.expect(result.statusGiven(request, 0)).toBe(ProductionStatus.EXHAUSTED);
    });

    specimen.it("returns ERROR for error condition", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = ProductionResult.cast.error("test");

      specimen.expect(result.statusGiven(request, 0)).toBe(ProductionStatus.ERROR);
    });

    specimen.it("returns LOCKED for locked condition", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = ProductionResult.cast.locked();

      specimen.expect(result.statusGiven(request, 0)).toBe(ProductionStatus.LOCKED);
    });
  });

  specimen.describe("recallGiven", () => {
    specimen.it("returns null when fulfilled", () => {
      const request = new ProductionRequest({ batch: 3 });
      const result = new ProductionResult([1, 2, 3]);

      specimen.expect(result.recallGiven(request, 0)).toBe(null);
    });

    specimen.it("returns recall when partial", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = new ProductionResult([1, 2]);

      const recall = result.recallGiven(request, 0);

      specimen.expect(recall).toBeInstanceOf(ProductionRequest);
      specimen.expect(recall.batch).toBe(3);
    });

    specimen.it("returns null when exhausted", () => {
      const request = new ProductionRequest({ batch: 5 });
      const result = ProductionResult.cast.exhausted();

      specimen.expect(result.recallGiven(request, 0)).toBe(null);
    });
  });
});

specimen.describe("integration", () => {
  specimen.it("request-result cycle with partial fulfillment", () => {
    const request = new ProductionRequest({ batch: 5, stock: 20 });
    const result = new ProductionResult([1, 2, 3]);

    const status = result.statusGiven(request, 0);
    const recall = result.recallGiven(request, 0);

    specimen.expect(status).toBe(ProductionStatus.PARTIAL);
    specimen.expect(recall).toBeInstanceOf(ProductionRequest);
    specimen.expect(recall.batch).toBe(2);
    specimen.expect(recall.stock).toBe(20);
  });

  specimen.it("request-result cycle with overflow to stock", () => {
    const request = new ProductionRequest({ batch: 5, stock: 10 });
    const result = new ProductionResult([1, 2, 3, 4, 5, 6, 7, 8]);

    const status = result.statusGiven(request, 0);
    const recall = result.recallGiven(request, 0);

    specimen.expect(status).toBe(ProductionStatus.PARTIAL);
    specimen.expect(recall.batch).toBe(0);
    specimen.expect(recall.stock).toBe(7);
  });

  specimen.it("fulfilled stops recall", () => {
    const request = new ProductionRequest({ batch: 3 });
    const result = new ProductionResult([1, 2, 3]);

    const recall = result.recallGiven(request, 0);

    specimen.expect(recall).toBe(null);
  });

  specimen.it("exhausted condition prevents recall", () => {
    const request = new ProductionRequest({ batch: 5 });
    const result = ProductionResult.cast.exhausted();

    const status = result.statusGiven(request, 0);
    const recall = result.recallGiven(request, 0);

    specimen.expect(status).toBe(ProductionStatus.EXHAUSTED);
    specimen.expect(recall).toBe(null);
  });

  specimen.it("inventory contributes to fulfillment", () => {
    const request = new ProductionRequest({ batch: 5, stock: 10 });
    const result = new ProductionResult([1, 2, 3, 4]);

    const status = result.statusGiven(request, 11);

    specimen.expect(status).toBe(ProductionStatus.FULFILLED);
  });

  specimen.it("detects overcapacity", () => {
    const request = new ProductionRequest({ batch: 1, stock: 1 });
    const result = new ProductionResult([1, 2, 3]);

    const status = result.statusGiven(request, 2);

    specimen.expect(status).toBe(ProductionStatus.OVERCAPACITY);
  });
});
