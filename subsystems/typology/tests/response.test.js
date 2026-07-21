import { specimen, Response } from "@vivalence/typology";

specimen.describe("Response", () => {
  specimen.it("a status knows whether it is ok", () => {
    specimen.expect(new Response({ status: 200 }).ok).toBe(true);
    specimen.expect(new Response({ status: 201 }).ok).toBe(true);
    specimen.expect(new Response({ status: 299 }).ok).toBe(true);
    specimen.expect(new Response({ status: 400 }).ok).toBe(false);
    specimen.expect(new Response({ status: 500 }).ok).toBe(false);

    specimen.expect(new Response({ status: 200, body: { greeting: "hi" } }).json).toEqual({
      status: 200,
      ok: true,
      headers: {},
      body: { greeting: "hi" },
      error: null,
    });
  });

  specimen.it("a generator streams into readable chunks", async () => {
    const response = new Response({ status: 200 });
    async function* words() {
      yield "hello";
      yield " world";
    }
    specimen.expect(response.stream(words())).toBe(response);

    const reader = response.body.getReader();
    const first = await reader.read();
    const second = await reader.read();
    const third = await reader.read();
    specimen.expect(first.value).toBeInstanceOf(Uint8Array);
    specimen.expect(new TextDecoder().decode(first.value)).toBe("hello");
    specimen.expect(new TextDecoder().decode(second.value)).toBe(" world");
    specimen.expect(third.done).toBe(true);

    const encoded = new Response({ status: 200 });
    async function* letters() {
      yield "abc";
    }
    encoded.stream(letters());
    const { value: encodedValue } = await encoded.body.getReader().read();
    specimen.expect(encodedValue).toBeInstanceOf(Uint8Array);
    specimen.expect(new TextDecoder().decode(encodedValue)).toBe("abc");

    const passthrough = new Response({ status: 200 });
    const rawBytes = new Uint8Array([1, 2, 3]);
    async function* bytes() {
      yield rawBytes;
    }
    passthrough.stream(bytes());
    const { value: passedValue } = await passthrough.body.getReader().read();
    specimen.expect(passedValue).toBe(rawBytes);
  });

  specimen.it("a publication frames events for the wire", async () => {
    const response = new Response({ status: 200 });
    async function* mixed() {
      yield { a: 1 };
      yield "hello";
      yield { b: 2 };
    }
    specimen.expect(response.publish(mixed())).toBe(response);
    specimen.expect(response.type).toBe("text/event-stream");
    specimen.expect(response.headers.get("cache-control")).toBe("no-cache");

    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(new TextDecoder().decode(value));
    }
    specimen.expect(chunks).toEqual([
      'data: {"a":1}\n\n',
      "data: hello\n\n",
      'data: {"b":2}\n\n',
    ]);
  });
});
