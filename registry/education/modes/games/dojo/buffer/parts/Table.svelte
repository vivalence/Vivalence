<script>
  import { Asset, Pip, visible } from "@vivalence/drapes";
  import * as streak from "../streak.js";

  const {
    knowable,
    cells,
    session,
    recalls,
    axes,
    prompt = "TEXT",
    editing = null,
    revealed = false,
    assetOf,
    oncorrect,
    onselect,
  } = $props();

  const POSITIVE = ["MASTERY", "SUCCESS", "NEUTRAL"];

  const tokens = $derived(knowable.tokens ?? []);
  const active = $derived(revealed ? null : streak.current(session));
  const done = $derived(streak.complete(session));
  const pending = $derived(new Set(session.pending.map((entry) => entry.index)));
  const listening = $derived(prompt === "AUDIO");

  const expected = (index) => (recalls[index] === "KNOWN" ? tokens[index].gloss : tokens[index].form);
  const asked = (index) => (recalls[index] === "KNOWN" ? tokens[index].form : tokens[index].gloss);
  const who = (token) => [token.person, token.number].filter(Boolean).join(" ");
  const good = (cell) => POSITIVE.includes(cell.signal) || cell.corrected;
  const correctable = (cell, index) => done && cell.signal === "MISTAKE" && !cell.corrected && !pending.has(index);

  const firsts = $derived(cells.filter((cell) => cell.first));
  const clean = $derived(cells.filter((cell) => POSITIVE.includes(cell.first)).length);
</script>

<div class="table" class:revealed>
  {#each tokens as token, index (token.slot ?? index)}
    {@const cell = cells[index]}
    {@const current = active?.index === index}
    {@const reached = session.pending.find((entry) => entry.index === index)?.runs ?? session.streak ?? 0}
    {@const runs = session.streak > 1 ? Array.from({ length: session.streak }, (value, position) => position < reached) : []}
    <div
      class="cell-row"
      class:current
      use:visible={{ when: current, block: "center" }}
      class:editing={editing === index}
      class:ok={!revealed && cell.committed && good(cell)}
      class:miss={!revealed && cell.committed && !good(cell)}
      role="button"
      tabindex="-1"
      onclick={() => !revealed && onselect?.(index)}>
      <span class="who">{who(token)}</span>
      <div class="cell">
        {#if revealed}
          <span class="answer">{token.form}</span>
          <span class="gloss">{token.gloss}</span>
        {:else if editing === index}
          <span class="ask">correct it — {expected(index)}</span>
        {:else if current}
          {#if listening}
            {#if assetOf(token.asset)}<Asset asset={assetOf(token.asset)} variant="inline" autoplay={true} />{/if}
          {:else}
            <span class="ask">{asked(index)}</span>
            {#if recalls[index] === "KNOWN" && assetOf(token.asset)}<Asset asset={assetOf(token.asset)} variant="dot" autoplay={true} />{/if}
          {/if}
          {#if cell.committed && !good(cell)}<span class="struck">{cell.typed}</span>{/if}
        {:else if cell.committed}
          {#if correctable(cell, index)}
            <button
              class="struck retype"
              onclick={(event) => {
                event.stopPropagation();
                oncorrect(index);
              }}>{cell.typed || "·"}</button>
            <span class="answer">{expected(index)}</span>
          {:else if good(cell)}
            <span class="typed ok">{cell.corrected ? expected(index) : cell.typed}</span>
          {:else}
            <span class="struck">{cell.typed || "·"}</span>
            {#if !pending.has(index)}<span class="answer">{expected(index)}</span>{/if}
          {/if}
        {:else}
          <span class="blank">___</span>
        {/if}
      </div>
      <span class="tail">
        {#if runs.length}
          <span class="runs">
            {#each runs as filled, position (position)}
              <Pip size={5} tone={filled ? "primary" : "muted"} />
            {/each}
          </span>
        {/if}
        {#if (revealed || (cell.committed && good(cell))) && assetOf(token.asset)}
          <Asset asset={assetOf(token.asset)} variant="dot" autoplay={!revealed && recalls[index] !== "KNOWN"} />
        {/if}
      </span>
    </div>
  {/each}
</div>

{#if done && !revealed}
  <p class="summary">
    {clean}/{tokens.length} on the first try
    {#if firsts.length > clean} · missed cells retype in place — click one{/if}
    · next ⏎
  </p>
{/if}

<style>
  .table {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
    margin-top: 0.5rem;
  }
  .cell-row {
    display: grid;
    grid-template-columns: minmax(6rem, 9rem) 1fr auto;
    gap: 0 0.75rem;
    align-items: center;
    padding: 0.45rem 0.75rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 40%, transparent);
    transition: background 0.15s;
    min-height: 2.4rem;
  }
  .cell-row:nth-child(odd) {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 65%, transparent);
  }
  .cell-row.current {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 25%, transparent);
    outline: 1px solid color-mix(in srgb, var(--colors-theme-primary-contrast) 30%, transparent);
  }
  .cell-row.editing {
    outline: 1px solid var(--colors-system-warning-contrast);
  }
  .cell-row.ok {
    background: color-mix(in srgb, var(--colors-system-success-surface) 20%, transparent);
  }
  .cell-row.miss {
    background: color-mix(in srgb, var(--colors-system-error-surface) 18%, transparent);
  }
  .who {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cell {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    min-width: 0;
    overflow: hidden;
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    line-height: 1.35;
  }
  .ask {
    color: var(--text-body);
    font-style: italic;
  }
  .blank {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--text-support);
    opacity: 0.5;
  }
  .typed.ok {
    color: var(--colors-system-success-contrast);
  }
  .struck {
    color: var(--colors-system-error-contrast);
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }
  .retype {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font: inherit;
    text-align: left;
  }
  .answer {
    color: var(--colors-theme-primary-contrast);
  }
  .gloss {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    color: var(--text-support);
  }
  .tail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 32px;
    justify-content: flex-end;
  }
  .runs {
    display: flex;
    gap: 3px;
  }
  .summary {
    margin: 0.9rem 0 0 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
  }
  @media (max-width: 640px) {
    .cell-row {
      grid-template-columns: minmax(3.5rem, 5.5rem) 1fr auto;
      padding: 0.4rem 0.5rem;
    }
    .cell {
      font-family: var(--font-family-sans-text);
    }
    .who {
      font-size: var(--font-size-2xs);
    }
  }
</style>
