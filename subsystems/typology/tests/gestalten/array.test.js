import { specimen, array } from "@vivalence/typology";

specimen.describe("array.nearest", () => {

  specimen.it("exact match returns the item", () => {
    const items = [
      { name: "a", point: [0.4, 0.6, 0.6] },
      { name: "b", point: [0.9, 1.0, 0.3] },
    ];
    const result = array.nearest(items, [0.4, 0.6, 0.6], (item) => item.point);
    specimen.expect(result.name).toBe("a");
  });

  specimen.it("picks closest in 3-space across spread items", () => {
    const items = [
      { name: "haiku", point: [0.1, 0.3, 1.0] },
      { name: "sonnet", point: [0.4, 0.6, 0.6] },
      { name: "opus", point: [0.9, 1.0, 0.3] },
    ];

    specimen.expect(array.nearest(items, [0.1, 0.3, 0.9], (item) => item.point).name).toBe("haiku");
    specimen.expect(array.nearest(items, [0.9, 1.0, 0.2], (item) => item.point).name).toBe("opus");
    specimen.expect(array.nearest(items, [0.5, 0.6, 0.5], (item) => item.point).name).toBe("sonnet");
  });

  specimen.it("empty array returns null", () => {
    specimen.expect(array.nearest([], [0.5, 0.5, 0.5], (item) => item)).toBeNull();
  });

  specimen.it("works in arbitrary dimensions", () => {
    const items = [
      { point: [1, 2, 3, 4, 5] },
      { point: [5, 4, 3, 2, 1] },
    ];
    const result = array.nearest(items, [1, 2, 3, 4, 6], (item) => item.point);
    specimen.expect(result.point).toEqual([1, 2, 3, 4, 5]);
  });

  specimen.it("default accessor treats item itself as the point", () => {
    const items = [[0.1, 0.2], [0.8, 0.9]];
    const result = array.nearest(items, [0.7, 0.8]);
    specimen.expect(result).toEqual([0.8, 0.9]);
  });
});
