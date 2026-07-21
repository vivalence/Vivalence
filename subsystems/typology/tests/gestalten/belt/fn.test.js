import { specimen, fn } from "@vivalence/typology";

specimen.describe("fn", () => {
  specimen.it("an inflight run is shared and its success memoized", async () => {
    let sharedCalls = 0;
    const shared = fn.inflight(async () => { sharedCalls++; await Promise.resolve(); return "v"; });
    const [first, second] = await Promise.all([shared(), shared()]);
    specimen.expect(sharedCalls).toBe(1);
    specimen.expect(first).toBe("v");
    specimen.expect(second).toBe("v");

    let memoizedCalls = 0;
    const memoized = fn.inflight(async () => { memoizedCalls++; return memoizedCalls; });
    await memoized();
    const later = await memoized();
    specimen.expect(memoizedCalls).toBe(1);
    specimen.expect(later).toBe(1);
  });

  specimen.it("a rejection retries by default and caches when told", async () => {
    let retryingCalls = 0;
    const retrying = fn.inflight(async () => {
      retryingCalls++;
      if (retryingCalls === 1) throw new Error("boom");
      return "ok";
    });
    let firstMessage;
    await retrying().catch((error) => { firstMessage = error.message; });
    const recovered = await retrying();
    specimen.expect(firstMessage).toBe("boom");
    specimen.expect(recovered).toBe("ok");
    specimen.expect(retryingCalls).toBe(2);

    let cachedCalls = 0;
    const cached = fn.inflight(async () => { cachedCalls++; throw new Error("permanent"); }, { retry: false });
    let firstFailure, secondFailure;
    await cached().catch((error) => { firstFailure = error.message; });
    await cached().catch((error) => { secondFailure = error.message; });
    specimen.expect(firstFailure).toBe("permanent");
    specimen.expect(secondFailure).toBe("permanent");
    specimen.expect(cachedCalls).toBe(1);
  });
});
