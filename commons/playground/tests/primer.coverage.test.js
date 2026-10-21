// m83: every hallucination.system writer became primer.open — the three playground personas land as one eager section each
import { shape, specimen, steer, Vector } from "@vivalence/typology";
import { harness as oracle } from "../chaosmonkey/oracle/harness.js";
import { harness as reader } from "../chaosmonkey/reader/harness.js";
import { harness as dealer, emitter as dealing } from "../dealer/dealer.viva.js";

const render = (harness) => {
  const run = new Vector();
  run.use(async (ctx, next) => {
    ctx.hallucination = { primer: new Vector() };
    await next();
  });
  run.graft(harness);
  run.open("/render", (ctx) => shape.primer.load(ctx.hallucination.primer, ctx));
  return steer.dispatch.invoke(run, "/render", steer.strategy.guarded)({});
};

const PERSONAS = [
  ["oracle", oracle, "You are the Oracle, a presence living inside vivalence's chaosmonkey harness testbed."],
  ["reader", reader, "You are Reader, a UI craftsman living inside vivalence."],
  ["dealer", dealer, "You are the Dealer in a card-game playground inside vivalence."],
];

specimen.describe("playground — a persona is one eager primer section under the mode's name", () => {
  for (const [nature, harness, opening] of PERSONAS) {
    specimen.it(`${nature}: the harness opens '${nature}' and nothing else; the text opens with the persona`, async () => {
      const system = await render(harness);
      specimen.expect(Object.keys(system)).toEqual([nature]);
      specimen.expect(system[nature].startsWith(opening)).toBe(true);
    });
  }

  specimen.it("a second render opens the same section again — the harness holds no state between requests", async () => {
    specimen.expect(await render(oracle)).toEqual(await render(oracle));
  });
});

const table = (seed) => {
  const dealt = [];
  const run = new Vector();
  run.use(async (ctx, next) => {
    Object.assign(ctx, {
      modes: { playground: { card: { buffer: (held) => held } } },
      pool: { add: (buffer) => dealt.push(buffer.data.face) },
      ...seed,
    });
    await next();
  });
  run.graft(dealing);
  return { dealt, deal: (path, input) => steer.dispatch.invoke(run, path, steer.strategy.guarded)(input) };
};

specimen.describe("dealer — the emitter deals card buffers off a finite deck", () => {
  specimen.it("/deal deals the next count from thread.counter; past the end the deck is exhausted", async () => {
    const fresh = table({ thread: null });
    await fresh.deal("/deal", {});
    specimen.expect(fresh.dealt).toEqual(["A♠", "K♥"]);
    const late = table({ thread: { counter: 7 } });
    await late.deal("/deal", { count: 3 });
    specimen.expect(late.dealt).toEqual(["7♣"]);
  });

  specimen.it("/oracle keeps only the faces the harness names that are in the deck", async () => {
    const asked = [];
    const seat = table({
      mode: { harness: { object: { render: async (request) => (asked.push(request), { output: { object: { faces: ["Q♦", "joker", "A♠"] } } }) } } },
    });
    await seat.deal("/oracle", { focus: "royals", thread: "th-1" });
    specimen.expect(seat.dealt).toEqual(["Q♦", "A♠"]);
    specimen.expect(asked[0].turns[0].parts[0].text).toBe("Pick 3 cards for a themed hand from this deck: A♠ K♥ Q♦ J♣ 10♠ 9♥ 8♦ 7♣.\nTheme: royals.\nReturn the faces only, exactly as written in the deck.");
    specimen.expect(asked[0].tune).toBe("frugal");
    specimen.expect(asked[0].thread).toBe("th-1");
  });
});
