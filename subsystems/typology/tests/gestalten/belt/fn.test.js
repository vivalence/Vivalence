import { specimen, fn } from "@vivalence/typology";

const { inflight } = fn;

// inflight = the async once: one in-flight run shared across concurrent callers,
// success memoized. belt-lib → both reject policies (retry default true, false caches).
specimen.describe("fn.inflight", () => {
  specimen.it("concurrent callers share one in-flight run", async () => {
    let calls = 0;
    const run = inflight(async () => { calls++; await Promise.resolve(); return "v"; });
    const [a, b] = await Promise.all([run(), run()]);
    specimen.expect(calls).toBe(1);
    specimen.expect(a).toBe("v");
    specimen.expect(b).toBe("v");
  });

  specimen.it("memoizes success — later calls don't re-run", async () => {
    let calls = 0;
    const run = inflight(async () => { calls++; return calls; });
    await run();
    const second = await run();
    specimen.expect(calls).toBe(1);
    specimen.expect(second).toBe(1);
  });

  specimen.it("retry=true (default) — re-runs after a rejection", async () => {
    let calls = 0;
    const run = inflight(async () => { calls++; if (calls === 1) throw new Error("boom"); return "ok"; });
    let first;
    await run().catch((e) => { first = e.message; });
    const second = await run();
    specimen.expect(first).toBe("boom");
    specimen.expect(second).toBe("ok");
    specimen.expect(calls).toBe(2);
  });

  specimen.it("retry=false — caches the rejection (never re-runs)", async () => {
    let calls = 0;
    const run = inflight(async () => { calls++; throw new Error("permanent"); }, { retry: false });
    let a, b;
    await run().catch((e) => { a = e.message; });
    await run().catch((e) => { b = e.message; });
    specimen.expect(a).toBe("permanent");
    specimen.expect(b).toBe("permanent");
    specimen.expect(calls).toBe(1);
  });
});
