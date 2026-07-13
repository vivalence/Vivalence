<script>
  import { Canvas, stage } from "@vivalence/drapes";
  import reading from "../../../topographies/first-words-reading/dataset/literals/reading.js";
  import strands from "../../../topologies/curriculum/dataset/symbols/strands.js";
  import ages from "../../../topologies/curriculum/dataset/symbols/ages.js";
  import { buildOption, prereqsOf, strandOf, STRAND_COLOR } from "./graph.js";

  stage.use(stage.graph, stage.tooltip, stage.renderer);

  let chart;
  let selected = $state(null);
  let hidden = $state(new Set());

  const links = reading.reduce((total, concept) => total + prereqsOf(concept).length, 0);
  const strandLabel = new Map(strands.map((strand) => [strand.slug, strand.trait.LABELED.name]));
  const ageLabel = new Map(ages.map((age) => [age.slug, age.trait.LABELED.name]));
  const strandStats = strands.map((strand) => ({
    slug: strand.slug,
    name: strand.trait.LABELED.name,
    color: STRAND_COLOR[strand.slug],
    count: reading.filter((concept) => strandOf(concept) === strand.slug).length,
  }));

  const option = $derived(buildOption(reading, strands, { hidden, selected: selected?.slug ?? null }));

  function toggleStrand(slug) {
    const next = new Set(hidden);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    hidden = next;
  }

  function initGraph(container) {
    chart = stage.chart(container);
    chart.on("click", (params) => {
      if (params.dataType === "node") selected = params.data;
    });
    chart.getZr().on("click", (event) => {
      if (!event.target) selected = null;
    });
    chart.setOption(option);
    return {
      resize: () => chart.resize(),
      dispose: () => {
        chart.dispose();
        chart = null;
      },
    };
  }

  $effect(() => {
    if (chart) chart.setOption(option);
  });
</script>

<div class="atlas">
  <div class="stage-fill">
    <Canvas init={initGraph} />
  </div>

  <div class="masthead">
    <div class="eyebrow"><span class="dot" style="background:{STRAND_COLOR['strand.phonics']}"></span>FIRST WORDS → READING · AGES 4–7</div>
    <h1>Everything a<br />child learns.</h1>
    <p class="lede">{reading.length} concepts and {links} prerequisite links, from first sounds to reading.</p>
    <p class="hint"><b>Tap any dot</b> to see everything a learner must master before it.</p>
  </div>

  <div class="legend">
    <div class="legend-title">STRANDS · CLICK TO TOGGLE</div>
    {#each strandStats as strand}
      <button class="legend-row" class:off={hidden.has(strand.slug)} onclick={() => toggleStrand(strand.slug)}>
        <span class="legend-dot" style="background:{strand.color}"></span>
        <span class="legend-name">{strand.name}</span>
        <span class="legend-count">{strand.count}</span>
      </button>
    {/each}
  </div>

  {#if selected}
    <div class="detail">
      <div class="detail-top">
        <span class="detail-eyebrow">
          <span class="dot" style="background:{STRAND_COLOR[selected.strand]}"></span>
          {strandLabel.get(selected.strand)}{selected.age ? ` · ${ageLabel.get(selected.age)}` : ""}
        </span>
        <button class="detail-close" onclick={() => (selected = null)}>×</button>
      </div>
      <div class="detail-name">{selected.name}</div>
      <div class="detail-count"><span class="big">{selected.prereqCount}</span> prerequisites</div>
      <p class="detail-copy">Every concept a learner must master before this one, traced back to the start.</p>
      <p class="detail-desc">{selected.description}</p>
    </div>
  {/if}
</div>

<style>
  .atlas {
    position: relative;
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    background: radial-gradient(ellipse at 62% 42%, #14141f 0%, #0a0a12 62%, #050509 100%);
  }
  .stage-fill {
    position: absolute;
    inset: 0;
  }
  .masthead {
    position: absolute;
    left: 2.5rem;
    top: 2.25rem;
    max-width: 36%;
    pointer-events: none;
    z-index: 2;
  }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #8a8a9a;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
  }
  .dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  h1 {
    margin: 1.25rem 0 1rem;
    font-family: var(--font-family-serif-heading);
    font-size: clamp(2.5rem, 5vw, 4.75rem);
    line-height: 0.96;
    letter-spacing: -0.02em;
    color: #f4f4f8;
  }
  .lede {
    margin: 0 0 0.5rem;
    color: #b6b6c2;
    font-family: var(--font-family-serif-body);
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }
  .hint {
    margin: 0;
    color: #7c7c8c;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
  }
  .hint b {
    color: #c8c8d4;
  }
  .legend {
    position: absolute;
    left: 2.5rem;
    bottom: 2.25rem;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.75rem 0.9rem;
    background: rgba(12, 12, 20, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.5rem;
    backdrop-filter: blur(6px);
  }
  .legend-title {
    color: #6c6c7c;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    margin-bottom: 0.4rem;
  }
  .legend-row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.2rem 0.1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #d0d0da;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    transition: opacity 0.12s;
  }
  .legend-row.off {
    opacity: 0.35;
  }
  .legend-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .legend-name {
    flex: 1;
    text-align: left;
  }
  .legend-count {
    color: #6c6c7c;
  }
  .detail {
    position: absolute;
    right: 2rem;
    top: 2.25rem;
    width: 288px;
    z-index: 3;
    padding: 1rem 1.15rem 1.15rem;
    background: rgba(15, 15, 24, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 0.6rem;
    backdrop-filter: blur(10px);
  }
  .detail-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .detail-eyebrow {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: #9a9aa8;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .detail-close {
    border: none;
    background: transparent;
    color: #7c7c8c;
    font-size: var(--font-size-lg);
    line-height: 1;
    cursor: pointer;
    padding: 0;
  }
  .detail-name {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: #f2f2f6;
    line-height: 1.15;
    margin-bottom: 0.75rem;
  }
  .detail-count {
    color: #d8d8e2;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
  }
  .big {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-5xl);
    font-weight: 700;
    color: #ffffff;
    margin-right: 0.35rem;
  }
  .detail-copy {
    margin: 0.5rem 0 0.85rem;
    color: #8a8a98;
    font-family: var(--font-family-serif-body);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }
  .detail-desc {
    margin: 0;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: #c2c2ce;
    font-family: var(--font-family-serif-body);
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }
</style>
