<!--
  NodeGraph — pincer capability.
  Apache ECharts force-directed graph with optional convex-hull "bag"
  rendered behind a named subset of nodes (the bag demo).

  Inherits node/link colors from the surrounding skeleton context.

  Props:
    nodes: [{ name, category? }]
    links: [{ source, target }]
    bag:   { name, members: [string] }   // optional — names that form one cluster
-->
<script>
  import { onMount } from "svelte";
  import * as echarts from "echarts";
  import { useSkeleton } from "@vivalence/drapes";

  let { nodes = [], links = [], bag = null } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  let host;
  let chart;

  // ── convex hull (Andrew's monotone chain) ──
  // Returns the hull as an ordered array of [x, y] pairs.
  function convexHull(points) {
    if (points.length < 3) return points.slice();
    const sorted = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) =>
      (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  // inflate the hull outward by `padding` pixels around its centroid
  function inflateHull(hull, padding) {
    if (hull.length === 0) return hull;
    const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
    const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
    return hull.map(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      const length = Math.hypot(dx, dy) || 1;
      return [x + (dx / length) * padding, y + (dy / length) * padding];
    });
  }

  // read CSS variables for the current skeleton level — done at runtime so
  // theme changes propagate without rebuilding the chart from scratch.
  function colorsFor(level) {
    const root = getComputedStyle(document.documentElement);
    return {
      node:    root.getPropertyValue(`--colors-skeleton-${level}-primary-base`).trim() || "#1ebcb5",
      bagNode: root.getPropertyValue(`--colors-skeleton-${level}-secondary-base`).trim() || "#7e8dc8",
      link:    root.getPropertyValue(`--colors-skeleton-${level}-primary-base`).trim() || "#1ebcb5",
      label:   root.getPropertyValue(`--colors-skeleton-${level}-contrast`).trim() || "#e6eaef",
      hullFill: root.getPropertyValue(`--colors-skeleton-${level}-secondary-base`).trim() || "#7e8dc8",
      hullStroke: root.getPropertyValue(`--colors-skeleton-${level}-secondary-base`).trim() || "#7e8dc8",
    };
  }

  function buildOption(level) {
    const palette = colorsFor(level);
    return {
      backgroundColor: "transparent",
      tooltip: {},
      animation: false,
      series: [
        {
          id: "main",
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          symbolSize: 22,
          label: {
            show: true,
            color: palette.label,
            fontSize: 9,
            fontFamily: "var(--font-family-code)",
          },
          itemStyle: {
            color: (params) =>
              params.data.category === "bag" ? palette.bagNode : palette.node,
            borderColor: palette.node,
            borderWidth: 1,
          },
          lineStyle: {
            color: palette.link,
            width: 1,
            opacity: 0.6,
          },
          force: {
            repulsion: 140,
            edgeLength: 60,
            gravity: 0.08,
          },
          data: nodes.map((node) => ({
            name: node.name,
            category: node.category,
            value: node.value ?? 1,
          })),
          links: links.map((link) => ({ source: link.source, target: link.target })),
        },
      ],
    };
  }

  // After each force-layout tick, compute the bag's convex hull from the
  // current node positions and overlay it as a graphic polygon. We use the
  // chart's internal pixel coordinates so the hull moves with the layout.
  //
  // setOption must NEVER run inside ECharts' main process (i.e. inside a
  // "finished" / "graphroam" / render callback), so we defer via rAF and
  // coalesce repeated requests with a single-flight flag.
  let hullFramePending = false;
  function scheduleHullOverlay() {
    if (hullFramePending) return;
    hullFramePending = true;
    requestAnimationFrame(() => {
      hullFramePending = false;
      applyHullOverlay();
    });
  }
  function applyHullOverlay() {
    if (!chart || !bag || !bag.members) return;
    const seriesIndex = 0;
    const positions = [];
    for (const memberName of bag.members) {
      const pixel = chart.convertToPixel({ seriesIndex }, memberName);
      if (Array.isArray(pixel)) positions.push(pixel);
    }
    if (positions.length < 3) {
      chart.setOption({ graphic: [] }, { lazyUpdate: true });
      return;
    }
    const hull = inflateHull(convexHull(positions), 28);
    const palette = colorsFor(level);
    chart.setOption(
      {
        graphic: [
          {
            type: "polygon",
            z: -1, // behind nodes
            shape: { points: hull },
            style: {
              fill: palette.hullFill,
              opacity: 0.18,
              stroke: palette.hullStroke,
              lineWidth: 1.5,
              lineDash: [4, 4],
            },
          },
        ],
      },
      { lazyUpdate: true },
    );
  }

  onMount(() => {
    chart = echarts.init(host, null, { renderer: "canvas" });
    chart.setOption(buildOption(level));
    chart.on("finished", scheduleHullOverlay);
    chart.on("graphroam", scheduleHullOverlay);
    const observer = new ResizeObserver(() => {
      chart?.resize();
      scheduleHullOverlay();
    });
    observer.observe(host);
    // re-pulse the hull a few times during initial layout settling
    const settleTimers = [200, 600, 1200].map((ms) =>
      setTimeout(scheduleHullOverlay, ms),
    );
    return () => {
      settleTimers.forEach(clearTimeout);
      observer.disconnect();
      chart?.dispose();
    };
  });

  $effect(() => {
    if (chart) {
      chart.setOption(buildOption(level));
      scheduleHullOverlay();
    }
  });
</script>

<div class="graph" bind:this={host}></div>

<style>
  .graph {
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
  }
</style>
