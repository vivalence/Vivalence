import { specimen, fn, sleep } from "@vivalence/typology";

specimen.describe("debounce — the timer is ownable", () => {
  specimen.it("cancels a pending call, so a scheduled effect cannot outlive its owner", async () => {
    const fired = [];
    const settle = fn.debounce(() => fired.push("fired"), 5);
    settle();
    settle.cancel();
    await sleep.ms(20);
    specimen.expect(fired).toEqual([]);
  });

  specimen.it("still fires when nobody cancels, and coalesces a burst into one call", async () => {
    const fired = [];
    const settle = fn.debounce(() => fired.push("fired"), 5);
    settle();
    settle();
    settle();
    await sleep.ms(20);
    specimen.expect(fired).toEqual(["fired"]);
  });
});

specimen.describe("memo — same args, one computation", () => {
  specimen.it("caches per argument set and recomputes for fresh ones", () => {
    let calls = 0;
    const area = fn.memo((w, h) => {
      calls++;
      return w * h;
    });
    specimen.expect(area(2, 3)).toBe(6);
    specimen.expect(area(2, 3)).toBe(6);
    specimen.expect(calls).toBe(1);
    specimen.expect(area(4, 5)).toBe(20);
    specimen.expect(calls).toBe(2);
  });

  specimen.it("a custom key collapses arguments the caller declares equivalent", () => {
    let calls = 0;
    const lookup = fn.memo(
      (path) => {
        calls++;
        return path;
      },
      ([path]) => path.toLowerCase(),
    );
    specimen.expect(lookup("Sentences/A.mp3")).toBe("Sentences/A.mp3");
    specimen.expect(lookup("sentences/a.mp3")).toBe("Sentences/A.mp3");
    specimen.expect(calls).toBe(1);
  });

  specimen.it("a cached falsy value is still a hit", () => {
    let calls = 0;
    const sniff = fn.memo(() => {
      calls++;
      return null;
    });
    specimen.expect(sniff()).toBe(null);
    specimen.expect(sniff()).toBe(null);
    specimen.expect(calls).toBe(1);
  });
});

specimen.describe("once — the first call is the only call", () => {
  specimen.it("runs once, swallows repeats", () => {
    let calls = 0;
    const prime = fn.once(() => ++calls);
    specimen.expect(prime()).toBe(1);
    specimen.expect(prime()).toBe(undefined);
    specimen.expect(calls).toBe(1);
  });
});

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
