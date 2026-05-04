<script>
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  import PanelA from "./pincer/panels/a.svelte";
  import PanelB from "./pincer/panels/b.svelte";
  import PanelC from "./pincer/panels/c.svelte";
  import PanelG from "./pincer/panels/g.svelte";
  import PanelH from "./pincer/panels/h.svelte";
  import BoneShoulder from "./pincer/bones/shoulder.svelte";
  import BoneCrown from "./pincer/bones/crown.svelte";
  import BonePincer from "./pincer/bones/pincer.svelte";
  import BoneSpine from "./pincer/bones/spine.svelte";
  import { THREAD, BRIDGE } from "$client";
  import { bridge } from "@vivalence/kajuit";
  const {
    clamp,
    snapToGrid,
    rectsForOrientation,
    bonesForOrientation,
    snapToOrientation,
    orientationToSnap,
    snapLabel,
    BONE_THICKNESS,
    PINCER_SIZE,
    HALF,
    EDGE_PADDING,
  } = bridge;
  const systemAlert = false;

  const bridgeInstance = getContext(BRIDGE);
  const threadInstance = getContext(THREAD);
  const { layout, view } = bridgeInstance;

  let currentThread = $state(null);
  threadInstance.$current.subscribe((v) => (currentThread = v));
  let pageTitle = $derived(currentThread?.mode?.name ?? currentThread?.mode?.slug ?? "@vivalence");

  let pincer = $state(layout.$pincer.get());
  let previous = $state(layout.$previous.get());
  let standard = $state(layout.$standard.get());
  let orientation = $state(layout.$orientation.get());
  let viewport = $state(layout.$viewport.get());
  layout.$pincer.subscribe((v) => (pincer = v));
  layout.$previous.subscribe((v) => (previous = v));
  layout.$standard.subscribe((v) => (standard = v));
  layout.$orientation.subscribe((v) => (orientation = v));
  layout.$viewport.subscribe((v) => (viewport = v));

  const TAP_MAX_MS = 250;
  const TAP_MAX_MOVE = 8;
  const MULTI_TAP_WINDOW = 280;
  const LONG_PRESS_MS = 420;
  const RELEASE_COMMIT_DIST = 32;

  const RADIAL_RADIUS = 108;

  let gesture = $state({
    pointerId: null,
    downAt: 0,
    downX: 0,
    downY: 0,
    startPincerX: 0,
    startPincerY: 0,
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

  function applyViewportOffset(obj) {
    const result = {};
    for (const [key, rect] of Object.entries(obj)) {
      result[key] = { ...rect, top: rect.top + viewportOffsetTop };
    }
    return result;
  }

  let rects = $derived(
    applyViewportOffset(rectsForOrientation(orientation, pincer, viewport.width, viewport.height)),
  );
  let bones = $derived(
    applyViewportOffset(bonesForOrientation(orientation, pincer, viewport.width, viewport.height)),
  );

  // -------- gesture handlers --------
  function onPointerDown(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.pointerId = event.pointerId;
    gesture.downAt = Date.now();
    gesture.downX = event.clientX;
    gesture.downY = event.clientY;
    gesture.startPincerX = pincer.x;
    gesture.startPincerY = pincer.y;
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
      const angle =
        ((Math.atan2(event.clientY - pincer.y, event.clientX - pincer.x) * 180) / Math.PI + 360) %
        360;
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
      const rawX = gesture.startPincerX + deltaX;
      const rawY = gesture.startPincerY + deltaY;
      const finalX = view.$snap.get() ? snapToGrid(rawX, viewport.width) : rawX;
      const finalY = view.$snap.get() ? snapToGrid(rawY, viewport.height) : rawY;
      layout.pincer = {
        x: clamp(finalX, EDGE_PADDING, viewport.width - EDGE_PADDING),
        y: clamp(finalY, EDGE_PADDING, viewport.height - EDGE_PADDING),
      };
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
      const finalDistance = Math.hypot(event.clientX - pincer.x, event.clientY - pincer.y);
      if (finalDistance > RELEASE_COMMIT_DIST) {
        layout.orientation = snapToOrientation(radial.snap);
        radial.show = false;
        radial.sticky = false;
        bridgeInstance.save();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      } else {
        // released near viket center → sticky mode
        radial.sticky = true;
      }
      gesture.isLongPress = false;
      return;
    }

    if (gesture.isDragging) {
      layout.previous = { x: gesture.startPincerX, y: gesture.startPincerY };
      gesture.isDragging = false;
      bridgeInstance.save();
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
      layout.previous = { ...pincer };
      layout.pincer = { ...standard };
      pulse("tap1");
    } else if (count === 2) {
      const swap = { ...previous };
      layout.previous = { ...pincer };
      layout.pincer = swap;
      pulse("tap2");
    } else if (count >= 3) {
      layout.standard = { ...pincer };
      pulse("tap3");
    }
    bridgeInstance.save();
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
    layout.orientation = snapToOrientation(angle);
    radial.show = false;
    bridgeInstance.save();
    radial.sticky = false;
  }

  function onRadialBackdropClick() {
    radial.show = false;
    radial.sticky = false;
  }

  let viewportOffsetTop = $state(0);
  let safeAreaTop = $state(0);

  function readSafeArea() {
    const style = getComputedStyle(document.documentElement);
    safeAreaTop = parseFloat(style.getPropertyValue("--safe-area-top")) || 0;
  }

  function viewportDimensions() {
    const vv = window.visualViewport;
    if (vv) {
      viewportOffsetTop = vv.offsetTop + safeAreaTop;
      return { width: vv.width, height: vv.height - safeAreaTop };
    }
    viewportOffsetTop = safeAreaTop;
    return { width: window.innerWidth, height: window.innerHeight - safeAreaTop };
  }

  function isDeviceRotation() {
    const layoutWidth = window.innerWidth;
    const layoutHeight = window.innerHeight;
    const current = layout.$viewport.get();
    return layoutWidth !== current.width || layoutHeight !== current.height;
  }

  function onResize() {
    const oldViewport = layout.$viewport.get();
    const rotation = isDeviceRotation();
    layout.viewport = viewportDimensions();

    if (rotation && oldViewport.width > 0 && oldViewport.height > 0) {
      const deltaWidth = layout.viewport.width - oldViewport.width;
      const deltaHeight = layout.viewport.height - oldViewport.height;

      let shiftX = 0,
        shiftY = 0;
      if (orientation === 0) {
        shiftY = deltaHeight;
      } else if (orientation === 90) {
        shiftX = deltaWidth;
      } else if (orientation === 180) {
        shiftX = deltaWidth;
      }

      const reanchor = (position) => ({
        x: clamp(position.x + shiftX, EDGE_PADDING, layout.viewport.width - EDGE_PADDING),
        y: clamp(position.y + shiftY, EDGE_PADDING, layout.viewport.height - EDGE_PADDING),
      });

      layout.pincer = reanchor(pincer);
      layout.previous = reanchor(previous);
      layout.standard = reanchor(standard);
    } else {
      const clampPosition = (position) => ({
        x: clamp(position.x, EDGE_PADDING, layout.viewport.width - EDGE_PADDING),
        y: clamp(position.y, EDGE_PADDING, layout.viewport.height - EDGE_PADDING),
      });
      layout.pincer = clampPosition(pincer);
    }
  }

  onMount(() => {
    readSafeArea();
    layout.viewport = viewportDimensions();

    const saved = layout.$pincer.get();
    const hasSaved = saved.x !== 0 || saved.y !== 0;

    if (hasSaved) {
      layout.pincer = {
        x: clamp(saved.x, EDGE_PADDING, layout.viewport.width - EDGE_PADDING),
        y: clamp(saved.y, EDGE_PADDING, layout.viewport.height - EDGE_PADDING),
      };
      const prev = layout.$previous.get();
      layout.previous = {
        x: clamp(prev.x, EDGE_PADDING, layout.viewport.width - EDGE_PADDING),
        y: clamp(prev.y, EDGE_PADDING, layout.viewport.height - EDGE_PADDING),
      };
      const std = layout.$standard.get();
      layout.standard = {
        x: clamp(std.x, EDGE_PADDING, layout.viewport.width - EDGE_PADDING),
        y: clamp(std.y, EDGE_PADDING, layout.viewport.height - EDGE_PADDING),
      };
    } else {
      const start = layout.$start.get();
      const home = layout.$home.get();
      layout.pincer = {
        x: clamp(
          start.x * layout.viewport.width,
          EDGE_PADDING,
          layout.viewport.width - EDGE_PADDING,
        ),
        y: clamp(
          start.y * layout.viewport.height,
          EDGE_PADDING,
          layout.viewport.height - EDGE_PADDING,
        ),
      };
      layout.previous = { ...layout.pincer };
      layout.standard = {
        x: clamp(
          home.x * layout.viewport.width,
          EDGE_PADDING,
          layout.viewport.width - EDGE_PADDING,
        ),
        y: clamp(
          home.y * layout.viewport.height,
          EDGE_PADDING,
          layout.viewport.height - EDGE_PADDING,
        ),
      };
    }

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
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", onResize);
      vv.addEventListener("scroll", onResize);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      if (vv) {
        vv.removeEventListener("resize", onResize);
        vv.removeEventListener("scroll", onResize);
      }
    };
  });
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>{pageTitle}</title>
</svelte:head>

{#if viewport.width > 0 && viewport.height > 0}
  <!-- panels — collapse to 0 when viket hits an edge -->
  <PanelA rect={rects.a} />

  <PanelB rect={rects.b} />

  <PanelC rect={rects.c} />

  <BoneShoulder rect={bones.shoulder} />
  <BoneCrown rect={bones.crown} />
  <BonePincer rect={bones.pincer} />
  <BoneSpine rect={bones.spine} />

  <PanelG />

  {#if systemAlert}
    <div class="system-alert-rail" title="one or more services are down"></div>
  {/if}

  <PanelH />


  <!-- viket — square at the junction -->
  <div
    class="viket"
    class:dragging={gesture.isDragging}
    class:longpress={gesture.isLongPress}
    class:sticky={radial.sticky}
    class:tap1={flash === "tap1"}
    class:tap2={flash === "tap2"}
    class:tap3={flash === "tap3"}
    style:left="{pincer.x}px"
    style:top="{pincer.y + viewportOffsetTop}px"
    style:width="{PINCER_SIZE}px"
    style:height="{PINCER_SIZE}px"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}>
    <img
      class="viket-pictogram"
      src="/images/pictogram_viket/pic-vinca-viket_white.svg"
      alt="viket"
      draggable="false" />
  </div>

  <!-- radial menu -->
  {#if radial.show && radial.sticky}
    <div class="radial-backdrop" onclick={onRadialBackdropClick} role="presentation"></div>
  {/if}

  {#if radial.show}
    <div
      class="radial"
      class:sticky={radial.sticky}
      style:left="{pincer.x}px"
      style:top="{pincer.y + viewportOffsetTop}px"
      style:--radius="{RADIAL_RADIUS}px">
      <div class="radial-ring"></div>
      {#each [0, 90, 180, 270] as angle}
        <div
          class="radial-target"
          class:active={radial.snap === angle}
          style:transform="rotate({angle}deg) translate(var(--radius)) rotate(-{angle}deg)"
          onpointerdown={(event) => onSpokeClick(event, angle)}>
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
    0%,
    100% {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    }
    50% {
      box-shadow: 0 4px 24px var(--colors-skeleton-0-accent-base);
    }
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
    transition:
      transform 0.18s ease-out,
      filter 0.18s ease-out;
    /* tint the white svg toward primary aqua so it reads as the brand keystone.
       drop-shadow gives the cathode glow. */
    filter: brightness(0) saturate(100%) invert(72%) sepia(45%) saturate(1156%) hue-rotate(133deg)
      brightness(94%) contrast(89%) drop-shadow(0 0 4px var(--colors-skeleton-0-primary-base));
  }
  /* drag closes the eye; release re-opens it */
  .viket.dragging .viket-pictogram {
    transform: scaleX(1.2) scaleY(0.1);
    transition: transform 0.08s ease-in;
  }
  @media (prefers-reduced-motion: reduce) {
    .viket-pictogram {
      transition: none !important;
    }
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
    background: conic-gradient(
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
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 0.85;
    }
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
</style>
