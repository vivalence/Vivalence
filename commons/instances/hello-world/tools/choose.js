import { v } from "@vivalence/typology";

// the agentic half of reading. object.render reads request.output.schema
// (anthropic/provider/index.js:39) — the harness wraps at harnessed.js:83, cortex-direct does
// not, so the schema is spelled out at the call site in index.js.
export const CHOOSE = [
  "You are given the structural skeleton of a web page — tags, ids, classes, the number of",
  "characters of text each node holds, and how many paragraphs. No text.",
  "Return the CSS selector of the single node that holds the ARTICLE: the body a reader came",
  "for. Navigation, sidebars, headers and footers hold text too — they are not it. High",
  "character count WITH paragraphs is the signal; high count with p=0 is usually a menu.",
  "Prefer the TIGHTEST node that still holds the paragraphs — a wrapper drags in the page's",
  "own table of contents and anchor lists along with the prose.",
].join("\n");

// no title field: the model's only input is the skeleton, which carries no text by design, so
// asking it to name the page asks for something it cannot know — it answered "<UNKNOWN>", which
// was the honest answer. document.title is deterministic and already on the page.
export const Pick = v.object({
  selector: v
    .string()
    .desc(
      "CSS selector of the node holding the article body. One node, as tight as possible. " +
        'Examples: "main#content" · "article.post-body" · "div#mw-content-text" · ' +
        '"#main > article". Not "body", not "#root", not a comma list.',
    ),
  reason: v
    .string()
    .desc(
      'One clause: why that node and not its neighbours. Example: "1.9k chars over 14 paragraphs; the sibling nav has p=0".',
    ),
});
