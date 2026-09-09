import TurndownService from "npm:turndown@7.2.0";
import { LIMITS } from "./limits.js";

// PURE — a document and a selector in, markdown out. LIMITS comes from its own module so this
// stays clear of the network graph.
const FURNITURE = [
  "script",
  "style",
  "noscript",
  "iframe",
  "nav",
  "aside",
  "footer",
  "form",
  "button",
];

export const extract = (document, selector, base) => {
  let node = null;
  try {
    node = document.querySelector(selector);
  } catch {
    // a model wrote this selector. an invalid one is a bad guess, not a crash.
    node = null;
  }
  const matched = Boolean(node);
  node ??= document.body ?? document;

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  turndown.remove(FURNITURE);

  // links are absolutised in the BODY as well as the array — a relative href in markdown the
  // model quotes back is a dead reference with nothing to resolve it against. resolving is not
  // the same as vetting: `javascript:void(0)` resolves perfectly well, so the scheme is checked
  // on the RESULT and anything that is not http(s) loses its href entirely.
  for (const anchor of node.querySelectorAll("a[href]")) {
    let resolved = null;
    try {
      resolved = new URL(anchor.getAttribute("href"), base).href;
    } catch {
      resolved = null;
    }
    if (resolved && /^https?:/.test(resolved)) {
      anchor.setAttribute("href", resolved);
    } else anchor.removeAttribute("href");
  }

  // images the same way, https ONLY — an <img> the model copies into a page is fetched by the
  // operator's browser, and a mixed-content http src is blocked there anyway. `srcset` goes:
  // turndown ignores it and the model must never see two spellings of one picture.
  // the query goes too: a tracking tail (wikipedia stamps ?utm_source=… on every thumb) is
  // noise the model would carry into a page, and noise it is tempted to "clean" — and a model
  // that edits one part of a src edits the width next. it copies a clean src or none.
  for (const image of node.querySelectorAll("img[src]")) {
    let resolved = null;
    try {
      const clean = new URL(image.getAttribute("src"), base);
      clean.search = "";
      resolved = clean.href;
    } catch {
      resolved = null;
    }
    if (resolved && /^https:/.test(resolved)) {
      image.setAttribute("src", resolved);
      image.setAttribute("alt", (image.getAttribute("alt") ?? "").trim());
      image.removeAttribute("srcset");
    } else image.remove();
  }

  let markdown = turndown.turndown(node.innerHTML);
  const truncated = markdown.length > LIMITS.chars;
  if (truncated) markdown = markdown.slice(0, LIMITS.chars);

  const links = [...node.querySelectorAll("a[href]")]
    .map((anchor) => ({
      text: anchor.textContent.trim().slice(0, 60),
      href: anchor.getAttribute("href"),
    }))
    .filter((link) => /^https?:/.test(link.href));

  const images = [...node.querySelectorAll("img[src]")]
    .slice(0, LIMITS.images)
    .map((image) => ({
      alt: (image.getAttribute("alt") ?? "").trim().slice(0, 120),
      src: image.getAttribute("src"),
    }));

  return {
    markdown,
    chars: markdown.length,
    truncated,
    links,
    images,
    selector,
    matched,
  };
};
