import { monad, specimen } from "@vivalence/typology";

specimen.describe("monad — kleisli composes value → Promise<value> arrows", () => {
  specimen.it("runs the arrows in order, each on what the last returned", async () => {
    specimen.expect(await monad.kleisli([(n) => n + 1, async (n) => n * 10, (n) => n - 3])(1)).toBe(17);
  });

  specimen.it("arrows that hand back plain values run in the caller's tick — a boot starts before the caller's next line", () => {
    const seen = [];
    monad.kleisli([(n) => (seen.push(n), n + 1), (n) => seen.push(n)])(1);
    specimen.expect(seen).toEqual([1, 2]);
  });

  specimen.it("a throwing arrow rejects the whole; the arrows after it never run", async () => {
    const seen = [];
    const arrows = [() => { throw new Error("refused"); }, (n) => seen.push(n)];
    await specimen.expect(monad.kleisli(arrows)(1)).rejects.toThrow("refused");
    specimen.expect(seen).toEqual([]);
  });

  specimen.it("traverse runs one arrow over every input at once; one rejection rejects the fan", async () => {
    specimen.expect(await monad.traverse([1, 2, 3], async (n) => n * 2)).toEqual([2, 4, 6]);
    await specimen.expect(monad.traverse([1, 2], async (n) => { if (n === 2) throw new Error("two"); return n; })).rejects.toThrow("two");
  });
});
