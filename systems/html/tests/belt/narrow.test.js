import { specimen } from "@vivalence/typology";
import * as narrow from "../../src/typology/belt/narrow.js";

const nodes = [
  {
    nature: "survival",
    signature: { nature: "survival", valence: { name: "Survival", prompt: "tactic" }, keyed: { command: "s", modifier: "ctrl" } },
  },
  {
    nature: "conjugation",
    signature: { nature: "conjugation", valence: { name: "Conjugation", prompt: "game" }, keyed: { command: "c" } },
  },
  {
    nature: "dashboard",
    signature: { nature: "dashboard", valence: { name: "Dashboard", prompt: "dashboard" } },
  },
  {
    nature: "warmup",
    signature: { nature: "warmup", valence: { name: "Warm Up", prompt: "tactic · five-fold-session" } },
  },
  {
    nature: "thread-abc",
    signature: { nature: "thread-abc", valence: { name: "survival session", prompt: "tactic" } },
  },
];

specimen.describe("narrow", () => {
  specimen.describe("text matcher", () => {
    const matchers = [narrow.text("nature", "signature.valence.name")];

    specimen.it("matches on nature", () => {
      const result = narrow.narrow("surv", nodes, matchers);
      specimen.expect(result.length).toBe(2);
      specimen.expect(result[0].nature).toBe("survival");
      specimen.expect(result[1].nature).toBe("thread-abc");
    });

    specimen.it("matches on valence.name", () => {
      const result = narrow.narrow("warm up", nodes, matchers);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].nature).toBe("warmup");
    });

    specimen.it("empty query returns all", () => {
      const result = narrow.narrow("", nodes, matchers);
      specimen.expect(result.length).toBe(5);
    });
  });

  specimen.describe("keyed matcher", () => {
    const matchers = [narrow.keyed()];

    specimen.it("matches shortcut", () => {
      const result = narrow.narrow("ctrl+s", nodes, matchers);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].nature).toBe("survival");
    });

    specimen.it("matches partial shortcut", () => {
      const result = narrow.narrow("c", nodes, matchers);
      specimen.expect(result.length).toBe(2);
    });
  });

  specimen.describe("navigation preset", () => {
    specimen.it("matches on nature and valence", () => {
      const result = narrow.narrow("tactic", nodes, narrow.navigation);
      specimen.expect(result.length).toBe(3);
    });

    specimen.it("multi-term AND across matchers", () => {
      const result = narrow.narrow("surv ctrl", nodes, narrow.navigation);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].nature).toBe("survival");
    });
  });

  specimen.describe("rank", () => {
    specimen.it("exact matches first", () => {
      const filtered = [nodes[0], nodes[3]];
      const ranked = narrow.rank(filtered, narrow.byExact("warmup"));
      specimen.expect(ranked[0].nature).toBe("warmup");
    });

    specimen.it("prefix matches before substring", () => {
      const ranked = narrow.rank([...nodes], narrow.byPrefix("conj"));
      specimen.expect(ranked[0].nature).toBe("conjugation");
    });
  });
});
