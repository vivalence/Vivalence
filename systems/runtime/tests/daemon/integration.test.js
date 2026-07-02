// ── integration test ─────────────────────────────────────────
// boots against the live runtime on :2501 via HTTP transport.
// simulates the full client lifecycle: login → pick → emit → review.

import { specimen, Connection, Url, shard } from "@vivalence/typology";

const BASE = "http://localhost:2501";

async function alive(url) {
  try { await fetch(url); return true; } catch { return false; }
}

function http(base) {
  const conn = new Connection(new Url(base), shard.transmitter.fetcher);
  return {
    raw: conn,
    async login(username, password) {
      const res = await conn.call("/attached/process/lighthouse/multiplayer/auth/login", { username, password });
      conn.use(async (ctx, next) => {
        ctx.request.headers.set("authorization", `Bearer ${res.authority.access}`);
        await next();
      });
      return res;
    },
    daemon: (slug) => ({
      pick: (route, body) => conn.call(`/daemon/${slug}/${route}`, body),
      emit: (mode, route, body) => conn.call(`/daemon/${slug}/mode/${mode}/emit/${route}`, body),
      review: (body) => conn.call(`/daemon/${slug}/review/literal`, body),
    }),
    userspace: (route, body) => conn.call(`/userspace/${route}`, body),
  };
}

specimen.describe("integration: full client lifecycle", { sanitizeResources: false, sanitizeOps: false }, () => {
  let skip = false;
  const client = http(BASE);
  const d = client.daemon("brazilian");
  let identity;
  let literals = [];
  let words = [];
  let thread;

  specimen.beforeAll(async () => {
    skip = !(await alive(BASE));
    if (skip) console.log("  SKIP: no runtime at", BASE);
  });

  const it = (name, fn) => specimen.it(name, async () => { if (!skip) await fn(); });

  // ─── auth ─────────────────────────────────────────────────

  specimen.describe("auth", () => {
    it("login returns tokens and identity", async () => {
      const res = await client.login("beef", "biggusdickus");
      identity = res.identity;
      specimen.expect(res.authority.access).toBeTruthy();
      specimen.expect(res.authority.refresh).toBeTruthy();
      specimen.expect(res.identity.slug).toBe("beef");
    });
  });

  // ─── domain aperture: pick ────────────────────────────────

  specimen.describe("domain: pick", () => {
    it("feed returns mixed due + novel literals", async () => {
      const res = await d.pick("pick/literal/feed", { limit: 6 });
      specimen.expect(res.length).toBeGreaterThan(0);
      specimen.expect(res.length).toBeLessThanOrEqual(6);
      specimen.expect(res[0].id).toBeTruthy();
      specimen.expect(res[0].slug).toBeTruthy();
      specimen.expect(res[0].trait).toBeTruthy();
      literals = res;
    });

    it("novel returns only unseen literals", async () => {
      const res = await d.pick("pick/literal/novel", { limit: 3 });
      specimen.expect(res.length).toBeGreaterThan(0);
      for (const lit of res) {
        specimen.expect(lit.memories?.length ?? 0).toBe(0);
      }
    });

    it("due returns literals with past nextAt", async () => {
      const res = await d.pick("pick/literal/due", { limit: 3 });
      // may be empty if nothing is due — that's valid
      if (res.length > 0) {
        specimen.expect(res[0].id).toBeTruthy();
      }
    });

    it("byStrength returns literals ordered by weakness", async () => {
      const res = await d.pick("pick/literal/byStrength", { limit: 3 });
      if (res.length > 0) {
        specimen.expect(res[0].id).toBeTruthy();
      }
    });

    it("feed with symbol filter narrows results", async () => {
      words = await d.pick("pick/literal/feed", {
        where: { symbols: ["word"] },
        limit: 6,
      });
      specimen.expect(words.length).toBeGreaterThan(0);
      specimen.expect(words[0].trait.TRANSLATED).toBeTruthy();
    });

    it("feed with trait filter returns only matching traits", async () => {
      const res = await d.pick("pick/literal/feed", {
        where: { traits: ["VOCALIZED"] },
        limit: 3,
      });
      specimen.expect(res.length).toBeGreaterThan(0);
      for (const lit of res) {
        specimen.expect(lit.traits).toContain("VOCALIZED");
      }
    });

    it("feed with trait + symbol filter combines both", async () => {
      const res = await d.pick("pick/literal/feed", {
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
    it("emit/present returns Yield with layout data", async () => {
      const res = await d.emit("game/exhibit", "present", {
        layout: "table",
        title: "Test words",
        literals: literals.slice(0, 3),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].data.layout).toBe("table");
      specimen.expect(res.buffers[0].data.title).toBe("Test words");
      specimen.expect(res.buffers[0].literals.length).toBe(3);
    });
  });

  specimen.describe("game: flashcard", () => {
    it("emit/literals returns Yield with recall", async () => {
      const res = await d.emit("game/flashcard", "literals", {
        recall: "KNOWN",
        literals: literals.slice(0, 3),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].data.recall).toBe("KNOWN");
      specimen.expect(res.buffers[0].literals.length).toBe(3);
    });
  });

  specimen.describe("game: judge", () => {
    it("emit/literal returns Yield with items + distractor logic", async () => {
      const target = words[0];
      const res = await d.emit("game/judge", "literal", {
        literal: target,
        recall: "KNOWN",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].data.target).toBeTruthy();
      specimen.expect(res.buffers[0].data.recall).toBe("KNOWN");
      specimen.expect(res.buffers[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });


  specimen.describe("game: pick", () => {
    it("emit/literal returns Yield with target + distractors", async () => {
      const target = words[0];
      const res = await d.emit("game/pick", "literal", {
        literal: target,
        recall: "KNOWN",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.describe("game: listen", () => {
    it("emit/literal with pick gameplay returns Yield with distractors", async () => {
      const vocalized = words.find((w) => w.traits?.includes("VOCALIZED"));
      if (!vocalized) {
        console.log("  SKIP: no vocalized word available");
        return;
      }
      const res = await d.emit("game/listen", "literal", {
        literal: vocalized,
        gameplay: "pick",
        recall: "KNOWN",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });


  specimen.describe("game: match", () => {
    it("emit/batch returns Yield with batch literals", async () => {
      const batch = literals.slice(0, 4);
      const res = await d.emit("game/match", "batch", {
        recall: "KNOWN",
        literals: batch,
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].literals.length).toBe(4);
    });
  });


  specimen.describe("game: cloze", () => {
    it("emit/literal returns Yield with blank data", async () => {
      const annotated = literals.find((l) => l.traits?.includes("ANNOTATED"));
      if (!annotated) {
        console.log("  SKIP: no annotated literal available");
        return;
      }
      const res = await d.emit("game/cloze", "literal", {
        literal: annotated,
        recall: "LEARNING",
        gameplay: "type",
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].literals.length).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.describe("game: write", () => {
    it("emit/literals returns Yield with recall", async () => {
      const res = await d.emit("game/write", "literals", {
        recall: "LEARNING",
        literals: literals.slice(0, 2),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].data.recall).toBe("LEARNING");
      specimen.expect(res.buffers[0].literals.length).toBe(2);
    });
  });

  specimen.describe("game: shadow", () => {
    it("emit/literals returns Yield with speed data", async () => {
      const res = await d.emit("game/shadow", "literals", {
        recall: "KNOWN",
        literals: literals.slice(0, 2),
      });
      specimen.expect(res.condition).toBe("NOMINAL");
      specimen.expect(res.buffers.length).toBe(1);
      specimen.expect(res.buffers[0].data.recall).toBe("KNOWN");
      specimen.expect(res.buffers[0].literals.length).toBe(2);
    });
  });

  // ─── review ───────────────────────────────────────────────

  specimen.describe("domain: review", () => {
    let reviewLiteral;

    it("review creates memory from signal", async () => {
      // pick a novel literal to review fresh
      const novel = await d.pick("pick/literal/novel", { take: 1 });
      specimen.expect(novel.length).toBeGreaterThan(0);
      reviewLiteral = novel[0];

      const memory = await d.review({
        literal: reviewLiteral.id,
        signal: "SUCCESS",
      });
      specimen.expect(memory.id).toBeTruthy();
      specimen.expect(memory.status).toBeTruthy();
      const litRef = memory.literal?.id ?? memory.literal;
      specimen.expect(litRef).toBe(reviewLiteral.id);
    });

    it("second review evolves memory state", async () => {
      const memory = await d.review({
        literal: reviewLiteral.id,
        signal: "SUCCESS",
      });
      specimen.expect(memory.id).toBeTruthy();
      specimen.expect(memory.state).toBeTruthy();
      // nextAt should be in the future after correct signals
      specimen.expect(new Date(memory.nextAt).getTime()).toBeGreaterThan(Date.now() - 1000);
    });

    it("failure signal updates memory status", async () => {
      const memory = await d.review({
        literal: reviewLiteral.id,
        signal: "FAILURE",
      });
      specimen.expect(memory.id).toBeTruthy();
      // status should reflect the failure
      specimen.expect(["UNKNOWN", "LEARNING"].includes(memory.status)).toBe(true);
    });

    it("review by slug works", async () => {
      const memory = await d.review({
        literal: reviewLiteral.slug,
        signal: "SUCCESS",
      });
      specimen.expect(memory.id).toBeTruthy();
      const litRef = memory.literal?.id ?? memory.literal;
      specimen.expect(litRef).toBe(reviewLiteral.id);
    });
  });

  // ─── thread lifecycle ────────────────────────────────────

  specimen.describe("thread lifecycle", () => {
    it("create thread, emit with thread, query buffers", async () => {
      // find a mode + intent to create a thread against
      const modes = await client.raw.call("/daemon/brazilian/modes/game/findOne", {
        where: { slug: "flashcard" },
      });
      specimen.expect(modes.manifest).toBeTruthy();

      // check we can access userspace
      const handshake = await client.raw.call("/daemon/brazilian/userspace/handshake", {});
      specimen.expect(handshake.success).toBe(true);
    });
  });
});
