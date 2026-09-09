import { specimen } from "@vivalence/typology";
import { address, query } from "../tools/wikipedia.js";

// the client takes its fetch, so the whole subject tests without a network.
const stub = (payload, { ok = true, status = 200 } = {}) => {
  const seen = [];
  const get = (at, init) => {
    seen.push({ at, init });
    return Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(payload),
    });
  };
  return { get, seen };
};

// the API's own shape, formatversion 2: hits marked with a span, the rest html-escaped.
const SEARCH = [
  {
    ns: 0,
    title: "Flamingo",
    pageid: 46292,
    snippet:
      '<span class="searchmatch">Flamingos</span> or <span class="searchmatch">flamingoes</span> are a type of wading bird in the family Phoenicopteridae',
  },
  {
    ns: 0,
    title: "Flamingo Las Vegas",
    pageid: 1234,
    snippet:
      '<span class="searchmatch">Flamingo</span> Las Vegas (formerly the &quot;Flamingo Hotel&quot;) is a casino',
  },
  {
    ns: 0,
    title: "Phoenicopteridae (family)",
    pageid: 5678,
    snippet: "Phoenicopteridae &amp; grebes share Mirandornithes",
  },
];

specimen.describe("wikipedia — the mapping", () => {
  specimen.it(
    "P-shape: three keys, renamed, nothing else rides along",
    async () => {
      const { get } = stub({ query: { search: SEARCH } });
      const [first] = await query("flamingo", 5, { fetch: get });
      specimen.expect(Object.keys(first)).toEqual(["title", "url", "snippet"]);
      specimen.expect(first.title).toBe("Flamingo");
    },
  );

  specimen.it(
    "P-plain: the snippet loses its match spans and its html entities",
    async () => {
      const { get } = stub({ query: { search: SEARCH } });
      const [first, second, third] = await query("flamingo", 5, { fetch: get });
      specimen.expect(first.snippet).toBe(
        "Flamingos or flamingoes are a type of wading bird in the family Phoenicopteridae",
      );
      specimen.expect(second.snippet).toBe(
        'Flamingo Las Vegas (formerly the "Flamingo Hotel") is a casino',
      );
      specimen.expect(third.snippet).toBe("Phoenicopteridae & grebes share Mirandornithes");
    },
  );

  specimen.it(
    "P-address: an article's url is its title, one segment, spaces as underscores",
    async () => {
      const { get } = stub({ query: { search: SEARCH } });
      const [, vegas, family] = await query("flamingo", 5, { fetch: get });
      specimen.expect(vegas.url).toBe("https://en.wikipedia.org/wiki/Flamingo_Las_Vegas");
      specimen.expect(family.url).toBe(
        "https://en.wikipedia.org/wiki/Phoenicopteridae_(family)",
      );
      specimen.expect(address("Deno (software)")).toBe(
        "https://en.wikipedia.org/wiki/Deno_(software)",
      );
      specimen.expect(address("Ampersand & co")).toBe(
        "https://en.wikipedia.org/wiki/Ampersand_%26_co",
      );
    },
  );

  specimen.it(
    "P-count: the limit is the server's — srlimit carries the caller's count, nothing is sliced",
    async () => {
      const { get, seen } = stub({ query: { search: SEARCH } });
      const results = await query("flamingo", 20, { fetch: get });
      specimen.expect(results.length).toBe(3);
      specimen.expect(new URL(seen[0].at).searchParams.get("srlimit")).toBe("20");
    },
  );

  specimen.it(
    "P-encode: terms travel as a query parameter, escaped, and the client names itself",
    async () => {
      const { get, seen } = stub({ query: { search: [] } });
      await query("deno permission flags & more", 5, { fetch: get });
      const at = new URL(seen[0].at);
      specimen.expect(at.origin + at.pathname).toBe("https://en.wikipedia.org/w/api.php");
      specimen.expect(at.searchParams.get("srsearch")).toBe("deno permission flags & more");
      specimen.expect(at.searchParams.get("list")).toBe("search");
      specimen.expect(at.searchParams.get("formatversion")).toBe("2");
      specimen.expect(seen[0].init.headers["User-Agent"]).toContain("vivalence-hello-world");
    },
  );

  specimen.it(
    "P-timeout: a hanging API throws inside the window, it does not wait",
    async () => {
      const hang = () =>
        new Promise((_, reject) => {
          const error = new Error("timed out");
          error.name = "TimeoutError";
          queueMicrotask(() => reject(error));
        });
      let thrown = null;
      try {
        await query("x", 5, { fetch: hang });
      } catch (error) {
        thrown = error;
      }
      specimen.expect(thrown?.message).toContain("wikipedia did not answer within");
    },
  );

  specimen.it(
    "P-timeout: the fetch carries an abort signal, never a bare call",
    async () => {
      let seen = null;
      const spy = (_at, init) => {
        seen = init;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ query: { search: [] } }),
        });
      };
      await query("x", 5, { fetch: spy });
      specimen.expect(seen?.signal instanceof AbortSignal).toBe(true);
    },
  );

  specimen.it(
    "P-throws: a non-ok response throws and names the status",
    async () => {
      const { get } = stub({}, { ok: false, status: 429 });
      let thrown = null;
      try {
        await query("x", 5, { fetch: get });
      } catch (error) {
        thrown = error;
      }
      specimen.expect(thrown?.message).toContain("wikipedia 429");
    },
  );
});
