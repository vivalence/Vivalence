<script>
  import { Canvas, stage } from "@vivalence/drapes";

  stage.use(stage.graph, stage.scatter, stage.bar, stage.tooltip, stage.legend, stage.grid, stage.dataZoom, stage.renderer);

  const { terminal } = $props();
  const daemon = terminal.daemon;

  let view = $state("graph");
  let symbols = $state([]);
  let literals = $state([]);
  let memories = $state([]);
  let traces = $state([]);
  let chart;
  let selected = $state(null);

  const STATUS_COLOR = {
    UNTOUCHED: "#3b3b3b",
    UNKNOWN: "#6b5b73",
    LEARNING: "#c4a35a",
    KNOWN: "#5b8c5a",
    GRADUATED: "#3a7ca5",
  };

  const SIGNAL_COLOR = {
    MASTERY: "#3a7ca5",
    SUCCESS: "#5b8c5a",
    NEUTRAL: "#888888",
    MISTAKE: "#c4a35a",
    FAILURE: "#a55a5a",
  };

  const SYMBOL_TRAIT_COLOR = {
    ONTOLOGICAL: "#4a4a5a",
    LABELED: "#5a5a6a",
    TOPOGRAPHICAL: "#6a5a4a",
  };

  // two relations = the graph. symbol.literals → symbol_literals, literal.uses → literal_uses.
  daemon.connection.call("/entities/symbol/find", { where: {}, options: { populate: ["literals"] } })
    .then((result) => (symbols = result));
  daemon.connection.call("/entities/literal/find", { where: {}, options: { populate: ["uses"] } })
    .then((result) => (literals = result));

  // userspace overlay: memory colors literal nodes, traces feed the timeline.
  daemon.connection.call("/userspace/entities/memory/find", { where: {} })
    .then((result) => (memories = result));
  daemon.connection.call("/userspace/entities/trace/find", { where: {} })
    .then((result) => (traces = result));

  daemon.subscribe?.("/userspace/entities/trace/subscribe", (event) => {
    traces = [...traces, event.entity];
  });

  daemon.subscribe?.("/userspace/entities/memory/subscribe", (event) => {
    const existing = memories.findIndex((memory) => memory.id === event.entity.id);
    if (existing >= 0) {
      memories[existing] = event.entity;
      memories = memories;
    } else {
      memories = [...memories, event.entity];
    }
  });

  const memoryByLiteral = $derived(
    new Map(memories.map((memory) => [memory.literal?.id ?? memory.literal, memory])),
  );

  function memoryFor(literalId) {
    return memoryByLiteral.get(literalId);
  }

  function signalOf(trace) {
    return trace.signal?.enum ?? trace.signal;
  }

  function symbolLabel(slug) {
    const parts = slug.split(".");
    return parts[parts.length - 1];
  }

  function initGraph(container) {
    chart = stage.chart(container);
    chart.on("click", (params) => {
      if (params.dataType === "node") selected = params.data;
    });
    chart.setOption(graphOptions);
    return { resize: () => chart.resize(), dispose: () => chart.dispose() };
  }

  function initMemory(container) {
    const instance = stage.chart(container);
    instance.setOption(memoryOptions);
    return { resize: () => instance.resize(), dispose: () => instance.dispose() };
  }

  function initTraces(container) {
    const instance = stage.chart(container);
    instance.setOption(traceOptions);
    return { resize: () => instance.resize(), dispose: () => instance.dispose() };
  }

  const graphOptions = $derived.by(() => {
    const nodes = [];
    const edges = [];

    // symbols + their symbol_literals edges
    for (const symbol of symbols) {
      const degree = symbol.literals?.length ?? 0;
      nodes.push({
        id: `symbol:${symbol.id}`,
        kind: "symbol",
        name: symbolLabel(symbol.slug),
        slug: symbol.slug,
        symbolSize: 12 + Math.sqrt(degree) * 6,
        itemStyle: {
          color: SYMBOL_TRAIT_COLOR[(symbol.traits ?? [])[0]] ?? "#4a4a5a",
          borderColor: "#666",
          borderWidth: 1,
          opacity: 0.7,
        },
        category: 0,
      });
      for (const literal of symbol.literals ?? []) {
        edges.push({
          source: `symbol:${symbol.id}`,
          target: `literal:${literal.id ?? literal}`,
          lineStyle: { opacity: 0.06, width: 0.5 },
        });
      }
    }

    // literals + their literal_uses edges
    for (const literal of literals) {
      const memory = memoryFor(literal.id);
      nodes.push({
        id: `literal:${literal.id}`,
        kind: "literal",
        entityId: literal.id,
        name: literal.trait?.TRANSLATED?.learning ?? literal.slug,
        slug: literal.slug,
        symbolSize: 16,
        itemStyle: { color: STATUS_COLOR[memory?.status ?? "UNTOUCHED"] },
        category: 1,
      });
      for (const used of literal.uses ?? []) {
        edges.push({
          source: `literal:${literal.id}`,
          target: `literal:${used.id ?? used}`,
          lineStyle: { opacity: 0.2, width: 1.2, curveness: 0.15 },
        });
      }
    }

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(20,20,30,0.9)",
        borderColor: "#444",
        textStyle: { color: "#ccc", fontSize: 11, fontFamily: "monospace" },
        formatter: (params) => {
          if (params.dataType === "edge") return "";
          if (params.data?.kind === "symbol") return `<b>${params.data.name}</b><br/>symbol`;
          const memory = memoryFor(params.data?.entityId);
          const status = memory?.status ?? "UNTOUCHED";
          const nextIn = memory ? `${memory.nextIn.toFixed(1)}h` : "—";
          return `<b>${params.data?.name ?? ""}</b><br/>${status} · ${nextIn}`;
        },
      },
      animationDurationUpdate: 300,
      legend: [{
        data: ["symbol", "literal"],
        bottom: 10,
        textStyle: { color: "#666", fontFamily: "monospace", fontSize: 10 },
      }],
      series: [{
        type: "graph",
        layout: "force",
        roam: true,
        scaleLimit: { min: 0.4, max: 3 },
        draggable: true,
        force: {
          repulsion: 600,
          gravity: 0.05,
          edgeLength: [80, 200],
          friction: 0.85,
        },
        lineStyle: { opacity: 0.1, width: 0.8, curveness: 0.1 },
        label: { show: false, color: "#ccc", fontSize: 10 },
        emphasis: { focus: "adjacency", label: { show: true }, lineStyle: { width: 2, opacity: 0.6 } },
        nodes: nodes,
        edges: edges,
        categories: [
          { name: "symbol" },
          { name: "literal" },
        ],
      }],
    };
  });

  const memoryOptions = $derived.by(() => {
    const statuses = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];
    const statusCounts = {};
    for (const memory of memories) {
      statusCounts[memory.status] = (statusCounts[memory.status] ?? 0) + 1;
    }

    return {
      tooltip: { trigger: "axis" },
      grid: [
        { left: 50, right: 20, top: 20, bottom: "55%" },
        { left: 50, right: 20, top: "55%", bottom: 40 },
      ],
      xAxis: [
        {
          type: "category",
          data: statuses,
          gridIndex: 0,
          axisLabel: { fontSize: 9, fontFamily: "monospace", color: "#888" },
        },
        {
          type: "time",
          gridIndex: 1,
          axisLabel: { fontSize: 9, fontFamily: "monospace", color: "#888" },
        },
      ],
      yAxis: [
        { type: "value", gridIndex: 0, axisLabel: { fontSize: 9, color: "#888" } },
        {
          type: "value",
          name: "nextIn (h)",
          gridIndex: 1,
          nameTextStyle: { fontSize: 9, color: "#888" },
          axisLabel: { fontSize: 9, color: "#888" },
        },
      ],
      series: [
        {
          type: "bar",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: statuses.map((status) => ({
            value: statusCounts[status] ?? 0,
            itemStyle: { color: STATUS_COLOR[status] },
          })),
        },
        {
          type: "scatter",
          xAxisIndex: 1,
          yAxisIndex: 1,
          symbolSize: 8,
          data: memories.map((memory) => ({
            value: [memory.lastAt, memory.nextIn],
            itemStyle: { color: STATUS_COLOR[memory.status ?? "UNTOUCHED"] },
          })),
        },
      ],
    };
  });

  const traceOptions = $derived({
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const [time, signal] = params.value;
        return `${new Date(time).toLocaleTimeString()} — ${signal}`;
      },
    },
    grid: { left: 70, right: 20, top: 20, bottom: 50 },
    xAxis: { type: "time", axisLabel: { fontSize: 9, fontFamily: "monospace", color: "#888" } },
    yAxis: {
      type: "category",
      data: ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"],
      axisLabel: { fontSize: 9, fontFamily: "monospace", color: "#888" },
    },
    dataZoom: [{ type: "slider", xAxisIndex: 0, height: 16, bottom: 4 }],
    series: [{
      type: "scatter",
      symbolSize: 7,
      data: traces.map((trace) => ({
        value: [trace.created_at, signalOf(trace)],
        itemStyle: { color: SIGNAL_COLOR[signalOf(trace)] ?? "#888" },
      })),
    }],
  });

  $effect(() => {
    if (view === "graph" && chart) chart.setOption(graphOptions, { notMerge: true });
  });
</script>

<div class="dashboard">
  <div class="dashboard-surface">
    <div class="tabs">
      <button class="tab" class:active={view === "graph"} onclick={() => view = "graph"}>
        graph
      </button>
      <button class="tab" class:active={view === "memory"} onclick={() => view = "memory"}>
        memory
      </button>
      <button class="tab" class:active={view === "traces"} onclick={() => view = "traces"}>
        traces
      </button>
    </div>

    <div class="panel">
      {#if view === "graph"}
        <Canvas init={initGraph} />
      {:else if view === "memory"}
        {#key memories}
          <Canvas init={initMemory} />
        {/key}
      {:else if view === "traces"}
        {#key traces}
          <Canvas init={initTraces} />
        {/key}
      {/if}
    </div>

    {#if selected}
      {@const memory = selected.kind === "literal" ? memoryFor(selected.entityId) : null}
      <div class="detail">
        <div class="detail-header">
          <span class="detail-name">{selected.name}</span>
          <button class="detail-close" onclick={() => selected = null}>×</button>
        </div>
        <div class="detail-slug">{selected.slug}</div>
        {#if selected.kind === "symbol"}
          <div class="detail-row">
            <span class="detail-label">kind</span>
            <span class="detail-value">symbol</span>
          </div>
        {:else if memory}
          <div class="detail-row">
            <span class="detail-label">status</span>
            <span class="detail-value" style="color: {STATUS_COLOR[memory.status]}">{memory.status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">next in</span>
            <span class="detail-value">{memory.nextIn.toFixed(2)}h</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">driver</span>
            <span class="detail-value">{memory.driver}</span>
          </div>
        {:else}
          <div class="detail-row">
            <span class="detail-label">status</span>
            <span class="detail-value" style="color: {STATUS_COLOR.UNTOUCHED}">UNTOUCHED</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard {
    display: grid;
    grid-template-rows: 1fr;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
  .dashboard-surface {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  .tabs {
    display: flex;
    gap: 2px;
    padding: 0.5rem 1rem 0;
    flex-shrink: 0;
  }
  .tab {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.12s, border-color 0.12s;
  }
  .tab:hover {
    color: var(--colors-skeleton-1-contrast);
  }
  .active {
    color: var(--colors-theme-primary-contrast);
    border-bottom-color: var(--colors-theme-primary-contrast);
  }
  .panel {
    flex: 1;
    min-height: 0;
  }
  .detail {
    position: absolute;
    right: 0.75rem;
    top: 3rem;
    width: 220px;
    background: color-mix(in srgb, var(--colors-skeleton-app-surface) 95%, transparent);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.5rem;
    padding: 0.75rem;
    backdrop-filter: blur(8px);
  }
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.375rem;
  }
  .detail-name {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    color: var(--colors-palette-gray-10);
  }
  .detail-close {
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-base);
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }
  .detail-slug {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
    margin-bottom: 0.5rem;
    word-break: break-all;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 30%, transparent);
  }
  .detail-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .detail-value {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
  }
</style>
