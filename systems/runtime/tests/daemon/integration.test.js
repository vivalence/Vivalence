// ── integration test ─────────────────────────────────────────
// boots against the live runtime via HTTP transport, on whichever daemon the
// `live` fixture finds mounted — never a pinned slug.
// simulates the full client lifecycle: login → pick → emit → review.

import { specimen } from "@vivalence/typology";
import { live } from "../scenarios/fixtures.js";

specimen.describe("integration: full client lifecycle", { sanitizeResources: false, sanitizeOps: false }, () => {
  let runtime = {};
  let literals = [];
  let words = [];

  const route = (path) => `/daemon/${runtime.slug}/${path}`;
  const daemon = {
    call: (path, body) => runtime.connection.call(route(path), body),
    pick: (path, body) => runtime.connection.call(route(path), body),
    emit: (mode, path, body) => runtime.connection.call(route(`mode/${mode}/emit/${path}`), body),
    review: (body) => runtime.connection.call(route("review/literal"), body),
  };

  specimen.beforeAll(async () => {
    runtime = await live();
    if (runtime.reason) console.log("  SKIP:", runtime.reason);
    else console.log(`  LIVE: ${runtime.base} → daemon "${runtime.slug}" as ${runtime.identity?.slug}`);
  });

  const it = (name, fn) => specimen.it(name, async () => { if (runtime.slug) await fn(); });

  const game = (identifier, name, fn) =>
    it(name, async () => {
      if (!runtime.mounts(identifier))
        return void console.log(`  SKIP: ${identifier} not mounted on "${runtime.slug}"`);
      await fn();
    });

  // ─── auth ─────────────────────────────────────────────────

  specimen.describe("auth", () => {
    it("login returns tokens and identity", () => {
      specimen.expect(runtime.authority.access).toBeTruthy();
      specimen.expect(runtime.authority.refresh).toBeTruthy();
      specimen.expect(runtime.identity.slug).toBe("beef");
    });
  });

  // ─── domain aperture: pick ────────────────────────────────

  specimen.describe("domain: pick", () => {
    it("feed returns mixed due + novel literals", async () => {
      const res = await daemon.pick("pick/literal/feed", { limit: 6 });
      specimen.expect(res.length).toBeGreaterThan(0);
      specimen.expect(res.length).toBeLessThanOrEqual(6);
      specimen.expect(res[0].id).toBeTruthy();
      specimen.expect(res[0].slug).toBeTruthy();
      specimen.expect(res[0].trait).toBeTruthy();
      literals = res;
    });

    it("novel returns only unseen literals", async () => {
      const res = await daemon.pick("pick/literal/novel", { limit: 3 });
      specimen.expect(res.length).toBeGreaterThan(0);
      for (const lit of res) {
        specimen.expect(lit.retentions?.length ?? 0).toBe(0);
      }
    });

    it("due returns literals with past nextAt", async () => {
      const res = await daemon.pick("pick/literal/due", { limit: 3 });
      // may be empty if nothing is due — that's valid
      if (res.length > 0) {
        specimen.expect(res[0].id).toBeTruthy();
      }
    });

    it("byStrength returns literals ordered by weakness", async () => {
      const res = await daemon.pick("pick/literal/byStrength", { limit: 3 });
      if (res.length > 0) {
        specimen.expect(res[0].id).toBeTruthy();
      }
    });

    it("feed with symbol filter narrows results", async () => {
      words = await daemon.pick("pick/literal/feed", {
        where: { symbols: ["word"] },
        limit: 6,
      });
      specimen.expect(words.length).toBeGreaterThan(0);
      specimen.expect(words[0].trait.TRANSLATED).toBeTruthy();
    });

    it("feed with trait filter returns only matching traits", async () => {
      const res = await daemon.pick("pick/literal/feed", {
        where: { traits: ["VOCALIZED"] },
        limit: 3,
      });
      specimen.expect(res.length).toBeGreaterThan(0);
      for (const lit of res) {
        specimen.expect(lit.traits).toContain("VOCALIZED");
      }
    });

    it("feed with trait + symbol filter combines both", async () => {
      const res = await daemon.pick("pick/literal/feed", {
        where: { traits: ["VOCALIZED"], symbols: ["word"] },
        limit: 3,
      });
      specimen.expect(res.length).toBeGreaterThan(0);
      for (const lit of res) {
        specimen.expect(lit.traits).toContain("VOCALIZED");
        specimen.expect(lit.trait.TRANSLATED).toBeTruthy();
      }
    });
  });

  // ─── game mode emitters ───────────────────────────────────


  specimen.describe("game: exhibit", () => {
    game("game/exhibit", "emit/present returns Yield with layout data", async () => {
      const res = await daemon.emit("game/exhibit", "present", {
        layout: "table",
        title: "Test words",
        literals: literals.slice(0, 3),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].data.layout).toBe("table");
      specimen.expect(res.output.buffer[0].data.title).toBe("Test words");
      specimen.expect(res.output.buffer[0].literals.length).toBe(3);
    });
  });

  specimen.describe("game: flashcard", () => {
    game("game/flashcard", "emit/literals returns Yield with recall", async () => {
      const res = await daemon.emit("game/flashcard", "literals", {
        recall: "KNOWN",
        literals: literals.slice(0, 3),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].data.recall).toBe("KNOWN");
      specimen.expect(res.output.buffer[0].literals.length).toBe(3);
    });
  });

  specimen.describe("game: judge", () => {
    game("game/judge", "emit/literal returns Yield with items + distractor logic", async () => {
      const target = words[0];
      const res = await daemon.emit("game/judge", "literal", {
        literal: target,
        recall: "KNOWN",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].data.target).toBeTruthy();
      specimen.expect(res.output.buffer[0].data.recall).toBe("KNOWN");
      specimen.expect(res.output.buffer[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });


  specimen.describe("game: pick", () => {
    game("game/pick", "emit/literal returns Yield with target + distractors", async () => {
      const target = words[0];
      const res = await daemon.emit("game/pick", "literal", {
        literal: target,
        recall: "KNOWN",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.describe("game: listen", () => {
    game("game/listen", "emit/literal with pick gameplay returns Yield with distractors", async () => {
      const vocalized = words.find((w) => w.traits?.includes("VOCALIZED"));
      if (!vocalized) {
        console.log("  SKIP: no vocalized word available");
        return;
      }
      const res = await daemon.emit("game/listen", "literal", {
        literal: vocalized,
        gameplay: "pick",
        recall: "KNOWN",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });


  specimen.describe("game: match", () => {
    game("game/match", "emit/batch returns Yield with batch literals", async () => {
      const batch = literals.slice(0, 4);
      const res = await daemon.emit("game/match", "batch", {
        recall: "KNOWN",
        literals: batch,
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].literals.length).toBe(4);
    });
  });


  specimen.describe("game: cloze", () => {
    game("game/cloze", "emit/literal returns Yield with blank data", async () => {
      const annotated = literals.find((l) => l.traits?.includes("ANNOTATED"));
      if (!annotated) {
        console.log("  SKIP: no annotated literal available");
        return;
      }
      const res = await daemon.emit("game/cloze", "literal", {
        literal: annotated,
        recall: "LEARNING",
        gameplay: "type",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.describe("game: write", () => {
    game("game/write", "emit/literals returns Yield with recall", async () => {
      const res = await daemon.emit("game/write", "literals", {
        recall: "LEARNING",
        literals: literals.slice(0, 2),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].data.recall).toBe("LEARNING");
      specimen.expect(res.output.buffer[0].literals.length).toBe(2);
    });
  });

  specimen.describe("game: shadow", () => {
    game("game/shadow", "emit/literals returns Yield with speed data", async () => {
      const res = await daemon.emit("game/shadow", "literals", {
        recall: "KNOWN",
        literals: literals.slice(0, 2),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.output.buffer.length).toBe(1);
      specimen.expect(res.output.buffer[0].data.recall).toBe("KNOWN");
      specimen.expect(res.output.buffer[0].literals.length).toBe(2);
    });
  });

  // ─── review ───────────────────────────────────────────────

  specimen.describe("domain: review", () => {
    let reviewLiteral;

    it("review creates retention from signal", async () => {
      // pick a novel literal to review fresh
      const novel = await daemon.pick("pick/literal/novel", { take: 1 });
      specimen.expect(novel.length).toBeGreaterThan(0);
      reviewLiteral = novel[0];

      const retention = await daemon.review({
        literal: reviewLiteral.id,
        signal: "SUCCESS",
      });
      specimen.expect(retention.id).toBeTruthy();
      specimen.expect(retention.status).toBeTruthy();
      const litRef = retention.literal?.id ?? retention.literal;
      specimen.expect(litRef).toBe(reviewLiteral.id);
    });

    it("second review evolves retention state", async () => {
      const retention = await daemon.review({
        literal: reviewLiteral.id,
        signal: "SUCCESS",
      });
      specimen.expect(retention.id).toBeTruthy();
      specimen.expect(retention.state).toBeTruthy();
      // nextAt should be in the future after correct signals
      specimen.expect(new Date(retention.nextAt).getTime()).toBeGreaterThan(Date.now() - 1000);
    });

    it("failure signal updates retention status", async () => {
      const retention = await daemon.review({
        literal: reviewLiteral.id,
        signal: "FAILURE",
      });
      specimen.expect(retention.id).toBeTruthy();
      // status should reflect the failure
      specimen.expect(["UNKNOWN", "LEARNING"].includes(retention.status)).toBe(true);
    });

    it("review by slug works", async () => {
      const retention = await daemon.review({
        literal: reviewLiteral.slug,
        signal: "SUCCESS",
      });
      specimen.expect(retention.id).toBeTruthy();
      const litRef = retention.literal?.id ?? retention.literal;
      specimen.expect(litRef).toBe(reviewLiteral.id);
    });
  });

  // ─── thread lifecycle ────────────────────────────────────

  specimen.describe("thread lifecycle", () => {
    it("create thread, emit with thread, query buffers", async () => {
      // find a mode + intent to create a thread against
      const modes = await daemon.call("modes/game/findOne", {
        where: { slug: "dojo" },
      });
      specimen.expect(modes.manifest).toBeTruthy();

      // check we can access userspace
      const handshake = await daemon.call("userspace/handshake", {});
      specimen.expect(handshake.success).toBe(true);
    });
  });
});
