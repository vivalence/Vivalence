import { specimen, shape } from "@vivalence/typology";
import { SIGNAL } from "../../types.js";
import { mount } from "../scenarios/domain.js";
import { line } from "../../tools/line.js";

let scenario;

specimen.beforeAll(async () => {
  scenario = await mount();
});

specimen.afterAll(async () => await scenario?.orm?.close());

specimen.describe("tools — the vector and its four routes", () => {
  specimen.it("exposes progress · lookup · queue · review, each with an input schema on the wire", () => {
    const stripped = shape.strip(scenario.domain.tools);
    specimen.expect(Object.keys(stripped.branches).sort()).toEqual(["lookup", "progress", "queue", "review"]);
    for (const name of Object.keys(stripped.branches)) {
      specimen.expect(stripped.branches[name].effect?.input?.type).toBe("object");
      specimen.expect(typeof scenario.tools[`/${name}`]).toBe("function");
    }
    const options = (schema) => (schema.enum ?? schema.anyOf?.map((entry) => entry.const) ?? []).slice().sort();
    specimen.expect(options(stripped.branches.queue.effect.input.properties.pick)).toEqual(["due", "feed", "novel", "status", "weakest"]);
    specimen.expect(options(stripped.branches.review.effect.input.properties.reviews.items.properties.signal)).toEqual([...SIGNAL].sort());
  });

  specimen.it("line: slug · learning (known) · ontology · status", () => {
    specimen.expect(line({ slug: "x", ontology: "word", trait: { TRANSLATED: { known: "k", learning: "l" } } })).toBe("x · l (k) · word · UNTOUCHED");
    specimen.expect(line({ slug: "y", ontology: "sentence", trait: {}, retention: { status: "KNOWN" } })).toBe("y ·  () · sentence · KNOWN");
  });
});

specimen.describe("tools — lookup", () => {
  specimen.it("matches slug and both translations, returns entities + slugs", async () => {
    const out = await scenario.invoke("/lookup", { text: "obrigado", limit: 12 });
    specimen.expect(out.object.slugs).toEqual(["thanks"]);
    specimen.expect(out.entities.literal.length).toBe(1);
    specimen.expect(out.message).toContain("thanks · obrigado (thanks)");
    const bySlug = await scenario.invoke("/lookup", { text: "chama", limit: 12 });
    specimen.expect(bySlug.object.slugs.sort()).toEqual(["chamar.presente.indicativo", "chamar.verb", "chamas.verb"]);
    const byKnown = await scenario.invoke("/lookup", { text: "hello", limit: 12 });
    specimen.expect(byKnown.object.slugs).toContain("hello");
    specimen.expect(byKnown.object.slugs).toContain("ola-tchau");
  });

  specimen.it("says so when nothing matches — never invents a slug", async () => {
    const out = await scenario.invoke("/lookup", { text: "zzzz-nope", limit: 12 });
    specimen.expect(out.message).toContain("not in the corpus");
    specimen.expect(out.entities).toBeUndefined();
  });
});

specimen.describe("tools — queue", () => {
  specimen.it("due · feed · novel · weakest · status draw through the repository, symbols AND together", async () => {
    const due = await scenario.invoke("/queue", { pick: "due", limit: 12 });
    specimen.expect(due.object.slugs).toEqual(["goodbye"]);
    const feed = await scenario.invoke("/queue", { pick: "feed", limit: 3 });
    specimen.expect(feed.object.slugs[0]).toBe("goodbye");
    specimen.expect(feed.object.slugs.length).toBe(3);
    const novel = await scenario.invoke("/queue", { pick: "novel", symbols: ["greeting", "polite"], limit: 12 });
    specimen.expect(novel.object.slugs.sort()).toEqual(["please", "thanks"]);
    const weakest = await scenario.invoke("/queue", { pick: "weakest", limit: 12 });
    specimen.expect(weakest.object.slugs.sort()).toEqual(["goodbye", "hello"]);
    const status = await scenario.invoke("/queue", { pick: "status", status: ["KNOWN"], limit: 12 });
    specimen.expect(status.object.slugs).toEqual(["hello"]);
    specimen.expect(status.message).toContain("KNOWN");
  });

  specimen.it("an empty draw says so", async () => {
    const out = await scenario.invoke("/queue", { pick: "due", symbols: ["polite"], limit: 12 });
    specimen.expect(out.message).toContain("queue is empty");
    specimen.expect(out.entities).toBeUndefined();
  });
});

specimen.describe("tools — review", () => {
  specimen.it("refuses without a user", async () => {
    const out = await scenario.invoke("/review", { reviews: [{ literal: "please", signal: "SUCCESS" }] }, { user: null });
    specimen.expect(out.condition).toBe("ERROR");
  });

  specimen.it("reviews every listed literal through /review/literal, reports unknown slugs, returns the retentions", async () => {
    const out = await scenario.invoke("/review", {
      reviews: [
        { literal: "please", signal: "SUCCESS" },
        { literal: "thanks", signal: "MISTAKE" },
        { literal: "no.such.slug", signal: "SUCCESS" },
      ],
    });
    specimen.expect(out.entities.retention.length).toBe(2);
    specimen.expect(out.message).toContain("please SUCCESS →");
    specimen.expect(out.message).toContain("thanks MISTAKE →");
    specimen.expect(out.message).toContain("no.such.slug — not in the corpus");
    const novel = await scenario.invoke("/queue", { pick: "novel", limit: 50 });
    specimen.expect(novel.object.slugs).not.toContain("please");
    specimen.expect(novel.object.slugs).not.toContain("thanks");
  });
});

specimen.describe("tools — progress", () => {
  specimen.it("counts literals, retentions by status, due, and names the weakest", async () => {
    const out = await scenario.invoke("/progress", {});
    specimen.expect(out.message).toContain("[Learner report]");
    specimen.expect(out.message).toMatch(/Vocabulary: \d+ literals · 4 with retention/);
    specimen.expect(out.message).toMatch(/known 1/);
    specimen.expect(out.message).toMatch(/learning 1/);
    specimen.expect(out.message).toMatch(/1 due for review/);
    specimen.expect(out.message).toContain("Weakest words:");
  });
});
