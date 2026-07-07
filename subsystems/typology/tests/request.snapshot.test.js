// snapshot demo · request — a transport Request (url + method + headers + body + options).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Request } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: request", () => {
  // request — Url + a Map of headers → parse=.json flattens both into the full wire shape
  it("captures request", () => {
    const request = new Request({
      url: "http://api.io/users",
      method: "POST",
      headers: { accept: "application/json" },
      body: { name: "test" },
    });

    const { pojo, path } = snapshot(request, {
      base,
      dry: DRY,
      locate: "request.snapshot.json",
      parse: (r) => r.json,
    });
    console.log(`\n===BEGIN request → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.url).toBe("http://api.io/users");
    expect(pojo.method).toBe("POST");
    expect(pojo.headers).toEqual({ accept: "application/json" });
    expect(pojo.body).toEqual({ name: "test" });
    expect(pojo.options.timeout).toBe(30000);
  });
});
