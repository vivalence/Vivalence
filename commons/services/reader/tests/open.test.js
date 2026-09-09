import { specimen } from "@vivalence/typology";
import { manifest, provider } from "../service.viva.js";

const resolve = () => Promise.resolve(["93.184.216.34"]);
const HTML = { "content-type": "text/html; charset=utf-8" };

const page = Deno.readTextFileSync(
  new URL("./fixtures/deno-docs.html", import.meta.url),
);

const serve = (body, headers = HTML, status = 200) => ({
  fetch: () => Promise.resolve(new Response(body, { status, headers })),
  resolve,
});

specimen.describe("reader service — the assembly", () => {
  specimen.it(
    "the manifest is a service named reader, with no traits to bolt onto",
    () => {
      specimen.expect(manifest.type).toBe("service");
      specimen.expect(manifest.slug).toBe("reader");
      specimen.expect(manifest.traits).toEqual([]);
    },
  );

  specimen.it(
    "provider is a NAMED export returning the faculty, not a default called at load",
    () => {
      // cast/primitives.js:5 CALLS a function default export with no args at load. a default
      // here would run the provider during registry ingest.
      specimen.expect(typeof provider).toBe("function");
      specimen.expect(typeof provider().open).toBe("function");
    },
  );

  specimen.it(
    "P-body: open returns the body byte-identical to what was served",
    async () => {
      const { open } = provider();
      const got = await open("https://docs.deno.com/x", serve(page));
      // the stream is readable ONCE. if open did not keep this, nothing could.
      specimen.expect(got.body).toBe(page);
      specimen.expect(got.bytes).toBe(new TextEncoder().encode(page).length);
      specimen.expect(got.capped).toBe(false);
    },
  );

  specimen.it(
    "P-body: the status and the headers that came with it are kept too",
    async () => {
      const { open } = provider();
      const got = await open(
        "https://docs.deno.com/x",
        serve(page, { ...HTML, "x-served-by": "fixture" }),
      );
      specimen.expect(got.status).toBe(200);
      specimen.expect(got.headers["x-served-by"]).toBe("fixture");
      specimen.expect(got.headers["content-type"]).toContain("text/html");
    },
  );

  specimen.it(
    "the page carries its title, its skeleton and a live extract",
    async () => {
      const { open } = provider();
      const got = await open("https://docs.deno.com/x", serve(page));
      specimen.expect(got.title).toBe("Permissions | Deno Docs");
      specimen.expect(got.skeleton).toContain("main#content.prose");
      specimen.expect(got.skeleton.includes("secure by default")).toBe(false);

      const article = got.extract("main#content");
      specimen.expect(article.matched).toBe(true);
      specimen.expect(article.markdown).toContain("# Permissions");
    },
  );

  specimen.it(
    "extract resolves links against the FINAL url, not the one asked for",
    async () => {
      const { open } = provider();
      const got = await open(
        "https://docs.deno.com/runtime/fundamentals/permissions/",
        serve(page),
      );
      const hrefs = got.extract("main#content").links.map((link) => link.href);
      specimen.expect(hrefs).toContain(
        "https://docs.deno.com/runtime/fundamentals/testing/",
      );
    },
  );

  specimen.it(
    "a refusal comes back as a throw the caller can report, not a silent empty page",
    async () => {
      const { open } = provider();
      let thrown = null;
      try {
        await open("http://127.0.0.1:2501/", {
          fetch: () => Promise.reject(new Error("never")),
          resolve,
        });
      } catch (error) {
        thrown = error.message;
      }
      specimen.expect(thrown).toContain("not a public address");
    },
  );
});
