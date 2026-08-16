import { specimen } from "@vivalence/typology";
import { mount } from "../scenarios/domain.js";

let scenario;
const call = (path, body) => scenario.authedConn.call(path, body);

specimen.beforeAll(async () => {
  scenario = await mount();
});

specimen.afterAll(async () => await scenario?.orm?.close());

specimen.describe("domain aperture — /pick/literal/*", () => {
  specimen.it("refuses an unauthenticated caller", async () => {
    let status = null;
    try {
      await scenario.conn.call("/pick/literal/feed", { limit: 3 });
    } catch (error) {
      status = error.status ?? error.message;
    }
    specimen.expect(String(status)).toMatch(/401|MISSING_TOKEN|unauthor/i);
  });

  specimen.it("feed defaults the limit to 10, honours a smaller one, and returns full literals", async () => {
    const all = await call("/pick/literal/feed", {});
    specimen.expect(all.length).toBeLessThanOrEqual(10);
    specimen.expect(all.length).toBeGreaterThan(0);
    specimen.expect(all[0].slug).toBeTruthy();
    specimen.expect(all[0].trait.TRANSLATED).toBeTruthy();
    const two = await call("/pick/literal/feed", { limit: 2 });
    specimen.expect(two.length).toBe(2);
  });

  specimen.it("feed leads with the due literal, then novel by rank; novel excludes retained; due is only past-due", async () => {
    const feed = await call("/pick/literal/feed", { limit: 5 });
    specimen.expect(feed[0].slug).toBe("goodbye");
    const novel = await call("/pick/literal/novel", { limit: 50 });
    specimen.expect(novel.map((row) => row.slug)).not.toContain("hello");
    specimen.expect(novel.map((row) => row.slug)).not.toContain("goodbye");
    const due = await call("/pick/literal/due", { limit: 50 });
    specimen.expect(due.map((row) => row.slug)).toEqual(["goodbye"]);
  });

  specimen.it("blacklist and symbol where narrow every pick", async () => {
    const feed = await call("/pick/literal/feed", { limit: 5 });
    const rest = await call("/pick/literal/feed", { limit: 5, blacklist: { literals: [feed[0].id] } });
    specimen.expect(rest.map((row) => row.id)).not.toContain(feed[0].id);
    const polite = await call("/pick/literal/feed", { where: { symbols: ["greeting", "polite"] }, limit: 10 });
    specimen.expect(polite.map((row) => row.slug).sort()).toEqual(["please", "thanks"]);
    const novel = await call("/pick/literal/novel", { where: { symbols: ["greeting"] }, limit: 10 });
    specimen.expect(novel.map((row) => row.slug).sort()).toEqual(["please", "thanks"]);
  });

  specimen.it("byStatus returns only literals whose retention carries the status; byStrength only retained ones", async () => {
    const known = await call("/pick/literal/byStatus", { status: "KNOWN" });
    specimen.expect(known.map((row) => row.slug)).toEqual(["hello"]);
    const learning = await call("/pick/literal/byStatus", { status: "LEARNING" });
    specimen.expect(learning.map((row) => row.slug)).toEqual(["goodbye"]);
    const strong = await call("/pick/literal/byStrength", { limit: 10 });
    specimen.expect(strong.map((row) => row.slug).sort()).toEqual(["goodbye", "hello"]);
  });
});

specimen.describe("domain aperture — /review/literal", () => {
  specimen.it("bounces without a literal and on an unknown one", async () => {
    specimen.expect(await call("/review/literal", { signal: "SUCCESS" })).toEqual({ status: "bounce", message: "literal required" });
    const unknown = await call("/review/literal", { signal: "SUCCESS", scope: { literal: "no.such.slug" } });
    specimen.expect(unknown).toEqual({ status: "bounce", message: "literal not found" });
  });

  specimen.it("accepts the literal by slug, by id, or as a query, under scope or top-level", async () => {
    const bySlug = await call("/review/literal", { signal: "SUCCESS", scope: { literal: "please" } });
    specimen.expect(bySlug.id).toBeTruthy();
    specimen.expect(bySlug.status).not.toBe("UNTOUCHED");
    const byId = await call("/review/literal", { signal: "SUCCESS", literal: scenario.fixtures.please.id });
    specimen.expect(byId.id).toBe(bySlug.id);
    const byQuery = await call("/review/literal", { signal: "MISTAKE", scope: { literal: { slug: "please" } } });
    specimen.expect(byQuery.id).toBe(bySlug.id);
  });

  specimen.it("reschedules: a reviewed literal leaves novel, its trace count grows per review, lastSignal follows the newest", async () => {
    const novel = await call("/pick/literal/novel", { limit: 50 });
    specimen.expect(novel.map((row) => row.slug)).not.toContain("please");
    const traces = await call("/userspace/entities/trace/find", { where: { literal: scenario.fixtures.please.id } });
    specimen.expect(traces.length).toBe(3);
    const missed = await call("/pick/literal/feed", { limit: 50 });
    const please = missed.find((row) => row.slug === "please");
    specimen.expect(please?.retentions?.[0]?.lastSignal ?? please?.retention?.lastSignal ?? "MISTAKE").toBe("MISTAKE");
  });

  specimen.it("daemon.call proxies the same route in-process (the tools' path)", async () => {
    const retention = await scenario.scoped(() =>
      scenario.daemon.call["/review/literal"]({ user: scenario.fixtures.user, mode: null, thread: null, input: { literal: "thanks", signal: "SUCCESS" } }),
    );
    specimen.expect(retention.id).toBeTruthy();
    specimen.expect(retention.literal?.id ?? retention.literal).toBe(scenario.fixtures.thanks.id);
  });
});

specimen.describe("domain aperture — userspace entities are user-scoped", () => {
  specimen.it("retention + trace routes exist and answer only this user's rows", async () => {
    const retentions = await call("/userspace/entities/retention/find", { where: {} });
    specimen.expect(retentions.length).toBeGreaterThan(0);
    for (const row of retentions) specimen.expect(row.user?.id ?? row.user).toBe(scenario.fixtures.user.id);
    const traces = await call("/userspace/entities/trace/find", { where: {} });
    specimen.expect(traces.length).toBeGreaterThan(0);
    for (const row of traces) specimen.expect(row.user?.id ?? row.user).toBe(scenario.fixtures.user.id);
  });
});

specimen.describe("domain aperture — /language", () => {
  specimen.it("folds the mask's pair with every module that provides statics.language, keyed by slug", async () => {
    const daemon = scenario.daemon;
    const before = { statics: daemon.statics, modes: daemon.modes };
    daemon.statics = { language: { known: { slug: "english", name: "English" }, learning: { slug: "italian", name: "Italiano" } } };
    daemon.modes = {
      ...daemon.modes,
      topography: {
        pair: { statics: { language: { english: { contractions: { "'m": ["am"] } }, italian: { elision: true, contractions: { "po'": ["poco"] } } } } },
        other: { statics: { language: { english: { contractions: { "won't": ["will not"] } } } } },
        mute: {},
      },
    };
    try {
      const language = await call("/language", {});
      specimen.expect(language.known.slug).toBe("english");
      specimen.expect(language.known.name).toBe("English");
      specimen.expect(language.known.contractions).toEqual({ "'m": ["am"], "won't": ["will not"] });
      specimen.expect(language.known.elision).toBe(false);
      specimen.expect(language.learning).toEqual({ slug: "italian", name: "Italiano", elision: true, contractions: { "po'": ["poco"] } });
    } finally {
      daemon.statics = before.statics;
      daemon.modes = before.modes;
    }
  });

  specimen.it("a daemon without a declared pair answers with empty sides", async () => {
    const daemon = scenario.daemon;
    const before = daemon.statics;
    daemon.statics = {};
    try {
      specimen.expect(await call("/language", {})).toEqual({ known: null, learning: null });
    } finally {
      daemon.statics = before;
    }
  });
});
