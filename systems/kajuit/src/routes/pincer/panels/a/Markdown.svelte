<script>
  import { parseBlocks } from "./markdown.js";

  let { text = "" } = $props();
  const blocks = $derived(parseBlocks(text ?? ""));

  function copyCode(code) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(code).catch(() => {});
  }
</script>

{#each blocks as block, i (i)}
  {#if block.kind === "paragraph"}
    <p class="md-p">
      {#each block.inline as seg, j (j)}
        {#if seg.kind === "bold"}<strong>{seg.text}</strong>
        {:else if seg.kind === "italic"}<em>{seg.text}</em>
        {:else if seg.kind === "code"}<code class="md-inline-code">{seg.text}</code>
        {:else if seg.kind === "link"}<a href={seg.href} target="_blank" rel="noreferrer noopener">{seg.text}</a>
        {:else}{seg.text}{/if}
      {/each}
    </p>
  {:else if block.kind === "heading"}
    <div class="md-h md-h{block.level}">
      {#each block.inline as seg, j (j)}
        {#if seg.kind === "bold"}<strong>{seg.text}</strong>{:else if seg.kind === "italic"}<em>{seg.text}</em>{:else if seg.kind === "code"}<code class="md-inline-code">{seg.text}</code>{:else if seg.kind === "link"}<a href={seg.href} target="_blank" rel="noreferrer noopener">{seg.text}</a>{:else}{seg.text}{/if}
      {/each}
    </div>
  {:else if block.kind === "code-block"}
    <div class="md-code">
      <header>
        <span class="md-lang">{block.lang || "txt"}</span>
        <button type="button" title="copy" onclick={() => copyCode(block.text)}>copy</button>
      </header>
      <pre>{block.text}</pre>
    </div>
  {:else if block.kind === "list"}
    {#if block.ordered}
      <ol class="md-list">
        {#each block.items as item, j (j)}
          <li>{#each item.inline as seg, k (k)}{#if seg.kind === "bold"}<strong>{seg.text}</strong>{:else if seg.kind === "italic"}<em>{seg.text}</em>{:else if seg.kind === "code"}<code class="md-inline-code">{seg.text}</code>{:else if seg.kind === "link"}<a href={seg.href} target="_blank" rel="noreferrer noopener">{seg.text}</a>{:else}{seg.text}{/if}{/each}</li>
        {/each}
      </ol>
    {:else}
      <ul class="md-list">
        {#each block.items as item, j (j)}
          <li>{#each item.inline as seg, k (k)}{#if seg.kind === "bold"}<strong>{seg.text}</strong>{:else if seg.kind === "italic"}<em>{seg.text}</em>{:else if seg.kind === "code"}<code class="md-inline-code">{seg.text}</code>{:else if seg.kind === "link"}<a href={seg.href} target="_blank" rel="noreferrer noopener">{seg.text}</a>{:else}{seg.text}{/if}{/each}</li>
        {/each}
      </ul>
    {/if}
  {:else if block.kind === "blockquote"}
    <div class="md-quote">
      {#each block.inline as seg, j (j)}
        {#if seg.kind === "bold"}<strong>{seg.text}</strong>{:else if seg.kind === "italic"}<em>{seg.text}</em>{:else if seg.kind === "code"}<code class="md-inline-code">{seg.text}</code>{:else if seg.kind === "link"}<a href={seg.href} target="_blank" rel="noreferrer noopener">{seg.text}</a>{:else}{seg.text}{/if}
      {/each}
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
    font-size: 8px;
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
    font-size: 10px;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre;
    color: var(--colors-skeleton-0-contrast);
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
