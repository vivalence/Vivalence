<script>
  import { Canvas, stage } from "@vivalence/drapes";
  import { DIVES, LANES, ORDERS, ascending, groupBy, speedline } from "../engine.js";

  stage.use(stage.line, stage.scatter, stage.grid, stage.tooltip, stage.legend, stage.renderer);

  const { game, view } = $props();

  const tint = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  const LANE_COLOR = {
    recall: tint("--colors-theme-accent-contrast"),
    spelling: tint("--colors-system-warning-contrast"),
    motor: tint("--colors-system-error-contrast"),
    clean: tint("--colors-system-success-contrast"),
  };

  const speedOptions = $derived.by(() => {
    const line = speedline(view, game.resolution);
    const boundary = tint("--colors-skeleton-1-boundary");
    const axis = {
      type: "value",
      axisLabel: { fontSize: 9, fontFamily: "monospace", color: boundary },
      axisLine: { lineStyle: { color: boundary } },
      splitLine: { lineStyle: { color: boundary, opacity: 0.15 } },
    };
    return {
      grid: { left: 40, right: 12, top: 30, bottom: 28 },
      legend: {
        top: 0,
        right: 8,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: boundary, fontSize: 10, fontFamily: "monospace" },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(20,20,30,0.9)",
        borderColor: boundary,
        textStyle: { color: "#ccc", fontSize: 11, fontFamily: "monospace" },
        formatter: (params) =>
          params.seriesType === "scatter"
            ? `<b>${params.data.word}</b><br/>${params.value[1]} wpm · ${params.data.lane}`
            : `${params.value[1]} wpm`,
      },
      xAxis: { ...axis, name: "s", max: "dataMax" },
      yAxis: { ...axis, name: "wpm" },
      series: [
        {
          name: `rolling ·${game.resolution}`,
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: tint("--colors-theme-primary-contrast") },
          itemStyle: { color: tint("--colors-theme-primary-contrast") },
          areaStyle: { color: tint("--colors-theme-primary-contrast"), opacity: 0.07 },
          data: line.map((point) => [+point.seconds.toFixed(1), point.wpm | 0]),
        },
        ...LANES.map((lane) => ({
          name: lane,
          type: "scatter",
          symbolSize: 7,
          itemStyle: { color: LANE_COLOR[lane] },
          data: game.analysis.tempo
            .filter((bar) => bar.label === lane)
            .map((bar) => ({
              value: [+bar.seconds.toFixed(1), bar.wpm | 0],
              word: bar.target,
              lane: bar.label,
            })),
        })),
      ],
    };
  });

  function initSpeed(container) {
    const instance = stage.chart(container);
    instance.setOption(speedOptions);
    return { resize: () => instance.resize(), dispose: () => instance.dispose() };
  }

  const review = $derived.by(() => {
    const analysis = game.analysis;
    const groups = groupBy(analysis.attempts, (attempt) => attempt.label);
    const total = analysis.attempts.reduce((sum, attempt) => sum + (attempt.spent ?? 0), 0);
    const spine = LANES.map((lane) => ({
      lane,
      count: groups[lane]?.length ?? 0,
      width:
        (100 * (groups[lane]?.reduce((sum, attempt) => sum + attempt.spent, 0) ?? 0)) /
        Math.max(1, total),
    }));
    const words = [...analysis.attempts].sort(
      ascending((attempt) => LANES.indexOf(attempt.label)),
    );
    const rows = [...(analysis.units[game.unit] ?? [])]
      .sort(ascending(ORDERS[game.order]))
      .slice(0, 10);
    return { spine, words, rows };
  });

  const confidenceClass = (confidence) => (confidence >= 1 ? "g" : confidence >= 0.7 ? "y" : "r");
</script>

<div class="glance">
  <div class="digit hero">
    <span class="value">{game.analysis.net.toFixed(1)}</span>
    <span class="label">net wpm</span>
  </div>
  <div class="digit">
    <span class="value">{(100 * game.analysis.accuracy).toFixed(1)}%</span>
    <span class="label">accuracy</span>
  </div>
  <div class="digit">
    <span class="value">{game.analysis.consistency.toFixed(0)}</span>
    <span class="label">consistency</span>
  </div>
  <div class="digit">
    <span class="value ok">{game.analysis.peak ? game.analysis.peak.best | 0 : "–"}</span>
    <span class="label">peak</span>
  </div>
</div>
<div class="subline">
  raw {game.analysis.raw.toFixed(1)} · C{game.analysis.C} IF{game.analysis.IF} INF{game.analysis
    .INF}
  {#if game.analysis.peak}· floor {game.analysis.peak.worst | 0}{/if}
  {#if game.analysis.backspaces}· backspaces {game.analysis.backspaces}{/if}
  {#if game.analysis.accents}· accents {game.analysis.accents}{/if}
</div>

<div class="spine">
  {#each review.spine as segment}
    {#if segment.width > 0}
      <div class="spine-seg lane-{segment.lane}-bg" style:width="{segment.width}%"></div>
    {/if}
  {/each}
</div>
<div class="counts">
  {#each review.spine as segment}
    <span class="lane-{segment.lane}">{segment.lane} <span class="dim">{segment.count}</span></span>
  {/each}
</div>

<div class="dives-head">
  {#each DIVES as dive}
    <button class="chip" class:on={game.dive === dive} onclick={() => (game.dive = dive)}>
      {dive}
    </button>
  {/each}
  {#if game.dive === "graph"}
    <span class="sort">
      <span class="dim">avg over</span>
      {#each [5, 10, 20] as window}
        <button
          class="link"
          class:on={game.resolution === window}
          onclick={() => (game.resolution = window)}>{window}</button>
      {/each}
      <span class="dim">strikes</span>
    </span>
  {:else if game.dive === "units"}
    <span class="unit-picks">
      {#each Object.keys(game.analysis.units) as kind, index}
        <button class="chip" class:on={game.unit === kind} onclick={() => (game.unit = kind)}>
          <span class="dim">{index + 1}</span>{kind}
        </button>
      {/each}
    </span>
    <span class="sort">
      <span class="dim">sort</span>
      {#each Object.keys(ORDERS) as order}
        <button class="link" class:on={game.order === order} onclick={() => (game.order = order)}
          >{order}</button>
      {/each}
    </span>
  {/if}
</div>

{#if game.dive === "graph"}
  <div class="speed">
    {#key game.resolution}
      <Canvas init={initSpeed} />
    {/key}
  </div>
{:else if game.dive === "words"}
  <div class="wtable">
    <div class="wrow whead">
      <span>word</span><span>lane</span><span>onset</span><span>iki</span><span>evidence</span>
    </div>
    {#each review.words as attempt}
      <div class="wrow">
        <span class="strong">{attempt.target}</span>
        <span class="lane-{attempt.label}">{attempt.label}</span>
        <span class="dim">{(attempt.onset / 1000).toFixed(1)}s</span>
        <span class="dim">{attempt.median | 0}</span>
        <span class="dim">{[...attempt.spelling, ...attempt.motor].join(" ")}</span>
      </div>
    {/each}
  </div>
{:else}
  <div class="utable">
    <div class="urow uhead">
      <span>unit</span>
      <span class="num">ms</span>
      <span class="num">×n</span>
      <span class="num">err</span>
      <span class="num">±cv</span>
      <span class="num">dmg</span>
      <span class="conf-h">conf</span>
    </div>
    {#each review.rows as unit}
      <div class="urow" class:thin={unit.count < 3}>
        <span class="strong">{unit.unit}</span>
        <span class="num">{unit.median == null ? "–" : unit.median | 0}</span>
        <span class="num dim">{unit.count}</span>
        <span class="num" class:warn={unit.error}
          >{unit.error ? `${(100 * unit.error) | 0}%` : "–"}</span>
        <span class="num dim">{unit.variation ? unit.variation.toFixed(2) : "–"}</span>
        <span class="num" class:strong={unit.damage >= 1}
          >{unit.damage ? unit.damage.toFixed(1) : "–"}</span>
        <span class="conf">
          <span class="conf-bar">
            <span
              class="conf-fill {confidenceClass(unit.confidence)}-bg"
              style:width="{Math.min(100, unit.confidence * 100)}%"></span>
          </span>
        </span>
      </div>
    {/each}
    {#if !review.rows.length}<div class="empty-row">no samples this run</div>{/if}
  </div>
  {#if review.rows.some((unit) => unit.count < 3)}
    <div class="hint thin-note">dimmed: fewer than 3 samples — thin evidence</div>
  {/if}
  <div class="trans">
    <span class="dim">transitions</span>
    {#each game.analysis.transitions as transition}
      <span>{transition.kind} <strong>{transition.median | 0}</strong>×{transition.count}</span>
    {/each}
  </div>
{/if}

<style>
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--colors-skeleton-1-contrast);
    margin: 0 0 1.25rem 0;
  }
  .dim {
    color: var(--colors-skeleton-1-boundary);
    font-weight: 400;
  }
  .strong {
    color: var(--colors-skeleton-1-contrast);
  }
  .ok {
    color: var(--colors-system-success-contrast);
  }
  .warn {
    color: var(--colors-system-warning-contrast);
  }

  /* glance */
  .glance {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }
  .digit {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 1rem;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 40%, transparent);
    border-radius: 0.5rem;
  }
  .digit .value {
    font-family: var(--font-family-code);
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--colors-skeleton-1-contrast);
    font-variant-numeric: tabular-nums;
  }
  .digit.hero .value {
    color: var(--colors-theme-primary-contrast);
  }
  .digit .label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-1-boundary);
  }
  .subline {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    margin-bottom: 1rem;
  }

  .spine {
    display: flex;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.6rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 25%, transparent);
  }
  .spine-seg {
    height: 100%;
  }
  .counts {
    display: flex;
    gap: 0.9rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    margin-bottom: 1.5rem;
  }

  /* dives */
  .dives-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    margin-bottom: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 25%, transparent);
  }
  .unit-picks {
    display: flex;
    gap: 0.4rem;
    margin-left: 1rem;
  }
  .sort {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .chip {
    padding: 0.15rem 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.25rem;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }
  .chip .dim {
    margin-right: 0.3rem;
    opacity: 0.6;
  }
  .chip.on {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }
  .link {
    background: none;
    border: none;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    cursor: pointer;
    padding: 0;
  }
  .link.on {
    color: var(--colors-skeleton-1-contrast);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .speed {
    height: 13rem;
  }

  .wtable {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    max-height: 18rem;
    overflow-y: auto;
  }
  .wrow {
    display: grid;
    grid-template-columns: minmax(5rem, 1fr) 5rem 4rem 4rem 1.5fr;
    column-gap: 0.75rem;
    padding: 0.15rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 15%, transparent);
  }
  .wrow.whead {
    color: var(--colors-skeleton-1-boundary);
    border-bottom-color: var(--colors-skeleton-1-boundary);
    padding-bottom: 0.25rem;
  }

  .utable {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    max-height: 18rem;
    overflow-y: auto;
    font-variant-numeric: tabular-nums;
  }
  .urow {
    display: grid;
    grid-template-columns: minmax(4rem, 1.2fr) 4rem 3rem 3.5rem 3.5rem 3.5rem 5.5rem;
    column-gap: 0.75rem;
    align-items: center;
    padding: 0.3rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 15%, transparent);
    color: var(--colors-skeleton-1-contrast);
  }
  .urow.uhead {
    color: var(--colors-skeleton-1-boundary);
    border-bottom-color: var(--colors-skeleton-1-boundary);
    padding-bottom: 0.25rem;
  }
  .urow.thin {
    color: var(--colors-skeleton-1-boundary);
  }
  .urow .num {
    text-align: right;
  }
  .urow .strong,
  .wrow .strong {
    color: var(--colors-skeleton-1-contrast);
  }
  .urow.thin .strong {
    color: var(--colors-skeleton-1-boundary);
  }
  .conf-h {
    padding-left: 0.75rem;
  }
  .conf {
    padding-left: 0.75rem;
    display: flex;
    align-items: center;
  }
  .conf-bar {
    height: 4px;
    width: 4rem;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 30%, transparent);
  }
  .conf-fill {
    display: block;
    height: 100%;
  }
  .empty-row {
    padding: 0.5rem 0;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
  }
  .hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .thin-note {
    margin: 0.25rem 0 0 0;
  }

  .trans {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.25rem;
    color: var(--colors-skeleton-1-contrast);
    margin-top: 1.25rem;
  }
  .trans strong {
    color: var(--colors-theme-primary-contrast);
  }

  /* lane tints */
  .lane-recall {
    color: var(--colors-theme-accent-contrast);
  }
  .lane-spelling {
    color: var(--colors-system-warning-contrast);
  }
  .lane-motor {
    color: var(--colors-system-error-contrast);
  }
  .lane-clean {
    color: var(--colors-system-success-contrast);
  }
  .lane-recall-bg {
    background: var(--colors-theme-accent-contrast);
  }
  .lane-spelling-bg {
    background: var(--colors-system-warning-contrast);
  }
  .lane-motor-bg {
    background: var(--colors-system-error-contrast);
  }
  .lane-clean-bg {
    background: var(--colors-system-success-contrast);
  }
  .g-bg {
    background: var(--colors-system-success-contrast);
  }
  .y-bg {
    background: var(--colors-system-warning-contrast);
  }
  .r-bg {
    background: var(--colors-system-error-contrast);
  }
</style>
