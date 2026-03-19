import { specimen, Request, Url } from "@vivalence/typology";

specimen.describe("Request", () => {
  specimen.describe("construction", () => {
    specimen.it("from object", () => {
      const req = new Request({
        url: "http://api.io/users",
        method: "POST",
        body: { name: "test" },
      });

      specimen.expect(req.url).toBeInstanceOf(Url);
      specimen.expect(req.method).toBe("POST");
      specimen.expect(req.body).toEqual({ name: "test" });
    });

    specimen.it("defaults method to POST", () => {
      const req = new Request({ url: "http://test.io/endpoint" });
      specimen.expect(req.method).toBe("POST");
    });

    specimen.it("accepts Url instance", () => {
      const url = new Url("http://test.io/path");
      const req = new Request({ url });
      specimen.expect(req.url.absolute).toBe("http://test.io/path");
    });
  });

  specimen.describe("stream()", () => {
    specimen.it("returns raw body from native request", () => {
      const body = new ReadableStream();
      const raw = new globalThis.Request("http://x", { method: "POST", body, duplex: "half" });
      const req = new Request({ url: "http://x", raw });
      specimen.expect(req.stream()).toBeInstanceOf(ReadableStream);
    });

    specimen.it("returns null without raw request", () => {
      const req = new Request({ url: "http://x" });
      specimen.expect(req.stream()).toBe(null);
    });
  });

  specimen.describe("subscribe()", () => {
    function sseBody(...items) {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          for (const item of items) {
            const payload = typeof item === "string" ? item : JSON.stringify(item);
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
          controller.close();
        },
      });
    }

    function requestWithSSEBody(...items) {
      const body = sseBody(...items);
      const raw = new globalThis.Request("http://x", {
        method: "POST",
        body,
        duplex: "half",
        headers: { "content-type": "text/event-stream" },
      });
      return new Request({ url: "http://x", raw });
    }

    specimen.it("parses SSE frames into objects", async () => {
      const req = requestWithSSEBody({ seq: 1 }, { seq: 2 });
      const events = [];
      for await (const event of req.subscribe()) {
        events.push(event);
      }
      specimen.expect(events).toEqual([{ seq: 1 }, { seq: 2 }]);
    });

    specimen.it("yields strings for non-JSON payloads", async () => {
      const req = requestWithSSEBody("hello", "world");
      const events = [];
      for await (const event of req.subscribe()) {
        events.push(event);
      }
      specimen.expect(events).toEqual(["hello", "world"]);
    });

    specimen.it("handles mixed JSON and string payloads", async () => {
      const req = requestWithSSEBody({ a: 1 }, "fin");
      const events = [];
      for await (const event of req.subscribe()) {
        events.push(event);
      }
      specimen.expect(events).toEqual([{ a: 1 }, "fin"]);
    });

    specimen.it("yields nothing without raw body", async () => {
      const req = new Request({ url: "http://x" });
      const events = [];
      for await (const event of req.subscribe()) {
        events.push(event);
      }
      specimen.expect(events).toEqual([]);
    });
  });

  specimen.describe("signal", () => {
    specimen.it("creates AbortSignal lazily", () => {
      const req = new Request({ url: "http://x" });
      specimen.expect(req.signal).toBeInstanceOf(AbortSignal);
    });

    specimen.it("abort cancels signal", () => {
      const req = new Request({ url: "http://x" });
      const signal = req.signal;
      specimen.expect(signal.aborted).toBe(false);
      req.abort();
      specimen.expect(signal.aborted).toBe(true);
    });
  });
});
