import { v, Vector } from "@vivalence/typology";
import { COUNT, query } from "./wikipedia.js";
import { CHOOSE, Pick } from "./choose.js";

export const web = new Vector()
  .open(
    {
      nature: "/web/search",
      valence:
        "Search Wikipedia, the English encyclopedia. No key, no account. Every result is an " +
        "article: its title, its address and a snippet of the matching text. Snippets are " +
        "fragments, so open any article you intend to quote with web_read — an opened article " +
        "carries the links in its body, and following them is how you get from a subject to its " +
        "neighbours. Wikipedia is strong on anything with a name — people, places, species, " +
        "events, ideas — and thin on the very recent, the very local and anything not yet " +
        "notable; say so when a query lands outside what it holds. Search matches titles first, " +
        "so ask for the subject as an article would be titled. Zero results is an answer: say the " +
        "encyclopedia holds nothing rather than asking again for the same thing. Text is " +
        "CC BY-SA 4.0 — name the article when you quote it. " +
        'Example: { query: "flamingo" }.',
      input: v.object({
        query: v
          .string()
          .desc(
            "The subject as an article would be titled, plain words, no operators. Example: \"flamingo\", not \"tell me about flamingos\".",
          ),
        count: v
          .integer({ minimum: 1, maximum: 100 })
          .desc(
            "How many results to return. Leave it out — eight is enough to orient. Pass a number " +
              "only when a first pass missed and you want to go deeper.",
          )
          .default(COUNT)
          .optional(),
      }),
    },
    async (ctx) => {
      try {
        const results = await query(ctx.input.query, ctx.input.count);
        return { output: { results, count: results.length } };
      } catch (error) {
        return { condition: "ERROR", output: { message: error.message } };
      }
    },
  )
  .open(
    {
      nature: "/web/read",
      valence:
        "Open one URL and read the article out of it — navigation, sidebars and footers removed, " +
        "the body returned as markdown with its headings and lists intact. Also returns the links " +
        "found INSIDE the article, so you can follow a citation without re-searching, and `images` " +
        "— every <img> in it as { alt, src }, src already absolute https — the ONLY place a src for " +
        "a figure may come from. `chars` tells " +
        "you how much text the page held: a few hundred means a stub, not a subject — say so rather " +
        "than writing a page out of it. `truncated: true` means the page was longer than what you " +
        "got, and `title` is the document's own title, read off the page and never guessed. A read " +
        "is expensive and stays in this conversation for every later turn, so open a page you mean " +
        "to use rather than one you are curious about, and never re-open a page already in this " +
        "thread — its text is still here. " +
        'got. Example: { url: "https://docs.deno.com/runtime/" }.',
      input: v.object({
        url: v
          .url()
          .desc(
            "The full address to read, copied from a search result. Only http and https, only " +
              'public addresses. Example: "https://docs.deno.com/runtime/fundamentals/security/".',
          ),
      }),
    },
    async (ctx) => {
      const reader = ctx.daemon.services?.reader;
      // the daemon may not consume a reader yet. say what to do instead, not just what is wrong —
      // web_search's own valence sends the model here before it quotes anything.
      if (!reader) {
        return {
          condition: "ERROR",
          output: {
            message:
              "web_read is not available on this daemon — no reader service is consumed. " +
              "Do not retry it. Answer from the web_search snippets you already have, and say " +
              "plainly that you could not open the page.",
          },
        };
      }
      try {
        const page = await reader.open(ctx.input.url);
        const folded = await ctx.daemon.cortex.hallucinate.object.render({
          policy: { tune: "frugal" },
          system: { choose: CHOOSE },
          turns: [{
            role: "user",
            parts: [{ type: "text", text: page.skeleton }],
          }],
          output: { schema: Pick },
        });
        const pick = folded.output.object;

        const article = page.extract(pick.selector);
        // the title is the DOCUMENT's, never the model's — the skeleton it read carries no text,
        // so a title from the pick could only ever be a guess or a refusal. it answered
        // "<UNKNOWN>" on the first live read, which was the honest answer to a bad question.
        const output = { url: page.url, title: page.title, ...article };
        // the one number that decides whether this tool is affordable: what the model is
        // handed back, and re-billed for on every later turn of the thread.
        return { output };
      } catch (error) {
        return {
          condition: "ERROR",
          output: { message: `${error.message} — ${ctx.input.url}` },
        };
      }
    },
  );
