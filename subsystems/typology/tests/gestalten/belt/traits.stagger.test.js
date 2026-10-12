import { specimen, traits } from "@vivalence/typology";

const { stagger } = traits;

specimen.describe("traits.stagger", () => {
  specimen.it("runs the module's declared traits in order, collecting finalizers and terminators", async () => {
    const order = [];
    const module = { manifest: { traits: ["ONE", "TWO", "THREE", "FOUR"] } };
    const context = { host: "stub" };
    const catalog = {
      ONE: (held, ctx) => {
        order.push(["ONE", held === module, ctx === context]);
        return () => order.push("finalize ONE");
      },
      TWO: async () => {
        order.push(["TWO"]);
        return { finalize: () => order.push("finalize TWO"), terminate: () => order.push("terminate TWO") };
      },
      THREE: () => {
        order.push(["THREE"]);
      },
    };
    const finalizers = await stagger(module, context, catalog);
    specimen.expect(order).toEqual([["ONE", true, true], ["TWO"], ["THREE"]]);
    specimen.expect(finalizers.length).toBe(2);
    for (const finalize of finalizers) finalize();
    specimen.expect(order.slice(3)).toEqual(["finalize ONE", "finalize TWO"]);
    specimen.expect(module.terminators.length).toBe(1);
    module.terminators[0]();
    specimen.expect(order.at(-1)).toBe("terminate TWO");
  });

  specimen.it("a trait the catalog lacks is skipped, not thrown", async () => {
    const module = { manifest: { traits: ["MISSING"] } };
    specimen.expect(await stagger(module, {}, {})).toEqual([]);
    specimen.expect(module.terminators).toBe(undefined);
  });

});
