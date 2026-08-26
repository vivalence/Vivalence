// aprende EXPOSED aperture — /assistant/wakeup/literals
// Literals at the intersection of a symbol set, over the real HTTP-shaped
// connection into the scenario aprende mode. Logs the virtual literals.
import { specimen } from "@vivalence/typology";
import { mountMode } from "../scenarios/mode.js";
import { accio } from "../scenarios/registry.js";

const ROUTE = "/mode/homepage/aprende/assistant/wakeup/literals";

specimen.describe("aprende: /assistant/wakeup/literals (symbol intersection)", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await mountMode(await accio("@education/homepage/aprende"));
  });

  specimen.afterAll(async () => {
    await scenario.datamap.disintegrate();
  });

  const intersect = (symbols) => scenario.conn.call(ROUTE, { symbols });

  const log = (label, result) => {
    console.log(`\n── ${label} → ${result.count} literal(s) ──`);
    for (const literal of result.literals)
      console.log(`   ${literal.learning}  (${literal.known})  [${literal.symbols.join(", ")}]`);
  };

  specimen.it("∩ {greeting} → all four", async () => {
    const result = await intersect(["greeting"]);
    log("greeting", result);
    specimen.expect(result.count).toBe(4);
  });

  specimen.it("∩ {greeting, casual} → hello, goodbye", async () => {
    const result = await intersect(["greeting", "casual"]);
    log("greeting ∩ casual", result);
    specimen.expect(result.literals.map((l) => l.slug).sort()).toEqual(["goodbye", "hello"]);
  });

  specimen.it("∩ {greeting, polite} → thanks, please", async () => {
    const result = await intersect(["greeting", "polite"]);
    log("greeting ∩ polite", result);
    specimen.expect(result.literals.map((l) => l.slug).sort()).toEqual(["please", "thanks"]);
  });

  specimen.it("∩ {casual, polite} → ∅ (disjoint)", async () => {
    const result = await intersect(["casual", "polite"]);
    log("casual ∩ polite", result);
    specimen.expect(result.count).toBe(0);
  });
});
