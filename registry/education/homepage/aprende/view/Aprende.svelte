<script>
  import { Section, Canvas, stage } from "@vivalence/drapes";
  import Helpdesk from "./Helpdesk.svelte";

  stage.use(
    stage.scatter,
    stage.tooltip,
    stage.legend,
    stage.grid,
    stage.markLine,
    stage.markArea,
    stage.dataZoom,
    stage.renderer,
  );

  const { terminal, buffer } = $props();
  const daemon = terminal.daemon;

  const STATUS = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];
  const STATUS_COLOR = {
    UNTOUCHED: "#3b3b3b",
    UNKNOWN: "#6b5b73",
    LEARNING: "#c4a35a",
    KNOWN: "#5b8c5a",
    GRADUATED: "#3a7ca5",
  };
  const DUE = "#c4715a";
  const MUTED = "#8b8b93";
  const TEAL = "#1EBCB5";
  // ontology → glyph (legend / list) + echarts symbol + size
  const ONTOLOGY = {
    word: { glyph: "●", symbol: "circle", size: 9 },
    sentence: { glyph: "▬", symbol: "rect", size: 10.5 },
    conjugation: { glyph: "◆", symbol: "diamond", size: 15 },
  };

  // ── ONE optimized read · the whole board ─────────────────────────────
  // every panel below derives from `board` — bar, scatter, and ranks can never
  // disagree because there is exactly one source. streak still rides statistics
  // (it folds trace-days, not literal rows).
  let board = $state([]);
  let streak = $state(0);
  // the mode owns a connection scoped to its aperture mount (mode/mode.js wires
  // entity.call = connection.branch("/daemon/<slug>/mode/<type>/<slug>")), so the
  // EXPOSED nature is called bare — no hand-assembled daemon path.
  daemon.modes?.homepage?.aprende
    ?.call("/assistant/wakeup/board", {})
    ?.then((rows) => (board = rows ?? []))
    ?.catch((error) => console.warn("[aprende] board failed", error));
  daemon.modes?.homepage?.aprende
    ?.call("/assistant/wakeup/statistics", {})
    ?.then((stats) => (streak = stats.activity.streak))
    ?.catch((error) => console.warn("[aprende] statistics failed", error));

  // ── stat 1 · memory per status — counts folded from the SAME board ──────
  const counts = $derived(
    board.reduce(
      (tally, row) => ((tally[row.status] = (tally[row.status] || 0) + 1), tally),
      { UNTOUCHED: 0, UNKNOWN: 0, LEARNING: 0, KNOWN: 0, GRADUATED: 0 },
    ),
  );
  // the three working buckets fill the blocks; UNTOUCHED / GRADUATED ride the footer.
  const BLOCKS = ["UNKNOWN", "LEARNING", "KNOWN"];
  const blockStatuses = $derived(BLOCKS.filter((s) => (counts[s] || 0) > 0));
  const blockTotal = $derived(BLOCKS.reduce((sum, s) => sum + (counts[s] || 0), 0));
  const pct = (status) => (blockTotal ? Math.round((100 * (counts[status] || 0)) / blockTotal) : 0);
  const cap = (status) => status[0] + status.slice(1).toLowerCase();

  // symlog so the Y axis is log yet still spans now-line (0) and overdue (negative).
  const symlog = (days) => Math.sign(days) * Math.log10(1 + Math.abs(days));
  const unsymlog = (value) => Math.sign(value) * (10 ** Math.abs(value) - 1);

  // one formatter per axis, shared by ticks AND the crosshair — so the hover label
  // can never drift from the displayed scale. Y lives in symlog(days); show days.
  const fmtDays = (value) => {
    const days = Math.round(unsymlog(value));
    return days === 0 ? "now" : `${days > 0 ? "+" : ""}${days}d`;
  };
  const fmtConf = (value) => {
    if (value >= 1) return "1";
    const s = String(Number(value).toPrecision(1));
    return `·${s.split(".")[1] ?? s}`;
  };

  // Y bounds derived from the data, not hardcoded — overdue items can run weeks past
  // any fixed floor (a stale conjugation 60+ days due would clip off-chart otherwise).
  // Bounds + margin live in SYMLOG space so the padding is visually even at any scale.
  const MARGIN = 0.3; // symlog units of breathing room each end
  const dueSym = $derived(
    board.filter((row) => row.seen).map((row) => symlog(row.nextDays)),
  );
  // the TIME axis bounds (now the X axis after the flip).
  const timeLo = $derived(Math.min(symlog(-7), ...(dueSym.length ? dueSym : [0])) - MARGIN);
  const timeHi = $derived(Math.max(symlog(20), ...(dueSym.length ? dueSym : [0])) + MARGIN);

  // ── stat 2 · strength × due — one series per ontology, derived from the board ──
  const scatterSeries = $derived.by(() => {
    const series = Object.entries(ONTOLOGY).map(([ontology, spec]) => ({
      name: ontology,
      type: "scatter",
      symbol: spec.symbol,
      symbolSize: spec.size,
      cursor: "pointer",
      emphasis: { scale: 1.9, focus: "series" },
      blur: { itemStyle: { opacity: 0.12 } },
      data: board
        .filter((row) => row.ontology === ontology && row.seen)
        .map((row) => ({
          // X = time-to-review (symlog days) · Y = confidence (log strength)
          value: [symlog(row.nextDays), Math.max(row.strength, 1e-4)],
          itemStyle: {
            color: STATUS_COLOR[row.status],
            opacity: 0.45 + (0.55 * (Math.log10(Math.max(row.strength, 1e-4)) + 4)) / 4,
          },
          meta: row,
        })),
    }));
    // now-line (vertical at x=0) + overdue wash (everything left of now) ride series 0.
    series[0].markLine = {
      silent: true,
      symbol: "none",
      label: { show: true, formatter: "now", position: "insideEndTop", color: DUE, fontSize: 11 },
      lineStyle: { color: DUE, type: "dashed", width: 1.2 },
      data: [{ xAxis: 0 }],
    };
    series[0].markArea = {
      silent: true,
      itemStyle: { color: DUE, opacity: 0.07 },
      data: [[{ xAxis: symlog(-1e4) }, { xAxis: 0 }]],
    };
    return series;
  });

  const scatterOption = $derived({
    animationDuration: 700,
    animationEasing: "cubicOut",
    grid: { left: 62, right: 54, top: 42, bottom: 72 },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(18,22,31,0.96)",
      borderColor: "rgba(255,255,255,0.14)",
      borderWidth: 1,
      padding: [9, 13],
      textStyle: { color: "#dfe3ea", fontSize: 13 },
      axisPointer: { type: "cross", lineStyle: { color: MUTED, opacity: 0.45, type: "dashed" }, label: { backgroundColor: "#2a2f3a" } },
      formatter: (p) => {
        const d = p.data.meta;
        const due = d.nextDays < 0 ? `due ${Math.round(-d.nextDays)}d ago` : `due in ${Math.round(d.nextDays)}d`;
        const conf = d.strength >= 0.1 ? `${Math.round(d.strength * 100)}%` : `${(d.strength * 100).toFixed(1)}%`;
        return `<b style="font-size:14px">${d.pt}</b> <span style="opacity:.55">${d.en}</span><br/>`
          + `<span style="color:${STATUS_COLOR[d.status]}">●</span> ${d.status.toLowerCase()} · ${d.ontology} · ${conf} confident · ${due}`;
      },
    },
    legend: { top: 4, textStyle: { color: MUTED, fontSize: 13 }, itemWidth: 16, itemHeight: 12, itemGap: 24 },
    // wheel zooms BOTH axes (cursor-anchored); drag pans. filterMode:"none" rescales the
    // window WITHOUT dropping points or the now-line/overdue wash. minSpan stops sub-pixel
    // zoom-in; the inside zoom clamps pan to the data. Double-click resets (wired below).
    dataZoom: [
      // pinch ZOOMS (ctrl+wheel); drag pans. two-finger scroll-pan is handled manually
      // below (echarts moveOnMouseWheel couples both axes to one delta — wrong).
      { type: "inside", xAxisIndex: 0, filterMode: "none", zoomOnMouseWheel: "ctrl", moveOnMouseWheel: false, moveOnMouseMove: true, minSpan: 1 },
      { type: "inside", yAxisIndex: 0, filterMode: "none", zoomOnMouseWheel: "ctrl", moveOnMouseWheel: false, moveOnMouseMove: true, minSpan: 1 },
      // slider rails — grab a handle to frame an edge band precisely (brushSelect: drag a
      // box on the rail to set the window directly). This is what makes corner clusters easy.
      {
        type: "slider", xAxisIndex: 0, filterMode: "none", bottom: 6, height: 12, minSpan: 1,
        brushSelect: true, showDetail: false,
        backgroundColor: "transparent", borderColor: "transparent",
        fillerColor: "rgba(120,130,150,0.14)",
        dataBackground: { lineStyle: { color: MUTED, opacity: 0.25 }, areaStyle: { color: MUTED, opacity: 0.05 } },
        selectedDataBackground: { lineStyle: { color: MUTED, opacity: 0.5 }, areaStyle: { color: MUTED, opacity: 0.12 } },
        handleStyle: { color: "#2a2f3a", borderColor: MUTED }, moveHandleStyle: { color: MUTED, opacity: 0.35 },
      },
      {
        type: "slider", yAxisIndex: 0, filterMode: "none", right: 6, width: 12, minSpan: 1,
        brushSelect: true, showDetail: false,
        backgroundColor: "transparent", borderColor: "transparent",
        fillerColor: "rgba(120,130,150,0.14)",
        dataBackground: { lineStyle: { color: MUTED, opacity: 0.25 }, areaStyle: { color: MUTED, opacity: 0.05 } },
        selectedDataBackground: { lineStyle: { color: MUTED, opacity: 0.5 }, areaStyle: { color: MUTED, opacity: 0.12 } },
        handleStyle: { color: "#2a2f3a", borderColor: MUTED }, moveHandleStyle: { color: MUTED, opacity: 0.35 },
      },
    ],
    // X · time-to-review (symlog days) — overdue left of `now`, scheduled right.
    xAxis: {
      type: "value",
      name: "← overdue   ·   time to review   ·   ahead →",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: MUTED, fontSize: 12 },
      min: timeLo,
      max: timeHi,
      splitNumber: 6,
      axisLabel: { color: MUTED, fontSize: 11, formatter: fmtDays },
      axisLine: { lineStyle: { color: MUTED, opacity: 0.4 } },
      splitLine: { show: true, lineStyle: { color: MUTED, opacity: 0.06 } },
      // axis is symlog(days); crosshair shows DAYS, not the raw symlog value
      axisPointer: { label: { formatter: (p) => fmtDays(p.value) } },
    },
    // Y · confidence (log strength) — weak at the bottom, strong at the top.
    yAxis: {
      type: "log",
      name: "confidence ↑",
      nameLocation: "middle",
      nameGap: 48,
      nameTextStyle: { color: MUTED, fontSize: 12 },
      // padded a half-decade past the data clamp so the weak-pile (1e-4) and the strong
      // items (≈1) lift off the boundary — leaves room to hover-zoom the edge bands.
      min: 3e-5,
      max: 1.6,
      axisLabel: { color: MUTED, fontSize: 11, formatter: fmtConf },
      axisLine: { lineStyle: { color: MUTED, opacity: 0.4 } },
      splitLine: { lineStyle: { color: MUTED, opacity: 0.1 } },
      axisPointer: { label: { formatter: (p) => fmtConf(p.value) } }, // crosshair label = same unit as ticks
    },
    series: scatterSeries,
  });

  // capture the echarts instance so the async board (→ scatterOption) re-feeds it.
  let chart = null;
  function initScatter(container) {
    chart = stage.chart(container);
    chart.setOption(scatterOption);

    // window state as percentages [0..100] per axis. dataZoom indices: 0 = inside-x, 1 = inside-y.
    const zoom = { x: { start: 0, end: 100 }, y: { start: 0, end: 100 } };
    const shift = (axis, delta) => {
      let { start, end } = axis;
      start += delta;
      end += delta;
      if (start < 0) (end -= start), (start = 0);
      if (end > 100) (start -= end - 100), (end = 100);
      axis.start = Math.max(0, start);
      axis.end = Math.min(100, end);
    };

    // two-finger scroll → INDEPENDENT x/y pan. deltaX moves the time window, deltaY the
    // confidence window, each scaled to its own visible span so the pan tracks the cursor 1:1.
    const onWheel = (event) => {
      if (event.ctrlKey) return; // pinch → echarts handles zoom (zoomOnMouseWheel:"ctrl")
      event.preventDefault();
      const { width, height } = container.getBoundingClientRect();
      shift(zoom.x, (event.deltaX / width) * (zoom.x.end - zoom.x.start)); // scroll right → pan right
      shift(zoom.y, (-event.deltaY / height) * (zoom.y.end - zoom.y.start)); // scroll down → reveal lower
      chart.dispatchAction({ type: "dataZoom", xAxisIndex: 0, start: zoom.x.start, end: zoom.x.end });
      chart.dispatchAction({ type: "dataZoom", yAxisIndex: 0, start: zoom.y.start, end: zoom.y.end });
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    // resync local state whenever the window changes by any OTHER means (pinch, slider, drag, reset).
    chart.on("datazoom", () => {
      const dz = chart.getOption().dataZoom;
      if (dz[0]) zoom.x = { start: dz[0].start, end: dz[0].end };
      if (dz[1]) zoom.y = { start: dz[1].start, end: dz[1].end };
    });

    // double-click resets every axis to the full data window.
    chart.getZr().on("dblclick", () => chart?.dispatchAction({ type: "dataZoom", start: 0, end: 100 }));

    return {
      resize: () => chart?.resize(),
      dispose: () => {
        container.removeEventListener("wheel", onWheel);
        chart?.dispose();
        chart = null;
      },
    };
  }
  $effect(() => {
    chart?.setOption(scatterOption);
  });

  // ── stat 3 · weakest & strongest (6 + 6, weakest-first in the due group) ──
  const seenLits = $derived(board.filter((row) => row.seen));
  const sorted = $derived([...seenLits].sort((a, b) => b.strength - a.strength));
  const N = $derived(sorted.length);
  const topLits = $derived(sorted.slice(0, 6).map((d, i) => ({ d, rank: i + 1 })));
  // weakest first: the tail reversed, so #N (the very weakest) leads.
  const bottomLits = $derived(sorted.slice(-6).map((d, i) => ({ d, rank: N - 5 + i })).reverse());
  const litPct = (d) => Math.round((100 * (Math.log10(Math.max(d.strength, 1e-3)) + 3)) / 3);

  // ── center row · actions ──────────────────────────────────────────────
  // direct navigation (spawner pattern): fire one of this mode's emitters, which
  // pools one-or-more game buffers into this thread, then render the first. quitting
  // the exercise releases its buffer and drops back through the deck to this hub view.
  async function runAction(route, input) {
    // thread binds the emitted buffers to this thread (daemon emitter trait sets
    // buffer.thread only when ctx.input.thread is present) → they join $buffers.
    // capture the prior set so we can jump to the first freshly-emitted buffer,
    // whatever game mode produced it (drill emits a mixed deck; riddle emits one).
    const before = new Set(terminal.thread.$buffers.get().map((b) => b.id));
    await buffer.mode.emit[route]({ ...input, thread: terminal.thread.id });
    const fresh = terminal.thread.$buffers.get().find((b) => !before.has(b.id));
    if (fresh) terminal.buffer = fresh;
  }
  const actions = [
    { name: "Activation", cmd: "/activation", accent: TEAL, blurb: "Type your weakest words — graded to memory.", run: () => runAction("activation", { ontology: "word", count: 20 }) },
    { name: "Drill", cmd: "/drill", accent: "#5b9bd5", blurb: "Due review — each word its own exercise, picked by how you know it.", run: () => runAction("drill", { count: 20 }) },
    { name: "Riddler", cmd: "/riddle", accent: "#8b95d6", blurb: "Solve a riddle the tutor spins from your weakest words.", run: () => runAction("riddle", { count: 2 }) },
  ];

  // ── help desk · tutor ── (TODO: wire to the HARNESSED /turn aperture — activation-loop quest TODO 5)
  async function askTutor(text) {
    console.log("[aprende] helpdesk →", text);
    return null;
  }
</script>

<div class="aprende">
  <!-- ── help desk · tutor only ── -->
  <section class="desk">
    <Section label="Help desk" action={deskHint} />
    {#snippet deskHint()}<span class="desk-hint">click to chat with your tutor</span>{/snippet}
    <Helpdesk onsend={askTutor} />
  </section>

  <!-- ── actions ── -->
  <section class="act">
    <Section label="Actions" />
    <div class="tiles">
      {#each actions as action}
        <button class="tile" style:--accent={action.accent} onclick={action.run}>
          <i class="tile-pip"></i>
          <span class="tile-name">{action.name}</span>
          <span class="tile-blurb">{action.blurb}</span>
          <span class="tile-cmd">{action.cmd}</span>
          <span class="tile-arrow">→</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- ── stats · memory + ranks (left) · scatter (right) ── -->
  <div class="stats-row">
    <!-- stat 1 · memory per status (real) -->
    <section class="stat stat-memory">
      <h4>Memory per status</h4>
      <div class="legend">
        {#each blockStatuses as status}
          <span class="item"><i class="swatch" style:background={STATUS_COLOR[status]}></i>{status}</span>
        {/each}
      </div>
      <div class="blocks">
        {#each blockStatuses as status}
          <span class="block" style:flex="{counts[status]} 1 0" style:background="color-mix(in srgb, {STATUS_COLOR[status]} 78%, transparent)">
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

    <!-- stat 2 · strength × due (dummy data, drapes stage / echarts) -->
    <section class="stat stat-scatter">
      <h4>Activity</h4>
      <div class="streak-card" title="{streak}-day streak">
        <span class="streak-num">{streak}<i class="streak-dot"></i></span>
        <div class="streak-text">
          <span class="streak-cap">Day streak</span>
          <span class="streak-sub">keep it lit · come back tomorrow</span>
        </div>
      </div>
      <h4>Strength × due</h4>
      <div class="chart"><Canvas init={initScatter} /></div>
    </section>

    <!-- stat 3 · weakest & strongest (dummy) -->
    <section class="stat stat-ranks">
      <h4>Weakest &amp; strongest</h4>
      <div class="ranks">
        <div class="group-label">Most confident<span class="group-hint">{N} scored ↓</span></div>
        {#each topLits as { d, rank }}
          <div class="lit">
            <i class="glyph" style:color={STATUS_COLOR[d.status]}>{ONTOLOGY[d.ontology].glyph}</i>
            <span class="text"><span class="pt">{d.pt}</span><span class="en">{d.en}</span></span>
            <span class="bar-mini"><i style:width="{litPct(d)}%" style:background={STATUS_COLOR[d.status]}></i></span>
            <span class="val">#{rank}</span>
          </div>
        {/each}
        <div class="group-label">Least confident · due<span class="group-hint">weakest first ↑</span></div>
        {#each bottomLits as { d, rank }}
          <div class="lit">
            <i class="glyph" style:color={STATUS_COLOR[d.status]}>{ONTOLOGY[d.ontology].glyph}</i>
            <span class="text"><span class="pt">{d.pt}</span><span class="en">{d.en}</span></span>
            <span class="bar-mini"><i style:width="{litPct(d)}%" style:background={STATUS_COLOR[d.status]}></i></span>
            <span class="val">#{rank}</span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .aprende {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    height: 100%;
    padding: 1.4rem 1.6rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .desk-hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }

  /* ── help desk · cards ── */
  .desk {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  /* streak — gold dopamine anchor, badged under the Activity chrome */
  .streak-card {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 0.9rem;
    min-width: 0;
    padding: 0.7rem 1.1rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, #E7C271 28%, transparent);
    background: color-mix(in srgb, #E7C271 6%, transparent);
  }
  .streak-num {
    position: relative;
    font-family: var(--font-family-serif-heading);
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 0.85;
    color: #E7C271;
    text-shadow: 0 0 18px color-mix(in srgb, #E7C271 38%, transparent);
    padding-right: 0.35rem;
  }
  .streak-dot {
    position: absolute;
    bottom: 0.12rem;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background: #E7C271;
  }
  .streak-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .streak-cap {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs, 0.65rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #E7C271;
  }
  .streak-sub {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
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

  /* ── actions — wide tinted tiles, command chip + arrow ── */
  .tiles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
    margin-top: 0.6rem;
  }
  @container (max-width: 720px) {
    .tiles { grid-template-columns: 1fr; }
  }
  .tile {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
    padding: 0.8rem 1rem;
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    border-left: 3px solid var(--accent);
    border-radius: 0.7rem;
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    cursor: pointer;
    text-align: left;
    transition: transform 0.12s, border-color 0.2s, background 0.2s;
  }
  .tile:hover {
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  }
  .tile-pip {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    flex: 0 0 auto;
    box-shadow: 0 0 7px color-mix(in srgb, var(--accent) 60%, transparent);
  }
  .tile-name {
    flex: 0 0 auto;
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--accent);
  }
  .tile-blurb {
    flex: 1 1 auto;
    min-width: 0;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-cmd {
    flex: 0 0 auto;
    padding: 0.15rem 0.5rem;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 0.35rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--accent) 85%, white 15%);
  }
  .tile-arrow {
    flex: 0 0 auto;
    font-size: var(--font-size-md, 0.875rem);
    color: var(--accent);
  }

  /* ── stats · boxless 40 / 60 ── */
  .stats-row {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: "memory scatter" "ranks scatter";
    gap: 1.5rem 2.25rem;
  }
  .stat-memory { grid-area: memory; }
  .stat-ranks { grid-area: ranks; }
  .stat-scatter { grid-area: scatter; }
  @container (max-width: 780px) {
    .stats-row {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      grid-template-areas: "memory" "scatter" "ranks";
    }
  }
  .stats-row .stat {
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

  /* stat 1 · status blocks */
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.2rem;
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

  /* stat 2 · scatter (echarts) — the interactive centerpiece */
  .chart {
    width: 100%;
    height: 420px;
  }
  .chart :global(> div) {
    height: 100% !important;
  }

  /* stat 3 · ranks */
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
  .group-label:first-child { margin-top: 0; }
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
