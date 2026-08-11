<script>
  import { GAMEPLAYS } from "../engine.js";
  import Review from "./Review.svelte";

  const { game, prov, sets, view, literals, words, kind } = $props();

  // ── subject · what's loaded + where it came from ──────────────────────────────
  const GLYPH = { word: "●", sentence: "▬", conjugation: "◆" };
  const surfaceOf = (literal) => literal?.trait?.TRANSLATED?.learning ?? literal?.slug ?? "";
  const glossOf = (literal) => literal?.trait?.TRANSLATED?.known ?? "";
  const origin = {
    domain: "From your learning domain — weak literals, graded back to retention.",
    fixed: "A plain word list handed to the trainer.",
    corpus: "Pick a word source and a length.",
  }[kind];
  const tally = () => {
    const by = {};
    for (const literal of literals ?? []) by[literal.ontology] = (by[literal.ontology] ?? 0) + 1;
    return Object.entries(by)
      .map(([ontology, count]) => `${count} ${ontology}${count > 1 ? "s" : ""}`)
      .join("  ·  ");
  };

  // ── corpus sources as cards ───────────────────────────────────────────────────
  const wordCount = (set) => set.text.split(/\s+/).filter(Boolean).length;
  const short = (label) => label.replace(/\s*\(.*\)/, "");
  const sources = [
    ...sets.map((set) => ({ value: set.name, label: short(set.label), sub: `${wordCount(set)} words` })),
    { value: "custom", label: "Custom", sub: "your own" },
  ];

  // ── settings vocab ────────────────────────────────────────────────────────────
  const LENGTHS = [10, 20, 30, 50];
  const MODE_DESC = {
    PLAIN: "Mistakes are allowed — type through them.",
    SUDDENDEATH: "One wrong key ends the run.",
  };
  const gameplays = Object.keys(GAMEPLAYS);
  const set = (field, value) => (game.config[field] = value);
  const pctOf = (value, min, max) => (100 * (value - min)) / (max - min);
  const recallSeconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

  // length slider · logarithmic 1..128 — fine control down low, coarse up high. the
  // range carries a normalized log position [0..1]; the count is the rounded 2^ mapping.
  const COUNT_MIN = 1;
  const COUNT_MAX = 128;
  const LOG_MIN = Math.log2(COUNT_MIN);
  const LOG_SPAN = Math.log2(COUNT_MAX) - LOG_MIN; // 7 octaves
  const clampCount = (n) => Math.min(COUNT_MAX, Math.max(COUNT_MIN, n));
  const posToCount = (pos) => clampCount(Math.round(2 ** (LOG_MIN + pos * LOG_SPAN)));
  const countToPos = (count) => (Math.log2(clampCount(count)) - LOG_MIN) / LOG_SPAN;
</script>

<div class="home">
  <!-- ── results · same screen, after a run (typing analysis — domain-blind) ── -->
  {#if game.analysis}
    <section class="block">
      {@render head("Last run")}
      <Review {game} {view} />
    </section>
  {/if}
  <!-- ── source (corpus) · subject (domain/fixed) ── -->
  <section class="block">
    {#if kind === "corpus"}
      {@render head("Source")}
      <div class="cards">
        {#each sources as source}
          <button class="card" class:on={game.config.source === source.value} onclick={() => set("source", source.value)}>
            <span class="card-label">{source.label}</span>
            <span class="card-sub">{source.sub}</span>
          </button>
        {/each}
      </div>
      {#if game.config.source === "custom"}
        <textarea class="custom" rows="3" bind:value={game.config.custom} placeholder="paste words…"></textarea>
      {/if}
    {:else}
      {@render head("Subject")}
      <p class="origin">{origin}</p>
      {#if kind === "domain"}
        <div class="meta">{tally()}</div>
        <ul class="lits">
          {#each literals as literal}
            <li>
              <i class="glyph">{GLYPH[literal.ontology] ?? "•"}</i>
              <span class="pt">{surfaceOf(literal)}</span>
              <span class="en">{glossOf(literal)}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="meta">{(words ?? []).length} words</div>
        <p class="text">{(words ?? []).join(" ")}</p>
      {/if}
    {/if}
  </section>

  <!-- ── length (corpus + domain) ── -->
  {#if prov.settings.includes("count")}
    <section class="block">
      {@render head("Length", `${game.config.count} words`)}
      <div class="length-row">
        <div class="chips">
          {#each LENGTHS as length}
            <button class="chip" class:on={game.config.count === length} onclick={() => set("count", length)}>{length}</button>
          {/each}
        </div>
        <input
          class="slider"
          type="range"
          min="0"
          max="1"
          step="0.001"
          style:--fill="{100 * countToPos(game.config.count)}%"
          value={countToPos(game.config.count)}
          oninput={(event) => set("count", posToCount(+event.currentTarget.value))} />
      </div>
      {#if prov.settings.includes("order")}
        <div class="inline">
          <span class="inline-key">order</span>
          {@render seg("order", [{ value: "given", label: "as given" }, { value: "shuffle", label: "shuffle" }])}
        </div>
      {/if}
    </section>
  {/if}

  <!-- ── mode ── -->
  <section class="block">
    {@render head("Mode")}
    <div class="mode-row">
      {@render seg("gameplay", gameplays.map((g) => ({ value: g, label: g === "SUDDENDEATH" ? "Sudden death" : "Plain" })))}
      <span class="mode-desc">{MODE_DESC[game.config.gameplay]}</span>
    </div>
    <div class="inline">
      <span class="inline-key">forgive accents</span>
      {@render seg("forgiving", [{ value: "on", label: "on" }, { value: "off", label: "off" }])}
    </div>
  </section>

  <!-- ── scoring & feedback ── -->
  <section class="block">
    {@render head("Scoring & feedback")}
    <div class="dials">
      <div class="dial">
        <span class="dial-key">target wpm</span>
        <input class="slider" type="range" min="20" max="100" step="5" style:--fill="{pctOf(game.config.targetWpm, 20, 100)}%" bind:value={game.config.targetWpm} />
        <span class="dial-val">{game.config.targetWpm}</span>
      </div>
      <div class="dial">
        <span class="dial-key">recall window</span>
        <input class="slider" type="range" min="500" max="3000" step="250" style:--fill="{pctOf(game.config.recallMs, 500, 3000)}%" bind:value={game.config.recallMs} />
        <span class="dial-val">{recallSeconds(game.config.recallMs)}</span>
      </div>
    </div>
    <div class="inline">
      <span class="inline-key">layout</span>
      {@render seg("layout", [{ value: "block", label: "block" }, { value: "river", label: "river" }])}
    </div>
    <div class="inline">
      <span class="inline-key">live meter</span>
      {@render seg("live", [{ value: "shown", label: "shown" }, { value: "hidden", label: "hidden" }])}
    </div>
    {#if game.config.layout === "river" && prov.settings.includes("revealing")}
      <div class="inline">
        <span class="inline-key">reveal translation</span>
        {@render seg("revealing", [{ value: "on", label: "on" }, { value: "off", label: "off" }])}
      </div>
    {/if}
  </section>

</div>

{#snippet head(label, value)}
  <div class="head">
    <span class="head-label">{label}</span>
    <i class="head-rule"></i>
    {#if value}<span class="head-value">{value}</span>{/if}
  </div>
{/snippet}

{#snippet seg(field, options)}
  <div class="seg">
    {#each options as option}
      <button class="seg-btn" class:on={game.config[field] === option.value} onclick={() => set(field, option.value)}>
        {option.label}
      </button>
    {/each}
  </div>
{/snippet}

<style>
  .home {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* section header — teal label + rule + optional right value */
  .head {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }
  .head-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #1EBCB5;
    white-space: nowrap;
  }
  .head-rule {
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 30%, transparent);
  }
  .head-value {
    font-family: var(--font-family-code);
    font-size: var(--font-size-md, 0.875rem);
    font-weight: 700;
    color: var(--colors-skeleton-1-contrast);
    white-space: nowrap;
  }
  .head-value::after {
    content: "";
  }

  /* source cards */
  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding: 0.4rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 8%, transparent);
  }
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 1rem 0.75rem;
    border: none;
    border-radius: 0.55rem;
    background: transparent;
    cursor: pointer;
  }
  .card.on {
    background: #1EBCB5;
  }
  .card-label {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-md, 0.875rem);
    font-weight: 700;
    color: var(--colors-skeleton-1-contrast);
  }
  .card.on .card-label {
    color: #0F1C35;
  }
  .card-sub {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .card.on .card-sub {
    color: color-mix(in srgb, #0F1C35 70%, transparent);
  }
  .custom {
    width: 100%;
    box-sizing: border-box;
    padding: 0.6rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, transparent);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    outline: none;
    resize: none;
  }

  /* subject (domain / fixed) */
  .origin {
    margin: 0;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-md, 0.875rem);
    color: var(--colors-skeleton-1-boundary);
  }
  .meta {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .lits {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 1.5rem;
    max-height: 12rem;
    overflow-y: auto;
  }
  .lits li {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.3rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 12%, transparent);
  }
  .glyph {
    width: 14px;
    flex: 0 0 14px;
    text-align: center;
    font-style: normal;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .pt {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-md, 0.875rem);
    font-weight: 600;
    color: var(--colors-skeleton-1-contrast);
  }
  .en {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .text {
    margin: 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    line-height: 1.7;
    color: var(--colors-skeleton-1-contrast);
    max-height: 11rem;
    overflow-y: auto;
  }

  /* length */
  .length-row {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .chips {
    display: flex;
    gap: 0.4rem;
    flex: 0 0 auto;
  }
  .chip {
    min-width: 3rem;
    padding: 0.45rem 0.6rem;
    border-radius: 0.45rem;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 45%, transparent);
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    cursor: pointer;
  }
  .chip.on {
    border-color: #1EBCB5;
    color: #1EBCB5;
  }

  /* segmented control */
  .seg {
    display: inline-flex;
    flex: 0 0 auto;
    padding: 0.2rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 12%, transparent);
  }
  .seg-btn {
    padding: 0.4rem 0.95rem;
    border: none;
    border-radius: 0.4rem;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    cursor: pointer;
    white-space: nowrap;
  }
  .seg-btn.on {
    background: #1EBCB5;
    color: #0F1C35;
    font-weight: 600;
  }

  .mode-row {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .mode-desc {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-md, 0.875rem);
    color: var(--colors-skeleton-1-boundary);
  }
  .inline {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .inline-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    min-width: 8rem;
  }

  /* scoring dials */
  .dials {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .dial {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .dial-key {
    flex: 0 0 8rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .dial-val {
    flex: 0 0 3rem;
    text-align: right;
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    font-variant-numeric: tabular-nums;
    color: var(--colors-skeleton-1-contrast);
  }

  /* slider */
  .slider {
    flex: 1 1 auto;
    min-width: 0;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(
      90deg,
      #1EBCB5 0 var(--fill, 0%),
      color-mix(in srgb, var(--colors-skeleton-1-boundary) 35%, transparent) var(--fill, 0%) 100%
    );
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #e9eef4;
    border: none;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }
  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #e9eef4;
    border: none;
    cursor: pointer;
  }
</style>
