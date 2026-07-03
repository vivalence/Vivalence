<script>
  import { STATUS_COLOR, ONTOLOGY } from "./palette.js";

  const { board = [] } = $props();

  // weakest & strongest (6 + 6, weakest-first in the due group), folded from the board.
  const seenLits = $derived(board.filter((row) => row.seen));
  const sorted = $derived([...seenLits].sort((a, b) => b.strength - a.strength));
  const N = $derived(sorted.length);
  const topLits = $derived(sorted.slice(0, 6).map((d, i) => ({ d, rank: i + 1 })));
  // weakest first: the tail reversed, so #N (the very weakest) leads.
  const bottomLits = $derived(
    sorted
      .slice(-6)
      .map((d, i) => ({ d, rank: N - 5 + i }))
      .reverse(),
  );
  const litPct = (d) => Math.round((100 * (Math.log10(Math.max(d.strength, 1e-3)) + 3)) / 3);
</script>

<section class="stat">
  <h4>Weakest &amp; strongest</h4>
  <div class="ranks">
    <div class="group-label">Most confident<span class="group-hint">{N} scored ↓</span></div>
    {#each topLits as { d, rank }}
      <div class="lit">
        <i class="glyph" style:color={STATUS_COLOR[d.status]}>{ONTOLOGY[d.ontology].glyph}</i>
        <span class="text"><span class="pt">{d.pt}</span><span class="en">{d.en}</span></span>
        <span class="bar-mini"
          ><i style:width="{litPct(d)}%" style:background={STATUS_COLOR[d.status]}></i></span>
        <span class="val">#{rank}</span>
      </div>
    {/each}
    <div class="group-label">
      Least confident · due<span class="group-hint">weakest first ↑</span>
    </div>
    {#each bottomLits as { d, rank }}
      <div class="lit">
        <i class="glyph" style:color={STATUS_COLOR[d.status]}>{ONTOLOGY[d.ontology].glyph}</i>
        <span class="text"><span class="pt">{d.pt}</span><span class="en">{d.en}</span></span>
        <span class="bar-mini"
          ><i style:width="{litPct(d)}%" style:background={STATUS_COLOR[d.status]}></i></span>
        <span class="val">#{rank}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .stat {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  h4 {
    margin: 0;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 20%, transparent);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--colors-skeleton-1-boundary);
  }
  .ranks {
    display: flex;
    flex-direction: column;
  }
  .group-label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs, 0.65rem);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-skeleton-1-boundary);
    margin: 0.9rem 0 0.3rem;
  }
  .group-label:first-child {
    margin-top: 0;
  }
  .group-hint {
    font-size: var(--font-size-2xs, 0.65rem);
    color: color-mix(in srgb, var(--colors-skeleton-1-boundary) 65%, transparent);
    text-transform: none;
    letter-spacing: 0.04em;
  }
  .lit {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.32rem 0;
  }
  .lit + .lit {
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 14%, transparent);
  }
  .lit .glyph {
    width: 16px;
    text-align: center;
    flex: 0 0 16px;
    font-style: normal;
    font-size: var(--font-size-sm);
  }
  .lit .text {
    min-width: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.5rem;
  }
  .lit .pt {
    flex: 0 0 auto;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--colors-skeleton-1-contrast);
    white-space: nowrap;
  }
  .lit .en {
    flex: 1 1 auto;
    min-width: 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lit .bar-mini {
    flex: 0 0 52px;
    height: 4px;
    border-radius: 3px;
    overflow: hidden;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 20%, transparent);
  }
  .lit .bar-mini > i {
    display: block;
    height: 100%;
  }
  .lit .val {
    flex: 0 0 auto;
    width: 2.2rem;
    text-align: right;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-variant-numeric: tabular-nums;
    color: var(--colors-skeleton-1-boundary);
  }
</style>
