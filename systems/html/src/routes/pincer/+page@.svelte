<!--
  pip — t-bone layout prototype.

  the viket is a square at the junction of crown and spine. dragging
  moves the entire T. the t-bone is always visible. panels can collapse
  to 0 when viket reaches an edge.

  panels: A (across the cross), B (one side of stem), C (contains D/E/F).
  bones:  crown (perpendicular to stem) + spine (the stem itself).
  viket:  the junction square. always at (crown ∩ spine). draggable.
  hud:    lives inside the H overlay (sticky open for now).

  drag snaps to a Fibonacci/metric grid (3-5 dominant + secondary).
  long-press opens a sticky radial menu for stem orientation.
  filename uses +page@.svelte to skip parent +layout.svelte gates.
-->
<script>
  import "@vivalence/dapper/font.css";
  import "../../client.css";
  import { onMount } from "svelte";
  import { SkeletonProvider } from "@vivalence/drapes";
  import TreeView from "./TreeView.svelte";
  import NodeGraph from "./NodeGraph.svelte";
  import PanelD from "./d/PanelD.svelte";

  // -------- sample data for caps --------
  const treeData = {
    name: "pincer",
    kids: [
      {
        name: "capabilities",
        kids: [
          { name: "TreeView" },
          { name: "NodeGraph" },
          { name: "Headers" },
          { name: "Search" },
        ],
      },
      {
        name: "controls",
        kids: [
          { name: "viket" },
          { name: "twigs", kids: [{ name: "d-twig" }, { name: "f-twig" }] },
          { name: "tray-h" },
        ],
      },
      { name: "engine", kids: [{ name: "rects" }, { name: "bones" }, { name: "snap-grid" }] },
    ],
  };

  // sample DAG: a parent with 2 children. Child #2 owns a "bag" of 14
  // sub-nodes that get visually grouped (convex hull) by NodeGraph.
  const bagMembers = Array.from({ length: 14 }, (_, i) => `bag-${i + 1}`);
  const graphData = {
    nodes: [
      { name: "root", category: "trunk" },
      { name: "child-1", category: "trunk" },
      { name: "child-2", category: "trunk" },
      ...bagMembers.map((name) => ({ name, category: "bag" })),
    ],
    links: [
      { source: "root", target: "child-1" },
      { source: "root", target: "child-2" },
      ...bagMembers.map((name) => ({ source: "child-2", target: name })),
    ],
    bag: {
      name: "child-2 cluster",
      members: bagMembers,
    },
  };

  // -------- bone telemetry (mocked for now — wire to real signals later) --------
  // status:  "ok" | "lag" | "down"
  const lighthouses = $state([
    { name: "alpha",  status: "ok"   },
    { name: "delta",  status: "lag"  },
    { name: "omega",  status: "down" },
  ]);
  const daemon = $state({ status: "ok", latencyMs: 14 });
  const session = $state({
    phase:    "warmup",
    buffers:  4,
    pulling:  false,
    stalled:  false,
  });

  // worst-status-wins aggregator. down > lag > ok.
  const STATUS_RANK = { ok: 0, lag: 1, down: 2 };
  const worstStatus = (items) =>
    items.reduce((worst, item) =>
      STATUS_RANK[item.status] > STATUS_RANK[worst] ? item.status : worst,
      "ok",
    );
  const lighthouseAggregate = $derived(worstStatus(lighthouses));
  const lighthouseTooltip = $derived(
    lighthouses.map((l) => `${l.name}: ${l.status}`).join("\n"),
  );
  const sessionActivityStatus = $derived(
    session.stalled ? "down" : session.pulling ? "lag" : "ok",
  );
  const sessionActivityLabel = $derived(
    session.stalled ? "stall" : session.pulling ? "pull" : "idle",
  );

  // -------- terminals (mocked) --------
  // each tab = one open-active terminal. title derived from the breadcrumb
  // trail of what that terminal has mounted. newest sits next to viket,
  // older ones flow left and scroll off.
  const terminals = $state([
    { id: "t1", active: false, breadcrumbs: ["home"] },
    { id: "t2", active: false, breadcrumbs: ["home", "review", "vocab"] },
    { id: "t3", active: true,  breadcrumbs: ["home", "learn", "grammar", "cases", "dative"] },
    { id: "t4", active: false, breadcrumbs: ["home", "listen", "podcast-4"] },
    { id: "t5", active: false, breadcrumbs: ["home", "learn", "vocab"] },
    { id: "t6", active: false, breadcrumbs: ["search", "result-17"] },
    { id: "t7", active: false, breadcrumbs: ["home", "settings"] },
  ]);
  // titles use `/` as separator for density. stem-cutting (left-side
  // ellipsis) is done in CSS via `direction: rtl` on the inner span so
  // the tail (most specific crumb) always stays visible.
  const titleFor = (terminal) => terminal.breadcrumbs.join("/");
  const fullTitleFor = (terminal) => terminal.breadcrumbs.join(" · ");
  const activateTerminal = (id) => {
    for (const t of terminals) t.active = t.id === id;
  };

  // anything in `down` state anywhere lights up the system-wide alert rail
  const systemAlert = $derived(
    [lighthouseAggregate, daemon.status, sessionActivityStatus].some(
      (status) => status === "down",
    ),
  );

  // -------- constants --------
  const BONE_THICKNESS = 45;          // crown/spine thickness (was 56)
  const VIKET_SIZE = BONE_THICKNESS;  // viket square = bone thickness
  const HALF = BONE_THICKNESS / 2;
  const EDGE_PADDING = HALF;          // viket can hug edge → panels collapse

  const TAP_MAX_MS = 250;
  const TAP_MAX_MOVE = 8;
  const MULTI_TAP_WINDOW = 280;
  const LONG_PRESS_MS = 420;
  const RELEASE_COMMIT_DIST = 32;     // release > N px from viket = commit

  const RADIAL_RADIUS = 108;

  // snap grid: 3-5 dominant points + fibonacci-ish secondaries (per axis %)
  const SNAP_DOMINANT = [0, 50, 100];
  const SNAP_SECONDARY = [13, 21, 34, 66, 79, 87];
  const SNAP_PERCENTS = [...SNAP_DOMINANT, ...SNAP_SECONDARY].sort((a, b) => a - b);
  const SNAP_DISTANCE = 28;           // px (doubled gravity)

  // -------- state --------
  // viket position in viewport pixels (center of viket square)
  let viket = $state({ x: 200, y: 240 });
  let previous = $state({ x: 200, y: 240 });
  let standard = $state({ x: 200, y: 240 });

  // 0 = stem-down (default T), 90 = stem-right, 180 = stem-up, 270 = stem-left
  let orientation = $state(0);

  // viewport.height excludes the HUD bar
  let viewport = $state({ width: 0, height: 0 });

  let gesture = $state({
    pointerId: null,
    downAt: 0,
    downX: 0,
    downY: 0,
    startViketX: 0,
    startViketY: 0,
    tapCount: 0,
    tapTimer: null,
    longPressTimer: null,
    isDragging: false,
    isLongPress: false,
    fromSticky: false,
  });

  // radial menu state machine:
  //   show=false                       → idle
  //   show=true,  sticky=false         → drag-pick mode (finger held)
  //   show=true,  sticky=true          → sticky (finger off, click to commit)
  let radial = $state({ show: false, sticky: false, snap: 90 });
  let flash = $state(null);

  // h is sticky-open by default — it hosts the HUD content (state + toggles).
  // hiding behavior comes later.
  let overlays = $state({ g: false, h: false });

  // d/f panes inside C — collapsed = twig only, expanded = full pane.
  // controlled by their twig (the thin bone with >< icons + drag handle).
  let panes = $state({ d: true, f: true });
  // pixel widths for D / E / F within the def row. null = "use the default
  // 1/2/1 flex split until the user drags". once a drag happens, all three
  // are pinned in pixels so dragging one boundary only moves the two
  // adjacent panes. the third stays exactly where it was.
  let paneSize = $state({ d: null, e: null, f: null });
  const PANE_MIN_PX = 80;

  let twigDrag = $state({ which: null, startX: 0, startD: 0, startE: 0, startF: 0 });

  function ensurePixelSizes(rowWidth) {
    if (paneSize.d !== null) return;
    // first drag: snapshot the current rendered pixel widths so the
    // two non-adjacent panes are anchored before we start mutating.
    const def = document.querySelector(".def");
    if (!def) return;
    const d = def.querySelector(".def-d");
    const e = def.querySelector(".def-e");
    const f = def.querySelector(".def-f");
    paneSize.d = d ? d.getBoundingClientRect().width : rowWidth * 0.25;
    paneSize.e = e ? e.getBoundingClientRect().width : rowWidth * 0.50;
    paneSize.f = f ? f.getBoundingClientRect().width : rowWidth * 0.25;
  }

  function onTwigPointerDown(which, event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const row = event.currentTarget.closest(".def");
    const rowWidth = row ? row.getBoundingClientRect().width : 1000;
    ensurePixelSizes(rowWidth);
    twigDrag.which = which;
    twigDrag.startX = event.clientX;
    twigDrag.startD = paneSize.d;
    twigDrag.startE = paneSize.e;
    twigDrag.startF = paneSize.f;
  }
  function onTwigPointerMove(event) {
    if (twigDrag.which !== "d" && twigDrag.which !== "f") return;
    const deltaPx = event.clientX - twigDrag.startX;
    if (twigDrag.which === "d") {
      // dragging d-handle right grows d, shrinks e. f untouched.
      const newD = clamp(twigDrag.startD + deltaPx, PANE_MIN_PX, twigDrag.startD + twigDrag.startE - PANE_MIN_PX);
      paneSize.d = newD;
      paneSize.e = twigDrag.startE - (newD - twigDrag.startD);
    } else {
      // dragging f-handle left grows f, shrinks e. d untouched.
      const newF = clamp(twigDrag.startF - deltaPx, PANE_MIN_PX, twigDrag.startF + twigDrag.startE - PANE_MIN_PX);
      paneSize.f = newF;
      paneSize.e = twigDrag.startE - (newF - twigDrag.startF);
    }
  }
  function onTwigPointerUp(event) {
    if (twigDrag.which !== "d" && twigDrag.which !== "f") return;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (_) {}
    twigDrag.which = null;
  }
  function togglePane(key) {
    panes[key] = !panes[key];
  }

  // -------- pure helpers --------
  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function snapToGrid(value, axisLength) {
    let nearest = value;
    let nearestDist = SNAP_DISTANCE;
    for (const percent of SNAP_PERCENTS) {
      const target = (percent / 100) * axisLength;
      const distance = Math.abs(value - target);
      if (distance < nearestDist) {
        nearest = target;
        nearestDist = distance;
      }
    }
    return nearest;
  }

  // panel rectangles — bones occupy their own space, panels start where bones end.
  // each panel can collapse to width=0 or height=0 when viket reaches an edge.
  function rectsForOrientation(orientation, viket, viewportWidth, viewportHeight) {
    if (orientation === 0) {
      return {
        a: {
          left: 0,
          top: 0,
          width: viewportWidth,
          height: Math.max(0, viket.y - HALF),
        },
        b: {
          left: 0,
          top: viket.y + HALF,
          width: Math.max(0, viket.x - HALF),
          height: Math.max(0, viewportHeight - viket.y - HALF),
        },
        c: {
          left: viket.x + HALF,
          top: viket.y + HALF,
          width: Math.max(0, viewportWidth - viket.x - HALF),
          height: Math.max(0, viewportHeight - viket.y - HALF),
        },
      };
    }
    if (orientation === 90) {
      return {
        a: {
          left: 0,
          top: 0,
          width: Math.max(0, viket.x - HALF),
          height: viewportHeight,
        },
        b: {
          left: viket.x + HALF,
          top: 0,
          width: Math.max(0, viewportWidth - viket.x - HALF),
          height: Math.max(0, viket.y - HALF),
        },
        c: {
          left: viket.x + HALF,
          top: viket.y + HALF,
          width: Math.max(0, viewportWidth - viket.x - HALF),
          height: Math.max(0, viewportHeight - viket.y - HALF),
        },
      };
    }
    if (orientation === 180) {
      return {
        a: {
          left: 0,
          top: viket.y + HALF,
          width: viewportWidth,
          height: Math.max(0, viewportHeight - viket.y - HALF),
        },
        b: {
          left: viket.x + HALF,
          top: 0,
          width: Math.max(0, viewportWidth - viket.x - HALF),
          height: Math.max(0, viket.y - HALF),
        },
        c: {
          left: 0,
          top: 0,
          width: Math.max(0, viket.x - HALF),
          height: Math.max(0, viket.y - HALF),
        },
      };
    }
    if (orientation === 270) {
      return {
        a: {
          left: viket.x + HALF,
          top: 0,
          width: Math.max(0, viewportWidth - viket.x - HALF),
          height: viewportHeight,
        },
        b: {
          left: 0,
          top: 0,
          width: Math.max(0, viket.x - HALF),
          height: Math.max(0, viket.y - HALF),
        },
        c: {
          left: 0,
          top: viket.y + HALF,
          width: Math.max(0, viket.x - HALF),
          height: Math.max(0, viewportHeight - viket.y - HALF),
        },
      };
    }
  }

  // bones — always visible, always extending from the viket square outward
  function bonesForOrientation(orientation, viket, viewportWidth, viewportHeight) {
    if (orientation === 0) {
      return {
        crown: { left: 0, top: viket.y - HALF, width: viewportWidth, height: BONE_THICKNESS },
        spine: { left: viket.x - HALF, top: viket.y - HALF, width: BONE_THICKNESS, height: viewportHeight - viket.y + HALF },
      };
    }
    if (orientation === 90) {
      return {
        crown: { left: viket.x - HALF, top: 0, width: BONE_THICKNESS, height: viewportHeight },
        spine: { left: viket.x - HALF, top: viket.y - HALF, width: viewportWidth - viket.x + HALF, height: BONE_THICKNESS },
      };
    }
    if (orientation === 180) {
      return {
        crown: { left: 0, top: viket.y - HALF, width: viewportWidth, height: BONE_THICKNESS },
        spine: { left: viket.x - HALF, top: 0, width: BONE_THICKNESS, height: viket.y + HALF },
      };
    }
    if (orientation === 270) {
      return {
        crown: { left: viket.x - HALF, top: 0, width: BONE_THICKNESS, height: viewportHeight },
        spine: { left: 0, top: viket.y - HALF, width: viket.x + HALF, height: BONE_THICKNESS },
      };
    }
  }

  let rects = $derived(rectsForOrientation(orientation, viket, viewport.width, viewport.height));
  let bones = $derived(bonesForOrientation(orientation, viket, viewport.width, viewport.height));

  // angle (drag direction in screen-space) → orientation (which way the stem points)
  function snapToOrientation(snapAngle) {
    return ({ 0: 90, 90: 0, 180: 270, 270: 180 })[snapAngle] ?? 0;
  }
  function orientationToSnap(currentOrientation) {
    return ({ 0: 90, 90: 0, 180: 270, 270: 180 })[currentOrientation] ?? 90;
  }
  function snapLabel(angle) {
    return ({ 0: "→", 90: "↓", 180: "←", 270: "↑" })[angle] ?? "";
  }

  // -------- gesture handlers --------
  function onPointerDown(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.pointerId = event.pointerId;
    gesture.downAt = Date.now();
    gesture.downX = event.clientX;
    gesture.downY = event.clientY;
    gesture.startViketX = viket.x;
    gesture.startViketY = viket.y;
    gesture.isDragging = false;
    gesture.isLongPress = false;
    gesture.fromSticky = radial.sticky;

    clearTimeout(gesture.longPressTimer);
    gesture.longPressTimer = setTimeout(() => {
      if (gesture.isDragging) return;
      gesture.isLongPress = true;
      radial.show = true;
      radial.sticky = false; // entering active drag-pick
      radial.snap = orientationToSnap(orientation);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(event) {
    if (gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.downX;
    const deltaY = event.clientY - gesture.downY;
    const distance = Math.hypot(deltaX, deltaY);

    if (gesture.isLongPress) {
      const angle = (Math.atan2(event.clientY - viket.y, event.clientX - viket.x) * 180 / Math.PI + 360) % 360;
      radial.snap = (Math.round(angle / 90) * 90) % 360;
      return;
    }

    if (!gesture.isDragging && distance > TAP_MAX_MOVE) {
      clearTimeout(gesture.longPressTimer);
      gesture.isDragging = true;
      // dragging from sticky cancels sticky
      if (gesture.fromSticky) {
        radial.sticky = false;
        radial.show = false;
        gesture.fromSticky = false;
      }
    }

    if (gesture.isDragging) {
      const rawX = gesture.startViketX + deltaX;
      const rawY = gesture.startViketY + deltaY;
      const snappedX = snapToGrid(rawX, viewport.width);
      const snappedY = snapToGrid(rawY, viewport.height);
      viket.x = clamp(snappedX, EDGE_PADDING, viewport.width - EDGE_PADDING);
      viket.y = clamp(snappedY, EDGE_PADDING, viewport.height - EDGE_PADDING);
    }
  }

  function onPointerUp(event) {
    if (gesture.pointerId !== event.pointerId) return;
    clearTimeout(gesture.longPressTimer);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (releaseError) {
      // pointer already released
    }
    gesture.pointerId = null;

    if (gesture.isLongPress) {
      const finalDistance = Math.hypot(event.clientX - viket.x, event.clientY - viket.y);
      if (finalDistance > RELEASE_COMMIT_DIST) {
        // released far from viket → commit picked orientation
        orientation = snapToOrientation(radial.snap);
        radial.show = false;
        radial.sticky = false;
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      } else {
        // released near viket center → sticky mode
        radial.sticky = true;
      }
      gesture.isLongPress = false;
      return;
    }

    if (gesture.isDragging) {
      previous = { x: gesture.startViketX, y: gesture.startViketY };
      gesture.isDragging = false;
      return;
    }

    // tap (not drag, not long-press)
    const elapsed = Date.now() - gesture.downAt;
    if (elapsed < TAP_MAX_MS) {
      if (gesture.fromSticky) {
        // tap on viket from sticky = no-op. user must HOLD to re-enter.
        gesture.fromSticky = false;
        return;
      }
      gesture.tapCount++;
      clearTimeout(gesture.tapTimer);
      gesture.tapTimer = setTimeout(() => {
        handleTaps(gesture.tapCount);
        gesture.tapCount = 0;
      }, MULTI_TAP_WINDOW);
    }
  }

  function handleTaps(count) {
    if (count === 1) {
      // 1x: jump to $HOME
      previous = { ...viket };
      viket = { ...standard };
      pulse("tap1");
    } else if (count === 2) {
      // 2x: swap with previous (toggle back)
      const swap = { ...previous };
      previous = { ...viket };
      viket = swap;
      pulse("tap2");
    } else if (count >= 3) {
      // 3x: mark current as $HOME
      standard = { ...viket };
      pulse("tap3");
    }
  }

  function pulse(kind) {
    flash = kind;
    setTimeout(() => {
      flash = null;
    }, 240);
  }

  function onSpokeClick(event, angle) {
    event.stopPropagation();
    if (!radial.sticky) return;
    orientation = snapToOrientation(angle);
    radial.show = false;
    radial.sticky = false;
  }

  function onRadialBackdropClick() {
    radial.show = false;
    radial.sticky = false;
  }

  function toggleOverlay(which) {
    overlays[which] = !overlays[which];
  }

  function onResize() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    viket.x = clamp(viket.x, EDGE_PADDING, viewport.width - EDGE_PADDING);
    viket.y = clamp(viket.y, EDGE_PADDING, viewport.height - EDGE_PADDING);
  }

  onMount(() => {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;

    // start in lower-left corner — viket hugs the edges via EDGE_PADDING
    viket = { x: EDGE_PADDING, y: viewport.height - EDGE_PADDING };
    previous = { ...viket };
    standard = { ...viket };

    // defensive reset — HMR can leave gesture/radial state stuck across
    // edits (isDragging=true, stale pointerId, lingering longPressTimer).
    clearTimeout(gesture.longPressTimer);
    gesture.pointerId = null;
    gesture.isDragging = false;
    gesture.isLongPress = false;
    gesture.fromSticky = false;
    radial.show = false;
    radial.sticky = false;

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>pip · t-bone</title>
</svelte:head>

{#if viewport.width > 0 && viewport.height > 0}
  <!-- panels — collapse to 0 when viket hits an edge -->
  {#if rects.a.width > 0 && rects.a.height > 0}
    <SkeletonProvider level={1}>
      <div
        class="panel panel-a"
        style:left="{rects.a.left}px"
        style:top="{rects.a.top}px"
        style:width="{rects.a.width}px"
        style:height="{rects.a.height}px"
      >
        <span class="label">A</span>
      </div>
    </SkeletonProvider>
  {/if}

  {#if rects.b.width > 0 && rects.b.height > 0}
    <SkeletonProvider level={2}>
      <div
        class="panel panel-b"
        style:left="{rects.b.left}px"
        style:top="{rects.b.top}px"
        style:width="{rects.b.width}px"
        style:height="{rects.b.height}px"
      >
        <span class="label">B</span>
      </div>
    </SkeletonProvider>
  {/if}

  {#if rects.c.width > 0 && rects.c.height > 0}
    <div
      class="panel panel-c"
      style:left="{rects.c.left}px"
      style:top="{rects.c.top}px"
      style:width="{rects.c.width}px"
      style:height="{rects.c.height}px"
    >
      <div class="def">
        <!-- D pane: TreeView, level 3 -->
        {#if panes.d}
          <SkeletonProvider level={3}>
            <div class="def-panel def-d" style:flex={paneSize.d !== null ? `0 0 ${paneSize.d}px` : "1 1 0"}>
              <div class="pane-body">
                <PanelD />
              </div>
            </div>
          </SkeletonProvider>
        {/if}
        <div class="twig twig-d" class:closed={!panes.d}>
          <button class="twig-toggle" onclick={() => togglePane("d")} aria-label="toggle d">
            {panes.d ? "<" : ">"}
          </button>
          <div
            class="twig-handle"
            class:dragging={twigDrag.which === "d"}
            aria-label="drag handle d"
            onpointerdown={(event) => onTwigPointerDown("d", event)}
            onpointermove={onTwigPointerMove}
            onpointerup={onTwigPointerUp}
            onpointercancel={onTwigPointerUp}
          ></div>
        </div>

        <!-- E pane: dominant work surface, level 2 -->
        <SkeletonProvider level={2}>
          <div class="def-panel def-e" style:flex={paneSize.e !== null ? `1 1 ${paneSize.e}px` : "2 1 0"}><span class="def-label">E</span></div>
        </SkeletonProvider>

        <!-- F pane: NodeGraph, level 3 -->
        <div class="twig twig-f" class:closed={!panes.f}>
          <button class="twig-toggle" onclick={() => togglePane("f")} aria-label="toggle f">
            {panes.f ? ">" : "<"}
          </button>
          <div
            class="twig-handle"
            class:dragging={twigDrag.which === "f"}
            aria-label="drag handle f"
            onpointerdown={(event) => onTwigPointerDown("f", event)}
            onpointermove={onTwigPointerMove}
            onpointerup={onTwigPointerUp}
            onpointercancel={onTwigPointerUp}
          ></div>
        </div>
        {#if panes.f}
          <SkeletonProvider level={3}>
            <div class="def-panel def-f" style:flex={paneSize.f !== null ? `0 0 ${paneSize.f}px` : "1 1 0"}>
              <div class="pane-body">
                <NodeGraph nodes={graphData.nodes} links={graphData.links} bag={graphData.bag} />
              </div>
            </div>
          </SkeletonProvider>
        {/if}
      </div>
    </div>
  {/if}

  <!-- bones — always visible, modeline material -->
  <div
    class="bone crown"
    style:left="{bones.crown.left}px"
    style:top="{bones.crown.top}px"
    style:width="{bones.crown.width}px"
    style:height="{bones.crown.height}px"
    style:--viket-x="{viket.x}px"
  >
    <!-- left crown: phase + activity telemetry -->
    <div class="crown-population crown-left">
      <span class="crown-meter phase-meter">
        <span class="meter-label">phase</span>
        <span class="meter-value">{session.phase}</span>
      </span>
      <span class="crown-sep">·</span>
      <span
        class="activity-glyph"
        class:pulling={session.pulling}
        class:stalled={session.stalled}
        title="{sessionActivityLabel} · {session.buffers} buffer{session.buffers === 1 ? '' : 's'}"
      >
        <span class="status-dot" data-status={sessionActivityStatus}></span>
        <span class="activity-label">{sessionActivityLabel}</span>
        <span class="activity-buf">{session.buffers}</span>
      </span>
    </div>

    <!-- right crown: tab strip. newest sits next to viket, older flow right -->
    <div class="crown-population crown-right">
      <div class="crown-tabs">
        {#each terminals as terminal (terminal.id)}
          <button
            class="crown-tab"
            class:active={terminal.active}
            title={fullTitleFor(terminal)}
            onclick={() => activateTerminal(terminal.id)}
          >
            <span class="tab-title" dir="rtl">{titleFor(terminal)}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div
    class="bone spine"
    style:left="{bones.spine.left}px"
    style:top="{bones.spine.top}px"
    style:width="{bones.spine.width}px"
    style:height="{bones.spine.height}px"
  >
    <div class="spine-scanline"></div>
    <div class="spine-endcap"></div>
    <div class="spine-population">
      <div class="spine-slot" title={"lighthouses\n" + lighthouseTooltip}>
        <span class="status-dot lg" data-status={lighthouseAggregate}></span>
        <span class="spine-glyph">L</span>
      </div>
      <div class="spine-rule"></div>
      <div class="spine-slot" title={"daemon · " + daemon.status + " · " + daemon.latencyMs + "ms"}>
        <span class="status-dot lg" data-status={daemon.status}></span>
        <span class="spine-glyph">D</span>
      </div>
    </div>
  </div>

  <!-- G/H overlays -->
  {#if overlays.g}
    <SkeletonProvider level={4}>
    <div class="overlay overlay-g">
      <div class="overlay-modeline">
        <span class="hud-seg hi">G</span>
        <span class="hud-sep">›</span>
        <span class="hud-seg lo">system tray</span>
        <span class="hud-spacer"></span>
        <button class="hud-btn close" onclick={() => toggleOverlay("g")}>×</button>
      </div>
      <div class="overlay-body">
        <div class="placeholder">— operational alerts —</div>
        <div class="placeholder">— above-the-hood errors —</div>
        <div class="placeholder">— failed generations —</div>
        <div class="placeholder">— i/o schema errors —</div>
      </div>
    </div>
    </SkeletonProvider>
  {/if}

  {#if systemAlert}
    <div class="system-alert-rail" title="one or more services are down"></div>
  {/if}

  {#if overlays.h}
    <SkeletonProvider level={0}>
    <div class="overlay overlay-h">
      <span class="hud-seg hi">H</span>
      <span class="hud-sep">›</span>
      <span class="hud-seg hi">orient {orientation}°</span>
      <span class="hud-sep">›</span>
      <span class="hud-seg">viket {Math.round(viket.x)}·{Math.round(viket.y)}</span>
      <span class="hud-sep">›</span>
      <span class="hud-seg lo">prev {Math.round(previous.x)}·{Math.round(previous.y)}</span>
      <span class="hud-sep">›</span>
      <span class="hud-seg lo">home {Math.round(standard.x)}·{Math.round(standard.y)}</span>
      <span class="hud-spacer"></span>
      <span class="hud-hint">1·home · 2·swap · 3·set · hold·rotate</span>
      <button
        class="hud-btn"
        class:on={overlays.g}
        onclick={() => toggleOverlay("g")}
        title="toggle G — system tray"
      >G</button>
    </div>
    </SkeletonProvider>
  {/if}

  <!-- viket — square at the junction -->
  <div
    class="viket"
    class:dragging={gesture.isDragging}
    class:longpress={gesture.isLongPress}
    class:sticky={radial.sticky}
    class:tap1={flash === "tap1"}
    class:tap2={flash === "tap2"}
    class:tap3={flash === "tap3"}
    style:left="{viket.x}px"
    style:top="{viket.y}px"
    style:width="{VIKET_SIZE}px"
    style:height="{VIKET_SIZE}px"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  >
    <img class="viket-pictogram" src="/images/pictogram_viket/pic-vinca-viket_white.svg" alt="viket" draggable="false" />
  </div>

  <!-- radial menu -->
  {#if radial.show && radial.sticky}
    <div
      class="radial-backdrop"
      onclick={onRadialBackdropClick}
      role="presentation"
    ></div>
  {/if}

  {#if radial.show}
    <div
      class="radial"
      class:sticky={radial.sticky}
      style:left="{viket.x}px"
      style:top="{viket.y}px"
      style:--radius="{RADIAL_RADIUS}px"
    >
      <div class="radial-ring"></div>
      {#each [0, 90, 180, 270] as angle}
        <div
          class="radial-target"
          class:active={radial.snap === angle}
          style:transform="rotate({angle}deg) translate(var(--radius)) rotate(-{angle}deg)"
          onpointerdown={(event) => onSpokeClick(event, angle)}
        >
          {snapLabel(angle)}
        </div>
      {/each}
    </div>
  {/if}

{/if}

<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    overscroll-behavior: none;
    background: var(--colors-skeleton-0-surface);
    font-family: var(--font-family-code);
  }

  /* panels */
  .panel {
    position: fixed;
    display: grid;
    place-items: center;
    overflow: hidden;
    transition: background 0.12s;
  }
  .panel-a {
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
  }
  .panel-b {
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
  }
  .panel-c {
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
  }
  .label {
    font-size: 64px;
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }

  /* D/E/F sub-panels inside C — flex with margin & curl */
  .def {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .def-panel {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: none;
    border-radius: 0;
  }
  .pane-body {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .def-d {
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
  }
  .def-e {
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    align-items: center;
    justify-content: center;
  }
  .def-f {
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
  }
  .def-label {
    font-size: 36px;
    font-weight: 900;
    opacity: 0.4;
    color: var(--colors-skeleton-2-contrast);
    user-select: none;
  }

  /* twigs — thin bones. they ARE the boundary between panes.
     no own border, no radius. ~12px wide, full height of the def row. */
  .twig {
    flex: 0 0 12px;
    min-width: 12px;
    background: var(--colors-skeleton-1-surface);
    border: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
    user-select: none;
  }
  .twig.closed {
    background: var(--colors-skeleton-1-surface);
  }
  .twig-toggle {
    width: 100%;
    height: 14px;
    background: transparent;
    border: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    line-height: 1;
    padding: 0;
    cursor: pointer;
  }
  .twig-toggle:hover {
    color: var(--colors-skeleton-0-boundary);
  }
  .twig-handle {
    flex: 0 0 24px;
    height: 24px;
    width: 4px;
    margin: auto 0;   /* vertically center in the twig column */
    background: var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    opacity: 0.4;
    cursor: ew-resize;
    align-self: center;
    touch-action: none;
  }
  .twig-handle.dragging {
    opacity: 0.9;
    cursor: ew-resize;
    background: var(--colors-skeleton-0-primary-base);
  }
  .twig-handle:active {
    cursor: grabbing;
    opacity: 0.8;
  }

  /* bones — structural ribbons. crown reads as quiet ground;
     viket is the keystone where they meet. spine carries telemetry. */
  .bone {
    position: fixed;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-0-boundary);
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  /* crown bone vanishes into panel-1 surface so it doesn't compete
     with the H modeline at top. it remains a structural seam, not a stripe. */
  .bone.crown {
    background: var(--colors-skeleton-1-surface);
    border-top-color: var(--colors-skeleton-1-boundary);
    border-bottom-color: var(--colors-skeleton-1-boundary);
    border-left: none;
    border-right: none;
  }

  /* crown populations — two absolutely-positioned regions inside the crown
     bone, one on each side of the viket. bone has pointer-events:none so
     viket drag still works; interactive children opt back in. */
  .crown-population {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
    color: var(--colors-skeleton-1-contrast);
    pointer-events: none;
    /* clip anything that tries to escape this region. critical for
       when viket is dragged near an edge — the short side shouldn't
       bleed into the long side. */
    overflow: hidden;
  }
  /* right region — phase + activity, anchored to the far right end */
  .crown-population.crown-right {
    /* starts past the viket, ends at the right edge of the crown */
    left: calc(var(--viket-x) + 30px);
    right: 0;
    padding-right: 16px;
    justify-content: flex-end;
  }
  /* left region — meters (phase + activity), ends before the viket */
  .crown-population.crown-left {
    left: 0;
    /* ends before the viket (viket is at --viket-x, half-width 22.5px) */
    right: calc(100% - var(--viket-x) + 30px);
    padding-left: 16px;
    /* container query: hide meters entirely when the region is
       too narrow to carry them. overflow:hidden would just clip
       ugly mid-word. */
    container-type: inline-size;
    container-name: crownleft;
  }
  @container crownleft (max-width: 190px) {
    .crown-meter,
    .crown-sep,
    .activity-glyph {
      display: none;
    }
  }
  .crown-population > * {
    pointer-events: auto;
  }
  .crown-sep {
    color: var(--colors-skeleton-0-boundary);
    opacity: 0.6;
  }

  /* tab strip inside crown-left. row-reverse so the newest/rightmost tab
     in data order sits closest to the viket, older tabs flow left.
     horizontal scroll when overflowing. */
  /* tab strip — row direction flows away from the viket.
     in crown-right, newest (terminals[0]) sits leftmost (next to viket)
     and older tabs flow right. horizontal scroll when overflowing. */
  .crown-tabs {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3px;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0 2px;
  }
  .crown-tabs::-webkit-scrollbar {
    display: none;
  }
  .crown-tab {
    flex: 0 0 auto;
    max-width: 96px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    padding: 0 5px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.02em;
    text-transform: lowercase;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.12s, background 0.12s, border-color 0.12s;
  }
  .crown-tab:hover {
    opacity: 0.85;
    background: var(--colors-skeleton-0-surface);
  }
  .crown-tab.active {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    background: var(--colors-skeleton-0-surface);
  }
  /* stem-cut: ellipsis on the LEFT so the tail (most specific crumb)
     stays visible. `direction: rtl` flips the line end onto the left
     so text-overflow: ellipsis renders its ellipsis there. characters
     themselves still flow LTR because Latin letters are strong-LTR. */
  .crown-tab .tab-title {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl;
    text-align: right;
  }
  /* inject a Left-to-Right Mark so punctuation in Latin text
     (e.g. "home/learn/grammar") stays in the right visual order
     even though the paragraph is RTL. */
  .crown-tab .tab-title::before {
    content: "\200E";
  }

  /* spine scanline — slow vertical heartbeat sweep, barely there.
     1Hz, primary aqua, opacity ~6%. signals "the system is alive." */
  .spine-scanline {
    position: absolute;
    left: 0;
    right: 0;
    top: 45px;          /* below the viket */
    height: 8px;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--colors-skeleton-0-primary-base) 50%,
      transparent 100%
    );
    opacity: 0.18;
    animation: spine-heartbeat 4s linear infinite;
  }
  @keyframes spine-heartbeat {
    0%   { transform: translateY(0); opacity: 0; }
    20%  { opacity: 0.18; }
    100% { transform: translateY(calc(100vh - 100px)); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .spine-scanline { display: none; }
  }

  /* spine endcap — small aqua mark just below the viket, marks origin */
  .spine-endcap {
    position: absolute;
    left: 50%;
    top: 47px;
    transform: translateX(-50%);
    width: 12px;
    height: 1px;
    background: var(--colors-skeleton-0-primary-base);
    opacity: 0.55;
    pointer-events: none;
  }

  /* spine population — aggregated lighthouse + daemon. one slot per cluster.
     padding-top clears the viket which sits over the spine's first 45px. */
  .spine-population {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    padding: 56px 0 14px;
    pointer-events: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
  }
  .spine-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .spine-glyph {
    font-size: 8px;
    line-height: 1;
    letter-spacing: 0.06em;
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.55;
    text-transform: uppercase;
  }
  .spine-rule {
    width: 16px;
    height: 1px;
    background: var(--colors-skeleton-0-boundary);
    opacity: 0.35;
  }

  /* status dot — single source of truth for cluster health */
  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-success-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-success-base);
    transition: background 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .status-dot.lg {
    width: 9px;
    height: 9px;
    box-shadow: 0 0 6px var(--colors-skeleton-0-success-base);
  }
  .status-dot[data-status="lag"] {
    background: var(--colors-skeleton-0-warning-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-warning-base);
  }
  .status-dot.lg[data-status="lag"] {
    box-shadow: 0 0 6px var(--colors-skeleton-0-warning-base);
  }
  .status-dot[data-status="down"] {
    background: var(--colors-skeleton-0-danger-base);
    box-shadow: 0 0 6px var(--colors-skeleton-0-danger-base);
  }
  .status-dot.lg[data-status="down"] {
    box-shadow: 0 0 8px var(--colors-skeleton-0-danger-base);
  }

  /* crown meters — phase / activity */
  .crown-meter {
    display: inline-flex;
    flex-direction: row;
    align-items: baseline;
    gap: 5px;
    white-space: nowrap;
    color: var(--colors-skeleton-0-contrast);
  }
  .crown-meter .meter-label {
    opacity: 0.45;
    text-transform: lowercase;
    letter-spacing: 0.06em;
  }
  .crown-meter .meter-value {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* activity glyph — single compound segment carrying state + buffer count */
  .activity-glyph {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 7px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 3px;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    line-height: 1;
  }
  .activity-glyph .activity-label {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .activity-glyph .activity-buf {
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.55;
    font-size: 9px;
    padding-left: 5px;
    margin-left: 1px;
    border-left: 1px solid var(--colors-skeleton-0-boundary);
  }
  .activity-glyph.pulling {
    border-color: var(--colors-skeleton-0-warning-base);
  }
  .activity-glyph.pulling .activity-label {
    color: var(--colors-skeleton-0-warning-base);
  }
  .activity-glyph.stalled {
    border-color: var(--colors-skeleton-0-danger-base);
  }
  .activity-glyph.stalled .activity-label {
    color: var(--colors-skeleton-0-danger-base);
  }
  /* pull state animates: thin aqua sweep along the bottom border */
  .activity-glyph.pulling {
    position: relative;
    overflow: hidden;
  }
  .activity-glyph.pulling::after {
    content: "";
    position: absolute;
    left: -30%;
    bottom: 0;
    width: 30%;
    height: 1px;
    background: var(--colors-skeleton-0-warning-base);
    box-shadow: 0 0 6px var(--colors-skeleton-0-warning-base);
    animation: pull-sweep 1.4s ease-in-out infinite;
  }
  @keyframes pull-sweep {
    0%   { left: -30%; }
    100% { left: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .activity-glyph.pulling::after { display: none; }
  }

  /* system alert rail — 1px vermillion strip at the very top of the viewport.
     only visible when worst-of-system is "down". danger-without-shouting. */
  .system-alert-rail {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    height: 1px;
    background: var(--colors-skeleton-0-danger-base);
    box-shadow: 0 0 12px var(--colors-skeleton-0-danger-base);
    z-index: 200;
    pointer-events: none;
  }

  /* viket — the keystone where spine meets crown.
     primary brand element. heavy border, inset glow, structural mass. */
  .viket {
    position: fixed;
    transform: translate(-50%, -50%);
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    border: 2px solid var(--colors-skeleton-0-primary-base);
    border-radius: 0;
    display: grid;
    place-items: center;
    cursor: grab;
    touch-action: none;
    user-select: none;
    z-index: 100;
    box-shadow:
      inset 0 0 12px rgba(30, 188, 181, 0.2),
      0 0 0 1px var(--colors-skeleton-0-surface),
      0 6px 22px rgba(0, 0, 0, 0.65);
    transition:
      background 0.12s,
      box-shadow 0.12s,
      border-color 0.12s;
  }
  .viket:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .viket.dragging {
    cursor: grabbing;
    background: var(--colors-skeleton-2-surface);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7);
  }
  .viket.longpress {
    background: var(--colors-skeleton-0-accent-base);
    border-color: var(--colors-skeleton-0-accent-base);
    color: var(--colors-skeleton-0-contrast);
  }
  .viket.sticky {
    background: var(--colors-skeleton-0-accent-base);
    border-color: var(--colors-skeleton-0-accent-base);
    color: var(--colors-skeleton-0-contrast);
    animation: viket-sticky-pulse 1.6s ease-in-out infinite;
  }
  @keyframes viket-sticky-pulse {
    0%, 100% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5); }
    50% { box-shadow: 0 4px 24px var(--colors-skeleton-0-accent-base); }
  }
  .viket.tap1 {
    background: var(--colors-skeleton-0-info-base);
    border-color: var(--colors-skeleton-0-info-base);
    color: var(--colors-skeleton-0-info-base);
  }
  .viket.tap2 {
    background: var(--colors-skeleton-0-success-base);
    border-color: var(--colors-skeleton-0-success-base);
    color: var(--colors-skeleton-0-success-base);
  }
  .viket.tap3 {
    background: var(--colors-skeleton-0-warning-base);
    border-color: var(--colors-skeleton-0-warning-base);
    color: var(--colors-skeleton-0-warning-base);
  }
  .viket-pictogram {
    width: 36px;
    height: 36px;
    object-fit: contain;
    user-select: none;
    pointer-events: none;
    -webkit-user-drag: none;
    transform-origin: center center;
    transform: scaleY(1);
    transition: transform 0.18s ease-out, filter 0.18s ease-out;
    /* tint the white svg toward primary aqua so it reads as the brand keystone.
       drop-shadow gives the cathode glow. */
    filter:
      brightness(0) saturate(100%)
      invert(72%) sepia(45%) saturate(1156%) hue-rotate(133deg) brightness(94%) contrast(89%)
      drop-shadow(0 0 4px var(--colors-skeleton-0-primary-base));
  }
  /* drag closes the eye; release re-opens it */
  .viket.dragging .viket-pictogram {
    transform: scaleX(1.2) scaleY(0.1);
    transition: transform 0.08s ease-in;
  }
  @media (prefers-reduced-motion: reduce) {
    .viket-pictogram { transition: none !important; }
  }

  /* radial menu */
  .radial-backdrop {
    position: fixed;
    inset: 0;
    z-index: 89;
    background: transparent;
    cursor: pointer;
  }
  .radial {
    position: fixed;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 90;
  }
  .radial-ring {
    position: absolute;
    left: 0;
    top: 0;
    width: calc(var(--radius) * 2);
    height: calc(var(--radius) * 2);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background:
      conic-gradient(
        from 0deg,
        var(--colors-skeleton-0-danger-base),
        var(--colors-skeleton-0-warning-base),
        var(--colors-skeleton-0-success-base),
        var(--colors-skeleton-0-info-base),
        var(--colors-skeleton-0-primary-base),
        var(--colors-skeleton-0-accent-base),
        var(--colors-skeleton-0-danger-base)
      );
    opacity: 0.55;
    box-shadow: 0 0 48px rgba(0, 0, 0, 0.7);
  }
  .radial.sticky .radial-ring {
    opacity: 0.7;
    animation: radial-sticky-pulse 1.6s ease-in-out infinite;
  }
  @keyframes radial-sticky-pulse {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 0.85; }
  }
  .radial-target {
    position: absolute;
    left: -22px;
    top: -22px;
    width: 44px;
    height: 44px;
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 22px;
    font-weight: bold;
    -webkit-tap-highlight-color: transparent;
  }
  .radial.sticky .radial-target {
    pointer-events: auto;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  .radial.sticky .radial-target:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .radial-target.active {
    background: var(--colors-skeleton-0-accent-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-accent-base);
    box-shadow: 0 0 20px var(--colors-skeleton-0-accent-base);
  }

  /* G + H overlays — floating modeline panels */
  .overlay {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 80;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .overlay-g {
    top: 16px;
    right: 16px;
    bottom: 16px;
    width: min(300px, calc(100vw - 32px));
  }
  .overlay-h {
    /* h is a full-width 50px bar overlay at the top, sticky open.
       overrides .overlay's column layout / radius / box border. */
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    width: auto;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    overflow: hidden;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }
  .overlay-h .hud-seg,
  .overlay-h .hud-sep,
  .overlay-h .hud-hint {
    font-size: 9px;
    letter-spacing: 0.08em;
  }
  .overlay-h .hud-btn {
    font-size: 9px;
    height: 20px;
    min-width: 24px;
    padding: 0 7px;
  }
  @keyframes slide-in-right {
    from { transform: translateX(120%); }
    to { transform: translateX(0); }
  }
  @keyframes slide-in-top {
    from { transform: translateY(-120%); }
    to { transform: translateY(0); }
  }
  .overlay-modeline {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 6px 0 14px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: 11px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .overlay-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    font-size: 11px;
    color: var(--colors-skeleton-2-contrast);
    -webkit-overflow-scrolling: touch;
  }
  .hud-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
    white-space: nowrap;
  }
  .placeholder {
    padding: 6px 0;
    opacity: 0.6;
    border-bottom: 1px dashed var(--colors-skeleton-1-boundary);
  }
  .state-dump {
    margin-top: 12px;
    padding: 10px;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 4px;
    font-family: var(--font-family-code);
    font-size: 10px;
    line-height: 1.4;
    white-space: pre;
    overflow-x: auto;
  }

  /* hud segments — used inside the H overlay */
  .hud-seg {
    white-space: nowrap;
  }
  .hud-seg.hi {
    color: var(--colors-skeleton-1-contrast);
    font-weight: 600;
  }
  .hud-seg.lo {
    color: var(--colors-skeleton-2-contrast);
  }
  .hud-sep {
    color: var(--colors-skeleton-0-boundary);
    font-size: 10px;
    flex-shrink: 0;
  }
  .hud-spacer {
    flex: 1;
    min-width: 0;
  }
  .hud-hint {
    color: var(--colors-skeleton-2-contrast);
    font-size: 10px;
    opacity: 0.6;
    white-space: nowrap;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed var(--colors-skeleton-0-boundary);
  }
  .hud-btn {
    height: 22px;
    min-width: 26px;
    padding: 0 8px;
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.08em;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.12s;
  }
  .hud-btn:hover {
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-1-contrast);
  }
  .hud-btn.on {
    background: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-boundary);
  }
  .hud-btn.close {
    border: none;
    font-size: 18px;
    height: 28px;
    padding: 0 10px;
    color: var(--colors-skeleton-2-contrast);
  }
  .hud-btn.close:hover {
    background: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }

  @media (max-width: 600px) {
    .overlay-g {
      left: 12px;
      right: 12px;
      width: auto;
    }
    /* h is full-width — already left:0 right:0 */
    .hud-hint { display: none; }
  }
</style>

<!-- <\!-- -->
<!--   pip — t-bone layout prototype. -->

<!--   the viket sits at the junction of crown and spine. dragging the viket -->
<!--   moves the entire T. taps mutate the layout state machine. long-press -->
<!--   opens a rainbow radial to pick stem orientation. -->

<!--   panels: A (across the cross), B (one side of the stem), C (other side). -->
<!--   bones:  crown (perpendicular to stem) + spine (the stem itself). -->
<!--   viket:  the junction. always at (crown ∩ spine). draggable. -->

<!--   filename uses +page@.svelte to break out of the parent +layout.svelte -->
<!--   gate (lighthouse boot, login, loader). this page renders standalone. -->
<!-- -\-> -->
<!-- <script> -->
<!--   import "@vivalence/dapper/font.css"; -->
<!--   import "../../client.css"; -->
<!--   import { onMount } from "svelte"; -->

<!--   const BONE_THICKNESS = 56; -->
<!--   const VIKET_SIZE = 64; -->
<!--   const EDGE_PADDING = 56; -->
<!--   const TAP_MAX_MS = 250; -->
<!--   const TAP_MAX_MOVE = 8; -->
<!--   const MULTI_TAP_WINDOW = 260; -->
<!--   const LONG_PRESS_MS = 420; -->
<!--   const RADIAL_RADIUS = 104; -->

<!--   // viket position in viewport pixels -->
<!--   let viket = $state({ x: 200, y: 240 }); -->
<!--   let previous = $state({ x: 200, y: 240 }); -->
<!--   let standard = $state({ x: 200, y: 240 }); -->

<!--   // 0 = stem-down (default T), 90 = stem-right, 180 = stem-up, 270 = stem-left -->
<!--   let orientation = $state(0); -->

<!--   let viewport = $state({ width: 0, height: 0 }); -->

<!--   let gesture = $state({ -->
<!--     pointerId: null, -->
<!--     downAt: 0, -->
<!--     downX: 0, -->
<!--     downY: 0, -->
<!--     startViketX: 0, -->
<!--     startViketY: 0, -->
<!--     tapCount: 0, -->
<!--     tapTimer: null, -->
<!--     longPressTimer: null, -->
<!--     isDragging: false, -->
<!--     isLongPress: false, -->
<!--   }); -->

<!--   let radial = $state({ show: false, snap: 90 }); -->
<!--   let flash = $state(null); -->

<!--   function clamp(value, low, high) { -->
<!--     return Math.max(low, Math.min(high, value)); -->
<!--   } -->

<!--   // panel rectangles for the current orientation + viket position -->
<!--   function rectsForOrientation(orientation, viket, viewportWidth, viewportHeight) { -->
<!--     if (orientation === 0) { -->
<!--       return { -->
<!--         a: { left: 0, top: 0, width: viewportWidth, height: viket.y }, -->
<!--         b: { left: 0, top: viket.y, width: viket.x, height: viewportHeight - viket.y }, -->
<!--         c: { left: viket.x, top: viket.y, width: viewportWidth - viket.x, height: viewportHeight - viket.y }, -->
<!--       }; -->
<!--     } -->
<!--     if (orientation === 90) { -->
<!--       return { -->
<!--         a: { left: 0, top: 0, width: viket.x, height: viewportHeight }, -->
<!--         b: { left: viket.x, top: 0, width: viewportWidth - viket.x, height: viket.y }, -->
<!--         c: { left: viket.x, top: viket.y, width: viewportWidth - viket.x, height: viewportHeight - viket.y }, -->
<!--       }; -->
<!--     } -->
<!--     if (orientation === 180) { -->
<!--       return { -->
<!--         a: { left: 0, top: viket.y, width: viewportWidth, height: viewportHeight - viket.y }, -->
<!--         b: { left: viket.x, top: 0, width: viewportWidth - viket.x, height: viket.y }, -->
<!--         c: { left: 0, top: 0, width: viket.x, height: viket.y }, -->
<!--       }; -->
<!--     } -->
<!--     if (orientation === 270) { -->
<!--       return { -->
<!--         a: { left: viket.x, top: 0, width: viewportWidth - viket.x, height: viewportHeight }, -->
<!--         b: { left: 0, top: 0, width: viket.x, height: viket.y }, -->
<!--         c: { left: 0, top: viket.y, width: viket.x, height: viewportHeight - viket.y }, -->
<!--       }; -->
<!--     } -->
<!--   } -->

<!--   function bonesForOrientation(orientation, viket, viewportWidth, viewportHeight) { -->
<!--     const thickness = BONE_THICKNESS; -->
<!--     const halfThickness = thickness / 2; -->
<!--     if (orientation === 0) { -->
<!--       return { -->
<!--         crown: { left: 0, top: viket.y - halfThickness, width: viewportWidth, height: thickness }, -->
<!--         spine: { left: viket.x - halfThickness, top: viket.y - halfThickness, width: thickness, height: viewportHeight - viket.y + halfThickness }, -->
<!--       }; -->
<!--     } -->
<!--     if (orientation === 90) { -->
<!--       return { -->
<!--         crown: { left: viket.x - halfThickness, top: 0, width: thickness, height: viewportHeight }, -->
<!--         spine: { left: viket.x - halfThickness, top: viket.y - halfThickness, width: viewportWidth - viket.x + halfThickness, height: thickness }, -->
<!--       }; -->
<!--     } -->
<!--     if (orientation === 180) { -->
<!--       return { -->
<!--         crown: { left: 0, top: viket.y - halfThickness, width: viewportWidth, height: thickness }, -->
<!--         spine: { left: viket.x - halfThickness, top: 0, width: thickness, height: viket.y + halfThickness }, -->
<!--       }; -->
<!--     } -->
<!--     if (orientation === 270) { -->
<!--       return { -->
<!--         crown: { left: viket.x - halfThickness, top: 0, width: thickness, height: viewportHeight }, -->
<!--         spine: { left: 0, top: viket.y - halfThickness, width: viket.x + halfThickness, height: thickness }, -->
<!--       }; -->
<!--     } -->
<!--   } -->

<!--   let rects = $derived(rectsForOrientation(orientation, viket, viewport.width, viewport.height)); -->
<!--   let bones = $derived(bonesForOrientation(orientation, viket, viewport.width, viewport.height)); -->

<!--   // angle (drag direction in screen-space) → orientation (which way the stem points) -->
<!--   // angle 0   = drag right  → snap 0   → orientation 90  (stem points right) -->
<!--   // angle 90  = drag down   → snap 90  → orientation 0   (stem points down) -->
<!--   // angle 180 = drag left   → snap 180 → orientation 270 (stem points left) -->
<!--   // angle 270 = drag up     → snap 270 → orientation 180 (stem points up) -->
<!--   function snapToOrientation(snapAngle) { -->
<!--     return ({ 0: 90, 90: 0, 180: 270, 270: 180 })[snapAngle] ?? 0; -->
<!--   } -->
<!--   function orientationToSnap(currentOrientation) { -->
<!--     return ({ 0: 90, 90: 0, 180: 270, 270: 180 })[currentOrientation] ?? 90; -->
<!--   } -->
<!--   function snapLabel(angle) { -->
<!--     return ({ 0: "→", 90: "↓", 180: "←", 270: "↑" })[angle] ?? ""; -->
<!--   } -->

<!--   function onPointerDown(event) { -->
<!--     event.preventDefault(); -->
<!--     event.currentTarget.setPointerCapture(event.pointerId); -->
<!--     gesture.pointerId = event.pointerId; -->
<!--     gesture.downAt = Date.now(); -->
<!--     gesture.downX = event.clientX; -->
<!--     gesture.downY = event.clientY; -->
<!--     gesture.startViketX = viket.x; -->
<!--     gesture.startViketY = viket.y; -->
<!--     gesture.isDragging = false; -->
<!--     gesture.isLongPress = false; -->

<!--     clearTimeout(gesture.longPressTimer); -->
<!--     gesture.longPressTimer = setTimeout(() => { -->
<!--       if (gesture.isDragging) return; -->
<!--       gesture.isLongPress = true; -->
<!--       radial.show = true; -->
<!--       radial.snap = orientationToSnap(orientation); -->
<!--       if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8); -->
<!--     }, LONG_PRESS_MS); -->
<!--   } -->

<!--   function onPointerMove(event) { -->
<!--     if (gesture.pointerId !== event.pointerId) return; -->

<!--     const deltaX = event.clientX - gesture.downX; -->
<!--     const deltaY = event.clientY - gesture.downY; -->
<!--     const distance = Math.hypot(deltaX, deltaY); -->

<!--     if (gesture.isLongPress) { -->
<!--       const angle = (Math.atan2(event.clientY - viket.y, event.clientX - viket.x) * 180 / Math.PI + 360) % 360; -->
<!--       radial.snap = (Math.round(angle / 90) * 90) % 360; -->
<!--       return; -->
<!--     } -->

<!--     if (!gesture.isDragging && distance > TAP_MAX_MOVE) { -->
<!--       clearTimeout(gesture.longPressTimer); -->
<!--       gesture.isDragging = true; -->
<!--     } -->

<!--     if (gesture.isDragging) { -->
<!--       viket.x = clamp(gesture.startViketX + deltaX, EDGE_PADDING, viewport.width - EDGE_PADDING); -->
<!--       viket.y = clamp(gesture.startViketY + deltaY, EDGE_PADDING, viewport.height - EDGE_PADDING); -->
<!--     } -->
<!--   } -->

<!--   function onPointerUp(event) { -->
<!--     if (gesture.pointerId !== event.pointerId) return; -->
<!--     clearTimeout(gesture.longPressTimer); -->
<!--     try { -->
<!--       event.currentTarget.releasePointerCapture(event.pointerId); -->
<!--     } catch (releaseError) { -->
<!--       // pointer already released -->
<!--     } -->
<!--     gesture.pointerId = null; -->

<!--     if (gesture.isLongPress) { -->
<!--       orientation = snapToOrientation(radial.snap); -->
<!--       radial.show = false; -->
<!--       gesture.isLongPress = false; -->
<!--       if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12); -->
<!--       return; -->
<!--     } -->

<!--     if (gesture.isDragging) { -->
<!--       previous = { x: gesture.startViketX, y: gesture.startViketY }; -->
<!--       gesture.isDragging = false; -->
<!--       return; -->
<!--     } -->

<!--     const elapsed = Date.now() - gesture.downAt; -->
<!--     if (elapsed < TAP_MAX_MS) { -->
<!--       gesture.tapCount++; -->
<!--       clearTimeout(gesture.tapTimer); -->
<!--       gesture.tapTimer = setTimeout(() => { -->
<!--         handleTaps(gesture.tapCount); -->
<!--         gesture.tapCount = 0; -->
<!--       }, MULTI_TAP_WINDOW); -->
<!--     } -->
<!--   } -->

<!--   function handleTaps(count) { -->
<!--     if (count === 1) { -->
<!--       // single tap: swap with previous -->
<!--       const swap = { ...previous }; -->
<!--       previous = { ...viket }; -->
<!--       viket = swap; -->
<!--       pulse("tap1"); -->
<!--     } else if (count === 2) { -->
<!--       // double tap: jump to standard -->
<!--       previous = { ...viket }; -->
<!--       viket = { ...standard }; -->
<!--       pulse("tap2"); -->
<!--     } else if (count >= 3) { -->
<!--       // triple tap: mark current as standard -->
<!--       standard = { ...viket }; -->
<!--       pulse("tap3"); -->
<!--     } -->
<!--   } -->

<!--   function pulse(kind) { -->
<!--     flash = kind; -->
<!--     setTimeout(() => { -->
<!--       flash = null; -->
<!--     }, 240); -->
<!--   } -->

<!--   function onResize() { -->
<!--     viewport.width = window.innerWidth; -->
<!--     viewport.height = window.innerHeight; -->
<!--     viket.x = clamp(viket.x, EDGE_PADDING, viewport.width - EDGE_PADDING); -->
<!--     viket.y = clamp(viket.y, EDGE_PADDING, viewport.height - EDGE_PADDING); -->
<!--   } -->

<!--   onMount(() => { -->
<!--     viewport.width = window.innerWidth; -->
<!--     viewport.height = window.innerHeight; -->

<!--     viket = { x: viewport.width / 2, y: viewport.height * 0.4 }; -->
<!--     previous = { ...viket }; -->
<!--     standard = { ...viket }; -->

<!--     window.addEventListener("resize", onResize); -->
<!--     return () => { -->
<!--       window.removeEventListener("resize", onResize); -->
<!--     }; -->
<!--   }); -->
<!-- </script> -->

<!-- <svelte:head> -->
<!--   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" /> -->
<!--   <title>pip · t-bone</title> -->
<!-- </svelte:head> -->

<!-- {#if viewport.width > 0 && viewport.height > 0} -->
<!--   <div -->
<!--     class="panel panel-a" -->
<!--     style:left="{rects.a.left}px" -->
<!--     style:top="{rects.a.top}px" -->
<!--     style:width="{rects.a.width}px" -->
<!--     style:height="{rects.a.height}px" -->
<!--   > -->
<!--     <span class="label">A</span> -->
<!--   </div> -->

<!--   <div -->
<!--     class="bone crown" -->
<!--     style:left="{bones.crown.left}px" -->
<!--     style:top="{bones.crown.top}px" -->
<!--     style:width="{bones.crown.width}px" -->
<!--     style:height="{bones.crown.height}px" -->
<!--   ></div> -->

<!--   <div -->
<!--     class="panel panel-b" -->
<!--     style:left="{rects.b.left}px" -->
<!--     style:top="{rects.b.top}px" -->
<!--     style:width="{rects.b.width}px" -->
<!--     style:height="{rects.b.height}px" -->
<!--   > -->
<!--     <span class="label">B</span> -->
<!--   </div> -->

<!--   <div -->
<!--     class="bone spine" -->
<!--     style:left="{bones.spine.left}px" -->
<!--     style:top="{bones.spine.top}px" -->
<!--     style:width="{bones.spine.width}px" -->
<!--     style:height="{bones.spine.height}px" -->
<!--   ></div> -->

<!--   <div -->
<!--     class="panel panel-c" -->
<!--     style:left="{rects.c.left}px" -->
<!--     style:top="{rects.c.top}px" -->
<!--     style:width="{rects.c.width}px" -->
<!--     style:height="{rects.c.height}px" -->
<!--   > -->
<!--     <span class="label">C</span> -->
<!--   </div> -->

<!--   <div -->
<!--     class="viket" -->
<!--     class:dragging={gesture.isDragging} -->
<!--     class:longpress={gesture.isLongPress} -->
<!--     class:tap1={flash === "tap1"} -->
<!--     class:tap2={flash === "tap2"} -->
<!--     class:tap3={flash === "tap3"} -->
<!--     style:left="{viket.x}px" -->
<!--     style:top="{viket.y}px" -->
<!--     style:width="{VIKET_SIZE}px" -->
<!--     style:height="{VIKET_SIZE}px" -->
<!--     onpointerdown={onPointerDown} -->
<!--     onpointermove={onPointerMove} -->
<!--     onpointerup={onPointerUp} -->
<!--     onpointercancel={onPointerUp} -->
<!--   > -->
<!--     <span class="logo">★</span> -->
<!--   </div> -->

<!--   {#if radial.show} -->
<!--     <div -->
<!--       class="radial" -->
<!--       style:left="{viket.x}px" -->
<!--       style:top="{viket.y}px" -->
<!--       style:--radius="{RADIAL_RADIUS}px" -->
<!--     > -->
<!--       <div class="radial-ring"></div> -->
<!--       {#each [0, 90, 180, 270] as angle} -->
<!--         <div -->
<!--           class="radial-target" -->
<!--           class:active={radial.snap === angle} -->
<!--           style:transform="rotate({angle}deg) translate(var(--radius)) rotate(-{angle}deg)" -->
<!--         > -->
<!--           {snapLabel(angle)} -->
<!--         </div> -->
<!--       {/each} -->
<!--     </div> -->
<!--   {/if} -->

<!--   <div class="hud"> -->
<!--     <div>orient {orientation}°</div> -->
<!--     <div>viket {Math.round(viket.x)}·{Math.round(viket.y)}</div> -->
<!--     <div>prev  {Math.round(previous.x)}·{Math.round(previous.y)}</div> -->
<!--     <div>std   {Math.round(standard.x)}·{Math.round(standard.y)}</div> -->
<!--     <div class="hint"> -->
<!--       tap·swap · 2tap·home · 3tap·set<br /> -->
<!--       hold·rotate · drag·move -->
<!--     </div> -->
<!--   </div> -->
<!-- {/if} -->

<!-- <style> -->
<!--   :global(html), -->
<!--   :global(body) { -->
<!--     margin: 0; -->
<!--     padding: 0; -->
<!--     overflow: hidden; -->
<!--     overscroll-behavior: none; -->
<!--     background: var(--colors-skeleton-app-surface); -->
<!--     font-family: var(--font-family-code); -->
<!--   } -->

<!--   .panel { -->
<!--     position: fixed; -->
<!--     display: grid; -->
<!--     place-items: center; -->
<!--     overflow: hidden; -->
<!--     transition: background 0.12s; -->
<!--   } -->
<!--   .panel-a { -->
<!--     background: var(--colors-skeleton-1-surface); -->
<!--     color: var(--colors-skeleton-1-contrast); -->
<!--   } -->
<!--   .panel-b { -->
<!--     background: var(--colors-skeleton-2-surface); -->
<!--     color: var(--colors-skeleton-2-contrast); -->
<!--   } -->
<!--   .panel-c { -->
<!--     background: var(--colors-skeleton-3-surface); -->
<!--     color: var(--colors-skeleton-3-contrast); -->
<!--   } -->
<!--   .label { -->
<!--     font-size: 64px; -->
<!--     font-weight: 900; -->
<!--     opacity: 0.5; -->
<!--     user-select: none; -->
<!--   } -->

<!--   .bone { -->
<!--     position: fixed; -->
<!--     background: var(--colors-skeleton-4-surface); -->
<!--     border: 1px solid var(--colors-skeleton-4-boundary); -->
<!--     pointer-events: none; -->
<!--     z-index: 50; -->
<!--   } -->

<!--   .viket { -->
<!--     position: fixed; -->
<!--     transform: translate(-50%, -50%); -->
<!--     background: var(--colors-theme-primary-surface); -->
<!--     color: var(--colors-theme-primary-contrast); -->
<!--     border: 2px solid var(--colors-theme-primary-boundary); -->
<!--     border-radius: 50%; -->
<!--     display: grid; -->
<!--     place-items: center; -->
<!--     cursor: grab; -->
<!--     touch-action: none; -->
<!--     user-select: none; -->
<!--     z-index: 100; -->
<!--     box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); -->
<!--     transition: -->
<!--       background 0.12s, -->
<!--       box-shadow 0.12s; -->
<!--   } -->
<!--   .viket.dragging { -->
<!--     cursor: grabbing; -->
<!--     background: var(--colors-theme-secondary-surface); -->
<!--     box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6); -->
<!--   } -->
<!--   .viket.longpress { -->
<!--     background: var(--colors-theme-accent-surface); -->
<!--   } -->
<!--   .viket.tap1 { -->
<!--     background: var(--colors-system-info-surface); -->
<!--   } -->
<!--   .viket.tap2 { -->
<!--     background: var(--colors-system-success-surface); -->
<!--   } -->
<!--   .viket.tap3 { -->
<!--     background: var(--colors-system-warning-surface); -->
<!--   } -->
<!--   .logo { -->
<!--     font-size: 28px; -->
<!--     font-weight: 900; -->
<!--     line-height: 1; -->
<!--   } -->

<!--   .radial { -->
<!--     position: fixed; -->
<!--     width: 0; -->
<!--     height: 0; -->
<!--     pointer-events: none; -->
<!--     z-index: 90; -->
<!--   } -->
<!--   .radial-ring { -->
<!--     position: absolute; -->
<!--     left: 0; -->
<!--     top: 0; -->
<!--     width: calc(var(--radius) * 2); -->
<!--     height: calc(var(--radius) * 2); -->
<!--     transform: translate(-50%, -50%); -->
<!--     border-radius: 50%; -->
<!--     background: -->
<!--       conic-gradient( -->
<!--         from 0deg, -->
<!--         var(--colors-system-danger-surface), -->
<!--         var(--colors-system-warning-surface), -->
<!--         var(--colors-system-success-surface), -->
<!--         var(--colors-system-info-surface), -->
<!--         var(--colors-theme-primary-surface), -->
<!--         var(--colors-theme-accent-surface), -->
<!--         var(--colors-system-danger-surface) -->
<!--       ); -->
<!--     opacity: 0.6; -->
<!--     box-shadow: 0 0 48px rgba(0, 0, 0, 0.7); -->
<!--   } -->
<!--   .radial-target { -->
<!--     position: absolute; -->
<!--     left: -20px; -->
<!--     top: -20px; -->
<!--     width: 40px; -->
<!--     height: 40px; -->
<!--     background: var(--colors-skeleton-1-surface); -->
<!--     color: var(--colors-skeleton-1-contrast); -->
<!--     border: 2px solid var(--colors-skeleton-1-boundary); -->
<!--     border-radius: 50%; -->
<!--     display: grid; -->
<!--     place-items: center; -->
<!--     font-size: 20px; -->
<!--     font-weight: bold; -->
<!--   } -->
<!--   .radial-target.active { -->
<!--     background: var(--colors-theme-accent-surface); -->
<!--     color: var(--colors-theme-accent-contrast); -->
<!--     border-color: var(--colors-theme-accent-boundary); -->
<!--     box-shadow: 0 0 20px var(--colors-theme-accent-surface); -->
<!--   } -->

<!--   .hud { -->
<!--     position: fixed; -->
<!--     bottom: 12px; -->
<!--     right: 12px; -->
<!--     padding: 10px 14px; -->
<!--     background: var(--colors-skeleton-1-surface); -->
<!--     color: var(--colors-skeleton-1-contrast); -->
<!--     font-family: var(--font-family-code); -->
<!--     font-size: 11px; -->
<!--     line-height: 1.5; -->
<!--     border: 1px solid var(--colors-skeleton-1-boundary); -->
<!--     border-radius: 6px; -->
<!--     pointer-events: none; -->
<!--     z-index: 200; -->
<!--     opacity: 0.85; -->
<!--   } -->
<!--   .hint { -->
<!--     margin-top: 8px; -->
<!--     padding-top: 8px; -->
<!--     border-top: 1px solid var(--colors-skeleton-1-boundary); -->
<!--     opacity: 0.7; -->
<!--     font-size: 10px; -->
<!--   } -->
<!-- </style> -->
