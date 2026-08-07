<script>
  import { parseBlocks } from "../markdown.js";

  let { text = "" } = $props();
  const blocks = $derived(parseBlocks(text ?? ""));

  function copyCode(code) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(code).catch(() => {});
  }
</script>

{#snippet inline(segs)}
  {#each segs as seg, j (j)}
    {#if seg.kind === "bold"}<strong>{seg.text}</strong>{:else if seg.kind === "italic"}<em>{seg.text}</em>{:else if seg.kind === "code"}<code class="md-inline-code">{seg.text}</code>{:else if seg.kind === "link"}<a href={seg.href} target="_blank" rel="noreferrer noopener">{seg.text}</a>{:else}{seg.text}{/if}
  {/each}
{/snippet}

{#each blocks as block, i (i)}
  {#if block.kind === "paragraph"}
    <p class="md-p">{@render inline(block.inline)}</p>
  {:else if block.kind === "heading"}
    <div class="md-h md-h{block.level}">{@render inline(block.inline)}</div>
  {:else if block.kind === "code-block"}
    <div class="md-code">
      <header>
        <span class="md-lang">{block.lang || "txt"}</span>
        <button type="button" title="copy" onclick={() => copyCode(block.text)}>copy</button>
      </header>
      <pre class:wrap={!block.lang || block.lang === "txt" || block.lang === "text"}>{block.text}</pre>
    </div>
  {:else if block.kind === "list"}
    {#if block.ordered}
      <ol class="md-list">
        {#each block.items as item, j (j)}
          <li>{@render inline(item.inline)}</li>
        {/each}
      </ol>
    {:else}
      <ul class="md-list">
        {#each block.items as item, j (j)}
          <li>{@render inline(item.inline)}</li>
        {/each}
      </ul>
    {/if}
  {:else if block.kind === "blockquote"}
    <div class="md-quote">{@render inline(block.inline)}</div>
  {:else if block.kind === "table"}
    <div class="md-table-wrap">
      <table class="md-table">
        <thead>
          <tr>
            {#each block.header as cell, j (j)}
              <th>{@render inline(cell)}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each block.rows as row, j (j)}
            <tr>
              {#each row as cell, k (k)}
                <td>{@render inline(cell)}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if block.kind === "hr"}
    <hr class="md-hr" />
  {/if}
{/each}

<style>
  .md-p {
    margin: 0;
    padding: 0;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .md-p + .md-p {
    margin-top: 6px;
  }
  .md-h {
    font-weight: 700;
    margin: 4px 0 2px;
    line-height: 1.2;
  }
  .md-h1 { font-size: 1.3em; }
  .md-h2 { font-size: 1.18em; }
  .md-h3 { font-size: 1.08em; }
  .md-h4 { font-size: 1em; }
  .md-h5, .md-h6 { font-size: 0.95em; opacity: 0.9; }
  .md-list {
    margin: 4px 0;
    padding-left: 18px;
  }
  .md-list li {
    margin: 1px 0;
    line-height: 1.4;
  }
  .md-quote {
    border-left: 2px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 35%, transparent);
    padding: 2px 0 2px 8px;
    opacity: 0.8;
    margin: 4px 0;
  }
  .md-hr {
    border: none;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    margin: 6px 0;
  }
  .md-code {
    margin: 6px 0;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 35%, transparent);
    border-radius: 3px;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 35%, transparent);
    overflow: hidden;
  }
  .md-code header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 6px 3px 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 35%, transparent);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: lowercase;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 60%, transparent);
  }
  .md-lang {
    flex: 1;
    opacity: 0.5;
  }
  .md-code header button {
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    opacity: 0.55;
    padding: 0;
  }
  .md-code header button:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .md-code pre {
    margin: 0;
    padding: 6px 8px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre;
    color: var(--colors-skeleton-0-contrast);
  }
  .md-code pre.wrap {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    overflow-x: visible;
  }
  .md-table-wrap {
    margin: 6px 0;
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 35%, transparent);
    border-radius: 3px;
  }
  .md-table {
    border-collapse: collapse;
    width: 100%;
  }
  .md-table th,
  .md-table td {
    padding: 4px 8px;
    text-align: left;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 25%, transparent);
    white-space: nowrap;
  }
  .md-table th {
    color: var(--colors-skeleton-0-primary-base);
    text-transform: lowercase;
    letter-spacing: 0.08em;
    font-weight: 400;
    font-size: var(--font-size-2xs);
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 60%, transparent);
  }
  .md-table tbody tr:last-child td {
    border-bottom: none;
  }
  .md-inline-code {
    font-family: var(--font-family-code);
    font-size: 0.92em;
    padding: 1px 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
    color: var(--colors-skeleton-0-contrast);
  }
  strong {
    font-weight: 700;
    color: var(--colors-skeleton-0-contrast);
  }
  em {
    font-style: italic;
  }
  a {
    color: var(--colors-skeleton-0-primary-base);
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 2px;
  }
  a:hover {
    text-decoration-style: solid;
  }
</style>
