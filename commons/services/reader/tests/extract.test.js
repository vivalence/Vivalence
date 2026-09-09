import { parseHTML } from "npm:linkedom@0.18.5";
import { specimen } from "@vivalence/typology";
import { extract } from "../extract.js";
import { LIMITS } from "../limits.js";

const BASE = new URL("https://docs.deno.com/runtime/fundamentals/permissions/");
const page = Deno.readTextFileSync(
  new URL("./fixtures/deno-docs.html", import.meta.url),
);
const cut = (selector, html = page, base = BASE) =>
  extract(parseHTML(html).document, selector, base);

specimen.describe("extract — one node, as markdown", () => {
  specimen.it(
    "the chosen node comes back as markdown with its headings intact",
    () => {
      const { markdown, matched } = cut("main#content");
      specimen.expect(matched).toBe(true);
      specimen.expect(markdown).toContain("# Permissions");
      specimen.expect(markdown).toContain("## Granting narrowly");
      specimen.expect(markdown).toContain("secure by default");
    },
  );

  specimen.it(
    "P-furniture: nothing from the nav, sidebar or footer rides along",
    () => {
      const { markdown } = cut("main#content");
      specimen.expect(markdown.includes("Deno authors")).toBe(false);
      specimen.expect(markdown.includes("On this page")).toBe(false);
      specimen.expect(markdown.includes("Workspaces")).toBe(false);
    },
  );

  specimen.it(
    "a fenced code block survives as a fence, not as indented prose",
    () => {
      const { markdown } = cut("main#content");
      specimen.expect(markdown).toContain("```");
      specimen.expect(markdown).toContain("deno run --allow-read=/etc");
    },
  );

  specimen.it("P-links: relative hrefs are absolute in the ARRAY", () => {
    const { links } = cut("main#content");
    const hrefs = links.map((link) => link.href);
    specimen.expect(hrefs).toContain(
      "https://docs.deno.com/runtime/fundamentals/security/",
    );
    specimen.expect(hrefs).toContain("https://jsr.io/@std/fs");
    // "../testing/" resolved against the BASE path, not against the origin.
    specimen.expect(hrefs).toContain(
      "https://docs.deno.com/runtime/fundamentals/testing/",
    );
    specimen.expect(hrefs.every((href) => /^https?:\/\//.test(href))).toBe(
      true,
    );
  });

  specimen.it(
    "P-links: and absolute IN THE BODY TOO — a relative href quoted back is dead",
    () => {
      const { markdown } = cut("main#content");
      specimen.expect(markdown).toContain(
        "(https://docs.deno.com/runtime/fundamentals/security/)",
      );
      specimen.expect(markdown).toContain(
        "(https://docs.deno.com/runtime/fundamentals/testing/)",
      );
      // the assertion that would have caught the original defect: no bare relative target left.
      specimen.expect(/\]\((?!https?:)[^)]/.test(markdown)).toBe(false);
    },
  );

  specimen.it(
    "P-selector: a garbage selector falls back to the body instead of throwing",
    () => {
      const { markdown, matched, selector } = cut("main#content > > ::");
      specimen.expect(matched).toBe(false);
      // the selector the model asked for is still reported, so the fallback is legible.
      specimen.expect(selector).toBe("main#content > > ::");
      specimen.expect(markdown).toContain("secure by default");
    },
  );

  specimen.it(
    "P-selector: a valid selector that matches nothing falls back the same way",
    () => {
      const { markdown, matched } = cut("article#nowhere");
      specimen.expect(matched).toBe(false);
      specimen.expect(markdown).toContain("secure by default");
    },
  );

  specimen.it(
    "P-cap: past the char cap the markdown is cut and truncated says so",
    () => {
      const long = `<html><body><main id="c">${
        "<p>" + "word ".repeat(20) + "</p>".repeat(1)
      }</main></body></html>`.replace(
        "</main>",
        "<p>" + "filler ".repeat(LIMITS.chars / 3) + "</p></main>",
      );
      const { markdown, chars, truncated } = cut("main#c", long);
      specimen.expect(truncated).toBe(true);
      specimen.expect(markdown.length).toBe(LIMITS.chars);
      specimen.expect(chars).toBe(LIMITS.chars);
    },
  );

  specimen.it(
    "P-cap: under the cap nothing is cut and truncated is false",
    () => {
      const { truncated, chars, markdown } = cut("main#content");
      specimen.expect(truncated).toBe(false);
      specimen.expect(chars).toBe(markdown.length);
      specimen.expect(chars < LIMITS.chars).toBe(true);
    },
  );

  specimen.it(
    "an unresolvable href is dropped rather than carried as a broken link",
    () => {
      const html =
        `<html><body><main id="c"><p><a href="javascript:void(0)">x</a>
      <a href="mailto:a@b.test">mail</a><a href="/real">real</a></p></main></body></html>`;
      const { links, markdown } = cut("main#c", html);
      specimen.expect(links.map((link) => link.href)).toEqual([
        "https://docs.deno.com/real",
      ]);
      specimen.expect(markdown.includes("javascript:")).toBe(false);
    },
  );

  specimen.it(
    "P-images: img src is absolute and https in the ARRAY and the BODY; protocol-relative resolves, the query goes, http and data drop, srcset goes",
    () => {
      const html = `<html><body><main id="c">
        <img src="//upload.wikimedia.org/wikipedia/commons/a/ab/Flamingo.jpg" srcset="//upload.wikimedia.org/x.jpg 2x" alt=" Greater flamingos ">
        <img src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flamingo_1.jpg/330px-Flamingo_1.jpg?utm_source=en.wikipedia.org&amp;utm_campaign=parser" alt="thumb">
        <img src="/thumbs/local.png" alt="local">
        <img src="http://insecure.test/pic.jpg" alt="insecure">
        <img src="data:image/png;base64,AAAA" alt="inline">
        <p>text</p></main></body></html>`;
      const { images, markdown } = cut("main#c", html);
      specimen.expect(images).toEqual([
        {
          alt: "Greater flamingos",
          src:
            "https://upload.wikimedia.org/wikipedia/commons/a/ab/Flamingo.jpg",
        },
        {
          alt: "thumb",
          src:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flamingo_1.jpg/330px-Flamingo_1.jpg",
        },
        { alt: "local", src: "https://docs.deno.com/thumbs/local.png" },
      ]);
      specimen.expect(markdown.includes("utm_source")).toBe(false);
      specimen.expect(markdown).toContain(
        "![Greater flamingos](https://upload.wikimedia.org/wikipedia/commons/a/ab/Flamingo.jpg)",
      );
      specimen.expect(markdown.includes("//upload.wikimedia.org/x.jpg")).toBe(
        false,
      );
      specimen.expect(markdown.includes("insecure.test")).toBe(false);
      specimen.expect(markdown.includes("data:image")).toBe(false);
    },
  );

  specimen.it("P-images: the array is capped at LIMITS.images", () => {
    const many = Array.from(
      { length: LIMITS.images + 5 },
      (_, i) => `<img src="/i${i}.png" alt="${i}">`,
    ).join("");
    const { images } = cut(
      "main#c",
      `<html><body><main id="c">${many}</main></body></html>`,
    );
    specimen.expect(images).toHaveLength(LIMITS.images);
  });
});
