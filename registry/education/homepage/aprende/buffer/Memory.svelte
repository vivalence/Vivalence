<script>
  import { STATUS_COLOR } from "./palette.js";

  // the whole panel derives from `board` — one optimized read, folded here into counts.
  const { board = [] } = $props();

  const counts = $derived(
    board.reduce((tally, row) => ((tally[row.status] = (tally[row.status] || 0) + 1), tally), {
      UNTOUCHED: 0,
      UNKNOWN: 0,
      LEARNING: 0,
      KNOWN: 0,
      GRADUATED: 0,
    }),
  );
  // the three working buckets fill the blocks; UNTOUCHED / GRADUATED ride the footer.
  const BLOCKS = ["UNKNOWN", "LEARNING", "KNOWN"];
  const blockStatuses = $derived(BLOCKS.filter((s) => (counts[s] || 0) > 0));
  const blockTotal = $derived(BLOCKS.reduce((sum, s) => sum + (counts[s] || 0), 0));
  const pct = (status) => (blockTotal ? Math.round((100 * (counts[status] || 0)) / blockTotal) : 0);
</script>

<section class="stat">
  <h4>Memory per status</h4>
  <div class="legend">
    {#each blockStatuses as status}
      <span class="item"><i class="swatch" style:background={STATUS_COLOR[status]}></i>{status}</span>
    {/each}
  </div>
  <div class="blocks">
    {#each blockStatuses as status}
      <span
        class="block"
        style:flex="{counts[status]} 1 0"
        style:background="color-mix(in srgb, {STATUS_COLOR[status]} 78%, transparent)">
        <b>{counts[status]}</b>
        <em>{pct(status)}%</em>
      </span>
    {/each}
  </div>
  <div class="block-foot">
    <span>← untouched · {counts.UNTOUCHED || 0}</span>
    <span>graduated · {counts.GRADUATED || 0} →</span>
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
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.2rem;
  }
  .legend .item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex: 0 0 auto;
  }
  .blocks {
    display: flex;
    width: 100%;
    height: 52px;
    border-radius: 8px;
    overflow: hidden;
    gap: 2px;
  }
  .block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.05rem;
    height: 100%;
    min-width: 40px;
    color: #fff;
  }
  .block b {
    font-family: var(--font-family-code);
    font-size: var(--font-size-md, 0.875rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .block em {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs, 0.65rem);
    font-style: normal;
    opacity: 0.85;
  }
  .block-foot {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs, 0.65rem);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--colors-skeleton-1-boundary) 75%, transparent);
  }
</style>
