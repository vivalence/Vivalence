// m92 law 10 — the walk's drops are loud: Long past 20 steps, Short on an empty signal, each a coded error
import { specimen, steer, KeySignal, Vector } from "@vivalence/typology";
import { Long, Short } from "@vivalence/typology";

const ladder = (depth) => {
  const root = new Vector();
  let rung = root;
  for (let step = 0; step < depth; step++) rung = rung.branch(`k${step}`);
  rung.open("end", "/reached");
  return root;
};

specimen.describe("walk — the drops", () => {
  specimen.it("a walk past 20 steps throws Long, code LONG", async () => {
    let step = 0;
    const more = () => new KeySignal(`k${step++}`);
    const error = await steer.dispatch.walk(ladder(25), more).catch((caught) => caught);
    specimen.expect(error).toBeInstanceOf(Long);
    specimen.expect(error.code).toBe("LONG");
    specimen.expect(error.message).toBe("Max steps");
    specimen.expect(step).toBe(20);
  });

  specimen.it("a walk handed an empty signal throws Short, code SHORT", async () => {
    const error = await steer.dispatch.walk(ladder(1), () => []).catch((caught) => caught);
    specimen.expect(error).toBeInstanceOf(Short);
    specimen.expect(error.code).toBe("SHORT");
    specimen.expect(error.message).toBe("No more signal");
  });

  specimen.it("a walk under 20 steps reaches its literal effect", async () => {
    let step = 0;
    const more = () => new KeySignal(step < 19 ? `k${step++}` : "end");
    const [effect, , steps] = await steer.dispatch.walk(ladder(19), more);
    specimen.expect(effect).toBe("/reached");
    specimen.expect(steps.length).toBe(20);
  });
});
