import { specimen, shape } from "@vivalence/typology";
import * as domain from "../domain.viva.js";
import { STATUS, SIGNAL } from "../types.js";
import drivers from "../retention/index.js";
import { RetentionStatusEnum, RetentionDriverEnum } from "../entities/userspace/Retention.ts";
import { LiteralTraitsEnum } from "../entities/kernel/Literal.ts";

specimen.describe("domain module — what the runtime mounts", () => {
  specimen.it("manifest is a TOOLED, EXPOSED domain named language-learning", () => {
    specimen.expect(domain.manifest.type).toBe("domain");
    specimen.expect(domain.manifest.slug).toBe("language-learning");
    specimen.expect([...domain.manifest.traits].sort()).toEqual(["EXPOSED", "TOOLED"]);
  });

  specimen.it("exports the five entities, each a {type, schema, entity} tier keyed by its type", () => {
    specimen.expect(Object.keys(domain.entities).sort()).toEqual(["buffer", "literal", "retention", "symbol", "trace"]);
    for (const [key, tier] of Object.entries(domain.entities)) {
      specimen.expect(tier.type).toBe(key);
      specimen.expect(tier.schema).toBeTruthy();
      specimen.expect(typeof tier.entity).toBe("function");
    }
  });

  specimen.it("exposes the pick + review routes on its aperture and the four tools on its vector", () => {
    const routes = shape.strip(domain.aperture);
    specimen.expect(Object.keys(routes.branches.pick.branches.literal.branches).sort()).toEqual(["byStatus", "byStrength", "due", "feed", "novel"]);
    specimen.expect(Object.keys(routes.branches.review.branches)).toEqual(["literal"]);
    specimen.expect(Object.keys(shape.strip(domain.tools).branches).sort()).toEqual(["lookup", "progress", "queue", "review"]);
    specimen.expect(typeof domain.resolve).toBe("function");
  });
});

specimen.describe("domain scales — STATUS and SIGNAL are the one vocabulary every part speaks", () => {
  specimen.it("STATUS is the retention status enum, in ladder order", () => {
    specimen.expect(STATUS).toEqual(Object.values(RetentionStatusEnum));
    specimen.expect(STATUS).toEqual(["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"]);
  });

  specimen.it("every driver's verdicts stay inside STATUS for every SIGNAL, and the driver enum names the registry", () => {
    specimen.expect(Object.keys(drivers).sort()).toEqual(Object.values(RetentionDriverEnum).sort());
    for (const driver of Object.values(drivers)) {
      for (const value of SIGNAL) {
        const verdict = driver.encode({ enum: value });
        specimen.expect(STATUS).toContain(verdict.status);
      }
    }
  });

  specimen.it("SIGNAL is the five-step verdict scale, and the bayesian TAU table knows every one", () => {
    specimen.expect(SIGNAL).toEqual(["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"]);
    let threw = false;
    try {
      drivers.BAYESIAN.encode({ enum: "SHRUG" });
    } catch {
      threw = true;
    }
    specimen.expect(threw).toBe(true);
  });

  specimen.it("literal traits name the corpus vocabulary the resolver and tools read", () => {
    specimen.expect(Object.values(LiteralTraitsEnum).sort()).toEqual(["ANNOTATED", "CONJUGATED", "EXEMPLIFIED", "RANKED", "TRANSLATED", "VOCALIZED"]);
  });
});
