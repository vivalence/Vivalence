<script>
  import { Canvas, stage } from "@vivalence/drapes";
  import { STATUS_COLOR, ONTOLOGY, DUE, MUTED } from "./palette.js";

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

  const { board = [], streak = 0 } = $props();

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
  const dueSym = $derived(board.filter((row) => row.seen).map((row) => symlog(row.nextDays)));
  // the TIME axis bounds (now the X axis after the flip).
  const timeLo = $derived(Math.min(symlog(-7), ...(dueSym.length ? dueSym : [0])) - MARGIN);
  const timeHi = $derived(Math.max(symlog(20), ...(dueSym.length ? dueSym : [0])) + MARGIN);

  // strength × due — one series per ontology, derived from the board.
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
      axisPointer: {
        type: "cross",
        lineStyle: { color: MUTED, opacity: 0.45, type: "dashed" },
        label: { backgroundColor: "#2a2f3a" },
      },
      formatter: (p) => {
        const d = p.data.meta;
        const due =
          d.nextDays < 0
            ? `due ${Math.round(-d.nextDays)}d ago`
            : `due in ${Math.round(d.nextDays)}d`;
        const conf =
          d.strength >= 0.1
            ? `${Math.round(d.strength * 100)}%`
            : `${(d.strength * 100).toFixed(1)}%`;
        return (
          `<b style="font-size:14px">${d.pt}</b> <span style="opacity:.55">${d.en}</span><br/>` +
          `<span style="color:${STATUS_COLOR[d.status]}">●</span> ${d.status.toLowerCase()} · ${d.ontology} · ${conf} confident · ${due}`
        );
      },
    },
    legend: {
      top: 4,
      textStyle: { color: MUTED, fontSize: 13 },
      itemWidth: 16,
      itemHeight: 12,
      itemGap: 24,
    },
    // wheel zooms BOTH axes (cursor-anchored); drag pans. filterMode:"none" rescales the
    // window WITHOUT dropping points or the now-line/overdue wash. minSpan stops sub-pixel
    // zoom-in; the inside zoom clamps pan to the data. Double-click resets (wired below).
    dataZoom: [
      // pinch ZOOMS (ctrl+wheel); drag pans. two-finger scroll-pan is handled manually
      // below (echarts moveOnMouseWheel couples both axes to one delta — wrong).
      {
        type: "inside",
        xAxisIndex: 0,
        filterMode: "none",
        zoomOnMouseWheel: "ctrl",
        moveOnMouseWheel: false,
        moveOnMouseMove: true,
        minSpan: 1,
      },
      {
        type: "inside",
        yAxisIndex: 0,
        filterMode: "none",
        zoomOnMouseWheel: "ctrl",
        moveOnMouseWheel: false,
        moveOnMouseMove: true,
        minSpan: 1,
      },
      // slider rails — grab a handle to frame an edge band precisely (brushSelect: drag a
      // box on the rail to set the window directly). This is what makes corner clusters easy.
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "none",
        bottom: 6,
        height: 12,
        minSpan: 1,
        brushSelect: true,
        showDetail: false,
        backgroundColor: "transparent",
        borderColor: "transparent",
        fillerColor: "rgba(120,130,150,0.14)",
        dataBackground: {
          lineStyle: { color: MUTED, opacity: 0.25 },
          areaStyle: { color: MUTED, opacity: 0.05 },
        },
        selectedDataBackground: {
          lineStyle: { color: MUTED, opacity: 0.5 },
          areaStyle: { color: MUTED, opacity: 0.12 },
        },
        handleStyle: { color: "#2a2f3a", borderColor: MUTED },
        moveHandleStyle: { color: MUTED, opacity: 0.35 },
      },
      {
        type: "slider",
        yAxisIndex: 0,
        filterMode: "none",
        right: 6,
        width: 12,
        minSpan: 1,
        brushSelect: true,
        showDetail: false,
        backgroundColor: "transparent",
        borderColor: "transparent",
        fillerColor: "rgba(120,130,150,0.14)",
        dataBackground: {
          lineStyle: { color: MUTED, opacity: 0.25 },
          areaStyle: { color: MUTED, opacity: 0.05 },
        },
        selectedDataBackground: {
          lineStyle: { color: MUTED, opacity: 0.5 },
          areaStyle: { color: MUTED, opacity: 0.12 },
        },
        handleStyle: { color: "#2a2f3a", borderColor: MUTED },
        moveHandleStyle: { color: MUTED, opacity: 0.35 },
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
      chart.dispatchAction({
        type: "dataZoom",
        xAxisIndex: 0,
        start: zoom.x.start,
        end: zoom.x.end,
      });
      chart.dispatchAction({
        type: "dataZoom",
        yAxisIndex: 0,
        start: zoom.y.start,
        end: zoom.y.end,
      });
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    // resync local state whenever the window changes by any OTHER means (pinch, slider, drag, reset).
    chart.on("datazoom", () => {
      const dz = chart.getOption().dataZoom;
      if (dz[0]) zoom.x = { start: dz[0].start, end: dz[0].end };
      if (dz[1]) zoom.y = { start: dz[1].start, end: dz[1].end };
    });

    // double-click resets every axis to the full data window.
    chart
      .getZr()
      .on("dblclick", () => chart?.dispatchAction({ type: "dataZoom", start: 0, end: 100 }));

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
</script>

<section class="stat">
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
  /* streak — gold dopamine anchor, badged under the Activity chrome */
  .streak-card {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 0.9rem;
    min-width: 0;
    padding: 0.7rem 1.1rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, #e7c271 28%, transparent);
    background: color-mix(in srgb, #e7c271 6%, transparent);
  }
  .streak-num {
    position: relative;
    font-family: var(--font-family-serif-heading);
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 0.85;
    color: #e7c271;
    text-shadow: 0 0 18px color-mix(in srgb, #e7c271 38%, transparent);
    padding-right: 0.35rem;
  }
  .streak-dot {
    position: absolute;
    bottom: 0.12rem;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background: #e7c271;
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
    color: #e7c271;
  }
  .streak-sub {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  /* scatter (echarts) — the interactive centerpiece */
  .chart {
    width: 100%;
    height: 420px;
  }
  .chart :global(> div) {
    height: 100% !important;
  }
</style>
