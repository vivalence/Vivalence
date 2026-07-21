import { specimen, Request, Url } from "@vivalence/typology";

specimen.describe("Request", () => {
  specimen.it("a request assembles from an object", () => {
    const request = new Request({
      url: "http://api.io/users",
      method: "POST",
      body: { name: "test" },
    });
    specimen.expect(request.url).toBeInstanceOf(Url);
    specimen.expect(request.method).toBe("POST");
    specimen.expect(request.body).toEqual({ name: "test" });
    specimen.expect(request.json).toEqual({
      url: "http://api.io/users",
      method: "POST",
      headers: {},
      body: { name: "test" },
      options: { timeout: 30000, retries: 0, credentials: "include" },
    });

    specimen.expect(new Request({ url: "http://test.io/endpoint" }).method).toBe("POST");
    specimen.expect(new Request({ url: new Url("http://test.io/path") }).url.absolute).toBe("http://test.io/path");
  });

  specimen.it("a body streams from the raw request", () => {
    const body = new ReadableStream();
    const raw = new globalThis.Request("http://x", { method: "POST", body, duplex: "half" });
    specimen.expect(new Request({ url: "http://x", raw }).stream()).toBeInstanceOf(ReadableStream);
    specimen.expect(new Request({ url: "http://x" }).stream()).toBe(null);
  });

  specimen.it("a subscription parses frames off the wire", async () => {
    const subscribed = async (...items) => {
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          for (const item of items) {
            const payload = typeof item === "string" ? item : JSON.stringify(item);
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
          controller.close();
        },
      });
      const raw = new globalThis.Request("http://x", {
        method: "POST",
        body,
        duplex: "half",
        headers: { "content-type": "text/event-stream" },
      });
      const request = new Request({ url: "http://x", raw });
      const events = [];
      for await (const event of request.subscribe()) events.push(event);
      return events;
    };

    specimen.expect(await subscribed({ seq: 1 }, { seq: 2 })).toEqual([{ seq: 1 }, { seq: 2 }]);
    specimen.expect(await subscribed("hello", "world")).toEqual(["hello", "world"]);
    specimen.expect(await subscribed({ a: 1 }, "fin")).toEqual([{ a: 1 }, "fin"]);

    const bodiless = new Request({ url: "http://x" });
    const silence = [];
    for await (const event of bodiless.subscribe()) silence.push(event);
    specimen.expect(silence).toEqual([]);
  });

  specimen.it("a signal aborts on demand", () => {
    const request = new Request({ url: "http://x" });
    const signal = request.signal;
    specimen.expect(signal).toBeInstanceOf(AbortSignal);
    specimen.expect(signal.aborted).toBe(false);
    request.abort();
    specimen.expect(signal.aborted).toBe(true);
  });
});
