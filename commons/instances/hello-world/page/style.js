// the house style, as instructions rather than a schematic — beef's ruling: "i don't want a
// schematic because that ... wouldn't need a bundler. i want instructions into the harness or
// into that specific tool, into the generator tool for what HTML and what's spelled to use."
//
// fills ctx.hallucination.system.render, written once by harness.js and passed again by the
// researcher at M4. every token below is emitted by every theme dapper ships — tests/style.tokens.test.js
// pins that against design(), because a token taught here that dapper does not emit
// renders the page unstyled and nothing else in the suite would catch it.
export const RENDER = `
HOUSE RULES for every component you draw. These are not suggestions — a component that
ignores them renders wrong, because it is mounted inside a themed application and compiled
without the application's stylesheet.

SHELL — always exactly this frame:

  <script>
    let { buffer, terminal } = $props();
  </script>

  <article class="page">
    …your content…
  </article>

  <style>
    .page {
      height: 100%; overflow-y: auto; box-sizing: border-box;
      padding: 40px 26px 72px;
      background: var(--surface);
      color: var(--text-strong);
      font-family: var(--font-family-sans-text);
    }
  </style>

RULES
  · runes only — $props $state $derived $effect.
  · scoped <style> only. NEVER write utility classes (text-sm, flex, p-4) — they do not
    exist here and will do nothing.
  · colour, type and spacing come from the variables below. Never a hex, never a named
    colour. They are already themed for light and dark both.
  · the root element must fill and scroll: height 100% + overflow-y auto. It is a pane
    inside an application, not a page in a browser.
  · imports allowed: "svelte", "nanostores", "@vivalence/typology", "@vivalence/drapes".
    Never a URL.
  · one column, max-width 720px, margin-inline auto, sections stacked with gap 26px.
    Prose measures about 70 characters. No grid unless you are showing a table.
  · an image is ONLY the figure pattern below, and its src is ONLY one from the images of a
    page you opened with web_read — never invented, never a search snippet. Copy it BYTE FOR
    BYTE: never change a width, a filename or a path. A Wikimedia thumbnail is served only at
    the width you saw it at; change the number and the image is gone. One lead figure at the
    top when a source carries one; not a gallery.

TOKENS
  surfaces   --surface        the field (the page itself)
             --surface-sunk   sunk — panels, quotes, tables
             --surface-lift   raised — a card floating above
  rules      --boundary-soft  hairline
             --boundary       strong rule
  type       --text-strong    headings and values
             --text-ink       prose
             --text-light     labels, captions, timestamps
  accents    --signal-primary-ink    links, the house teal
             --signal-caution-ink    caution
             --signal-negative-ink   trouble
             --signal-positive       a live dot
  scale      --font-size-2xs xs sm md base lg xl 2xl 3xl 4xl
  families   --font-family-sans-text · --font-family-code · --font-family-sans-heading

PATTERNS — the house dialect. Copy these; do not invent a second one.

  a title
    <h1 class="title">Flamingo</h1>
    .title { margin: 0 0 6px; font-family: var(--font-family-sans-heading);
             font-size: var(--font-size-3xl); line-height: 1.15; color: var(--text-strong); }

  a standfirst under it
    <p class="standfirst">Wading birds of salt lakes and lagoons, pink from what they eat.</p>
    .standfirst { margin: 0; font-size: var(--font-size-base); color: var(--text-light); }

  a section rule — label, hairline, trailing note. The house's one divider.
    <div class="rule"><span class="label">history</span><span class="line"></span>
      <span class="trace">3 sources</span></div>
    .rule  { display: flex; align-items: center; gap: 9px; }
    .line  { flex: 1; height: 1px;
             background: color-mix(in srgb, var(--divider) 90%, transparent); }
    .label { font-family: var(--font-family-code); font-size: var(--font-size-2xs);
             letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-light); }
    .trace { font-family: var(--font-family-code); font-size: var(--font-size-2xs);
             letter-spacing: 0.08em; color: var(--text-light); }

  a paragraph
    <p class="body">Flamingos filter-feed with the head held upside down…</p>
    .body { margin: 0; font-size: var(--font-size-base); line-height: 1.55;
            color: var(--text-ink); }

  a fact list
    <div class="panel">
      <div class="row"><span class="key">family</span><span class="value">Phoenicopteridae</span></div>
    </div>
    .panel { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px;
             background: var(--surface-sunk);
             border: 1px solid var(--boundary-soft); border-radius: 6px; }
    .row   { display: flex; align-items: baseline; gap: 10px; padding: 3px 0; }
    .key   { flex: none; width: 96px; font-size: var(--font-size-xs);
             color: var(--text-light); }
    .value { font-family: var(--font-family-code); font-size: var(--font-size-xs);
             color: var(--text-strong); }

  a figure — an image from a page you opened, the source named under it
    <figure class="figure">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flamingo_1.jpg/330px-Flamingo_1.jpg" alt="Greater flamingos wading" loading="lazy" />
      <figcaption class="caption">Greater flamingos, Camargue — Wikipedia</figcaption>
    </figure>
    .figure { margin: 0 0 26px; }
    .figure img { display: block; width: 100%; height: auto; border-radius: 6px;
                  background: var(--surface-sunk); }
    .caption { margin: 6px 0 0; font-family: var(--font-family-code); font-size: var(--font-size-2xs);
               letter-spacing: 0.08em; color: var(--text-light); }

  a source you opened
    <a class="source" href={url} target="_blank" rel="noreferrer">{title} ↗</a>
    .source { display: block; font-size: var(--font-size-sm);
              color: var(--signal-primary-ink); text-decoration: none; }
    .source:hover { color: var(--signal-primary-ink); }

  a pill
    <span class="pill">search engine</span>
    .pill { padding: 2px 9px; border: 1px solid var(--boundary-soft);
            border-radius: 9999px; font-family: var(--font-family-code);
            font-size: var(--font-size-2xs); color: var(--text-light); }

  prose you already hold as markdown — do not re-implement it
    import { Markdown } from "@vivalence/drapes";
    <Markdown text={buffer.data.body} />
    (headings, lists, quotes, tables, fenced code, links — all themed already)
`;
