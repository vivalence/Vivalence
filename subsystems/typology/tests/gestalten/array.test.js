import { specimen, array } from "@vivalence/typology";

specimen.describe("array", () => {
  specimen.it("a point finds its nearest neighbor in any dimension", () => {
    const pair = [
      { name: "a", point: [0.4, 0.6, 0.6] },
      { name: "b", point: [0.9, 1.0, 0.3] },
    ];
    specimen.expect(array.nearest(pair, [0.4, 0.6, 0.6], (item) => item.point).name).toBe("a");

    const models = [
      { name: "haiku", point: [0.1, 0.3, 1.0] },
      { name: "sonnet", point: [0.4, 0.6, 0.6] },
      { name: "opus", point: [0.9, 1.0, 0.3] },
    ];
    specimen.expect(array.nearest(models, [0.1, 0.3, 0.9], (item) => item.point).name).toBe("haiku");
    specimen.expect(array.nearest(models, [0.9, 1.0, 0.2], (item) => item.point).name).toBe("opus");
    specimen.expect(array.nearest(models, [0.5, 0.6, 0.5], (item) => item.point).name).toBe("sonnet");

    const fivefold = [
      { point: [1, 2, 3, 4, 5] },
      { point: [5, 4, 3, 2, 1] },
    ];
    specimen.expect(array.nearest(fivefold, [1, 2, 3, 4, 6], (item) => item.point).point).toEqual([1, 2, 3, 4, 5]);
  });

  specimen.it("an empty field yields null and a bare item is its own point", () => {
    specimen.expect(array.nearest([], [0.5, 0.5, 0.5], (item) => item)).toBeNull();

    const barePoints = [[0.1, 0.2], [0.8, 0.9]];
    specimen.expect(array.nearest(barePoints, [0.7, 0.8])).toEqual([0.8, 0.9]);
  });
});
