import { specimen } from "@vivalence/typology";
import { drink, hop, LIMITS } from "../hop.js";

// every name resolves public unless the map says otherwise — the guard is exercised for real,
// only DNS is faked.
const resolve = (host) =>
  Promise.resolve(host === "inside.test" ? ["10.0.0.7"] : ["93.184.216.34"]);

const HTML = { "content-type": "text/html; charset=utf-8" };

const stub = (pages) => {
  const seen = [];
  const get = (target) => {
    const at = String(target);
    seen.push(at);
    const page = pages[at] ?? { status: 404, body: "gone" };
    return Promise.resolve(
      new Response(page.body ?? "", {
        status: page.status ?? 200,
        headers: page.headers ?? HTML,
      }),
    );
  };
  return { get, seen };
};

const thrown = async (walk) => {
  try {
    await walk();
    return null;
  } catch (error) {
    return error.message;
  }
};

const stream = (chunks) =>
  new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    { headers: HTML },
  );

specimen.describe("hop — the walk, and what it refuses mid-walk", () => {
  specimen.it(
    "P-hop: a redirect to a private address is refused BEFORE it is fetched",
    async () => {
      const { get, seen } = stub({
        "https://public.test/": {
          status: 302,
          headers: { location: "http://inside.test/admin" },
        },
        "http://inside.test/admin": { body: "<html>secrets</html>" },
      });

      specimen.expect(
        await thrown(() =>
          hop("https://public.test/", { fetch: get, resolve })
        ),
      )
        .toContain("resolves to a private address");
      // the whole assertion: the second address was never asked for. a guard that ran on
      // response.url would show two calls here and a leaked request.
      specimen.expect(seen).toEqual(["https://public.test/"]);
    },
  );

  specimen.it(
    "P-hop: a redirect chain is walked, and the final page comes back",
    async () => {
      const { get, seen } = stub({
        "https://a.test/": {
          status: 301,
          headers: { location: "https://b.test/" },
        },
        "https://b.test/": { status: 302, headers: { location: "/deep" } },
        "https://b.test/deep": { body: "<html>here</html>" },
      });

      const { response, target } = await hop("https://a.test/", {
        fetch: get,
        resolve,
      });
      specimen.expect(target.href).toBe("https://b.test/deep");
      specimen.expect(await response.text()).toBe("<html>here</html>");
      // a relative location resolved against the CURRENT target, not the original.
      specimen.expect(seen).toEqual([
        "https://a.test/",
        "https://b.test/",
        "https://b.test/deep",
      ]);
    },
  );

  specimen.it(
    "more than five redirects is refused, and the sixth is never followed",
    async () => {
      const pages = {};
      for (let step = 0; step < 12; step++) {
        pages[`https://loop.test/${step}`] = {
          status: 302,
          headers: { location: `https://loop.test/${step + 1}` },
        };
      }
      const { get, seen } = stub(pages);

      specimen.expect(
        await thrown(() => hop("https://loop.test/0", { fetch: get, resolve })),
      )
        .toContain(`more than ${LIMITS.hops} redirects`);
      specimen.expect(seen.length).toBe(LIMITS.hops + 1);
    },
  );

  specimen.it(
    "a non-ok final response throws and names the status",
    async () => {
      const { get } = stub({
        "https://gone.test/": { status: 503, body: "down" },
      });
      specimen.expect(
        await thrown(() => hop("https://gone.test/", { fetch: get, resolve })),
      )
        .toContain("503");
    },
  );

  specimen.it(
    "anything that is not a text page is refused, whatever its status",
    async () => {
      const { get } = stub({
        "https://file.test/x.pdf": {
          body: "%PDF",
          headers: { "content-type": "application/pdf" },
        },
      });
      specimen.expect(
        await thrown(() =>
          hop("https://file.test/x.pdf", { fetch: get, resolve })
        ),
      )
        .toContain("is not a page");
    },
  );

  specimen.it(
    "the guard runs before the FIRST fetch too — a private start is never called",
    async () => {
      const { get, seen } = stub({});
      specimen.expect(
        await thrown(() =>
          hop("http://127.0.0.1:2501/", { fetch: get, resolve })
        ),
      )
        .toContain("not a public address");
      specimen.expect(seen).toEqual([]);
    },
  );
});

specimen.describe(
  "drink — the only copy of the page there will ever be",
  () => {
    specimen.it(
      "P-bytes: the cap is a BOUND — one oversized chunk is cut, not noticed after",
      async () => {
        const over = new Uint8Array(LIMITS.bytes + 50_000).fill(0x61);
        const { body, bytes, capped } = await drink(stream([over]));
        specimen.expect(bytes).toBe(LIMITS.bytes);
        specimen.expect(body.length).toBe(LIMITS.bytes);
        specimen.expect(capped).toBe(true);
      },
    );

    specimen.it(
      "a page under the cap comes back whole and uncapped",
      async () => {
        const { body, bytes, capped } = await drink(
          stream([new TextEncoder().encode("<p>short</p>")]),
        );
        specimen.expect(body).toBe("<p>short</p>");
        specimen.expect(bytes).toBe(12);
        specimen.expect(capped).toBe(false);
      },
    );

    specimen.it(
      "a multi-byte character split across chunks decodes whole, not as U+FFFD",
      async () => {
        const bytes = new TextEncoder().encode("caffè — naïve");
        const { body } = await drink(
          stream([bytes.subarray(0, 5), bytes.subarray(5)]),
        );
        specimen.expect(body).toBe("caffè — naïve");
        specimen.expect(body.includes("�")).toBe(false);
      },
    );

    specimen.it(
      "a response with no body at all is empty, not a throw",
      async () => {
        const { body, bytes, capped } = await drink(
          new Response(null, { status: 204 }),
        );
        specimen.expect(body).toBe("");
        specimen.expect(bytes).toBe(0);
        specimen.expect(capped).toBe(false);
      },
    );
  },
);
