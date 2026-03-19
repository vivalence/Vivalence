import { specimen, Response } from "@vivalence/typology";

specimen.describe("Response", () => {
  specimen.describe("construction", () => {
    specimen.it("computes ok from status", () => {
      specimen.expect(new Response({ status: 200 }).ok).toBe(true);
      specimen.expect(new Response({ status: 201 }).ok).toBe(true);
      specimen.expect(new Response({ status: 299 }).ok).toBe(true);
      specimen.expect(new Response({ status: 400 }).ok).toBe(false);
      specimen.expect(new Response({ status: 500 }).ok).toBe(false);
    });
  });

  specimen.describe("stream()", () => {
    specimen.it("from async generator → readable chunks", async () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "hello"; yield " world"; }
      r.stream(gen());

      const reader = r.body.getReader();
      const a = await reader.read();
      const b = await reader.read();
      const c = await reader.read();

      specimen.expect(a.value).toBeInstanceOf(Uint8Array);
      specimen.expect(new TextDecoder().decode(a.value)).toBe("hello");
      specimen.expect(new TextDecoder().decode(b.value)).toBe(" world");
      specimen.expect(c.done).toBe(true);
    });

    specimen.it("string yields encode to Uint8Array", async () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "abc"; }
      r.stream(gen());

      const reader = r.body.getReader();
      const { value } = await reader.read();
      specimen.expect(value).toBeInstanceOf(Uint8Array);
      specimen.expect(new TextDecoder().decode(value)).toBe("abc");
    });

    specimen.it("Uint8Array yields pass through unchanged", async () => {
      const r = new Response({ status: 200 });
      const raw = new Uint8Array([1, 2, 3]);
      async function* gen() { yield raw; }
      r.stream(gen());

      const reader = r.body.getReader();
      const { value } = await reader.read();
      specimen.expect(value).toBe(raw);
    });

    specimen.it("returns this for chaining", () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "x"; }
      const result = r.stream(gen());
      specimen.expect(result).toBe(r);
    });
  });

  specimen.describe("publish()", () => {
    specimen.it("sets type to text/event-stream", () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "x"; }
      r.publish(gen());
      specimen.expect(r.type).toBe("text/event-stream");
    });

    specimen.it("sets cache-control header", () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "x"; }
      r.publish(gen());
      specimen.expect(r.headers.get("cache-control")).toBe("no-cache");
    });

    specimen.it("wraps objects as SSE data frames", async () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield { key: "val" }; }
      r.publish(gen());

      const reader = r.body.getReader();
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      specimen.expect(text).toBe('data: {"key":"val"}\n\n');
    });

    specimen.it("wraps strings as SSE data frames", async () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "raw text"; }
      r.publish(gen());

      const reader = r.body.getReader();
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      specimen.expect(text).toBe("data: raw text\n\n");
    });

    specimen.it("multiple events concatenate well-formed", async () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield { a: 1 }; yield "hello"; yield { b: 2 }; }
      r.publish(gen());

      const reader = r.body.getReader();
      const chunks = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(new TextDecoder().decode(value));
      }

      specimen.expect(chunks).toEqual([
        'data: {"a":1}\n\n',
        'data: hello\n\n',
        'data: {"b":2}\n\n',
      ]);
    });

    specimen.it("returns this for chaining", () => {
      const r = new Response({ status: 200 });
      async function* gen() { yield "x"; }
      const result = r.publish(gen());
      specimen.expect(result).toBe(r);
    });
  });
});
