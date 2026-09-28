<script>
  import { getContext, onMount } from "svelte";
  import { stores } from "@vivalence/anima";
  import { BRIDGE } from "$client";

  let { rect, gesture } = $props();

  const bridge = getContext(BRIDGE);

  let pincer = $state(bridge.layout.pincer);
  let viewportOffsetTop = $state(bridge.viewportOffsetTop);
  let viewport = $state(bridge.layout.viewport);
  let standard = $state(bridge.layout.standard);
  let locked = $state(bridge.layout.locked);
  let snap = $state(bridge.view.snap);
  let hair = $state(bridge.view.hair);
  let full = $state(bridge.view.full);
  bridge.layout.$pincer.subscribe((v) => (pincer = v));
  bridge.$viewportOffsetTop.subscribe((v) => (viewportOffsetTop = v));
  bridge.layout.$viewport.subscribe((v) => (viewport = v));
  bridge.layout.$standard.subscribe((v) => (standard = v));
  bridge.layout.$locked.subscribe((v) => (locked = v));
  bridge.view.$snap.subscribe((v) => (snap = v));
  bridge.view.$hair.subscribe((v) => (hair = v));
  bridge.view.$full.subscribe((v) => (full = v));

  const SPOKES = [0, 90, 180, 270];
  const TILES = Object.entries(stores.bridge.TOGGLES);
  const ANGLES = { 0: 0, 90: 90, 180: 180, 270: 270, ...stores.bridge.TOGGLES };
  const INKS = { a: "var(--boundary-strong)", b: "var(--surface)", c: "var(--surface-sunk)" };
  const HINTS = {
    0: "spine down · stage on top",
    90: "spine right · stage on the left",
    180: "spine up · stage below",
    270: "spine left · stage on the right",
  };
  const onOff = (on) => (on ? " · on" : " · off");
  const percent = (part, whole) => `${whole ? (part / whole) * 100 : 0}%`;

  let dragging = $state(gesture.dragging);
  let longPress = $state(gesture.longPress);
  let radial = $state.raw(gesture.radial);
  let flash = $state(gesture.flash);
  let hidden = $state(gesture.hidden);
  let hovered = $state(null);
  gesture.$dragging.subscribe((v) => (dragging = v));
  gesture.$longPress.subscribe((v) => (longPress = v));
  gesture.$radial.subscribe((v) => {
    radial = v;
    if (!v.show) hovered = null;
  });
  gesture.$flash.subscribe((v) => (flash = v));
  gesture.$hidden.subscribe((v) => (hidden = v));

  const minis = $derived(
    radial.show
      ? SPOKES.map((angle) => ({
          angle,
          blocks: Object.entries(
            stores.bridge.rectsForOrientation(stores.bridge.snapToOrientation(angle), gesture.preview(angle), viewport.width, viewport.height),
          ).map(([block, box]) => ({
            ink: INKS[block],
            left: percent(box.left, viewport.width),
            top: percent(box.top, viewport.height),
            width: percent(box.width, viewport.width),
            height: percent(box.height, viewport.height),
          })),
        }))
      : [],
  );
  const flags = $derived({ snap, hair, full });
  const hot = $derived(
    radial.sticky ? hovered : (radial.toggle ?? (radial.length >= stores.bridge.DEAD_ZONE ? String(radial.snap) : null)),
  );
  const wedge = $derived(ANGLES[hot] ?? null);
  const hint = $derived.by(() => {
    if (!radial.sticky && radial.rotate && !radial.toggle) return "rotate only · the joint stays put";
    const said = {
      snap: `grid snap${onOff(snap)}`,
      hair: `hairline bones${onOff(hair)}`,
      full: `hide the t-bones · pincer fades, returns when you come near${onOff(full)}`,
      home: "home · tap to go there · drag to move",
      lock: locked ? "pincer locked · click to unlock" : "lock the pincer in place",
    };
    if (hot in said) return said[hot];
    if (hot !== null) return HINTS[stores.bridge.snapToOrientation(Number(hot))];
    return !radial.sticky && radial.length < stores.bridge.DEAD_ZONE ? "let go here to lock the radial open" : null;
  });
  const anchor = $derived(radial.anchor ?? { x: pincer.x, y: pincer.y + viewportOffsetTop });
  const hintBelow = $derived(anchor.y + stores.bridge.RADIAL_RADIUS + 38 < viewport.height + viewportOffsetTop);
  const homed = $derived(standard.x !== 0 || standard.y !== 0);
  const resting = $derived(hair && !radial.show && !full);

  $effect(() => {
    if (!full) return;
    gesture.doze();
    const escape = (event) => {
      if (event.key === "Escape" && !event.defaultPrevented) bridge.view.full = false;
    };
    window.addEventListener("pointermove", gesture.sense);
    window.addEventListener("pointerdown", gesture.sense, true);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointermove", gesture.sense);
      window.removeEventListener("pointerdown", gesture.sense, true);
      window.removeEventListener("keydown", escape);
      gesture.wake();
    };
  });

  onMount(() => gesture.reset());
</script>

<div
  data-zone="0"
  class="bone"
  class:full
  class:hidden
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
></div>

<!-- viket — the keystone where spine meets crown.
     primary brand element, draggable; long-press opens the radial. -->
<div
  data-zone="0"
  class="viket"
  class:dragging
  class:longpress={longPress}
  class:sticky={radial.sticky}
  class:hairline={resting}
  class:hidden
  class:tap1={flash === "tap1"}
  class:tap2={flash === "tap2"}
  class:tap3={flash === "tap3"}
  style:left="{pincer.x}px"
  style:top="{pincer.y + viewportOffsetTop}px"
  style:width="{stores.bridge.PINCER_SIZE}px"
  style:height="{stores.bridge.PINCER_SIZE}px"
  onpointerdown={gesture.down}
  onpointermove={gesture.move}
  onpointerup={gesture.up}
  onpointercancel={gesture.up}>
  <span class="viket-disc"><span class="viket-pictogram" role="img" aria-label="viket"></span></span>
</div>

<!-- radial menu -->
{#if radial.show && radial.sticky}
  <div data-zone="0" class="radial-backdrop" onclick={gesture.backdrop} role="presentation"></div>
{/if}

{#if radial.show}
  <div
    data-zone="0"
    class="radial"
    class:sticky={radial.sticky}
    style:left="{anchor.x}px"
    style:top="{anchor.y}px"
    style:--radius="{stores.bridge.RADIAL_RADIUS}px"
    style:--hot="{wedge ?? 0}deg">
    <div class="radial-disc"></div>
    {#if wedge !== null}
      <div class="radial-wedge"></div>
    {/if}
    {#each minis as mini (mini.angle)}
      <i class="radial-dot" class:hot={hot === String(mini.angle)} style:--angle="{mini.angle}deg"></i>
      <div
        class="radial-mini"
        class:hot={hot === String(mini.angle)}
        style:--angle="{mini.angle}deg"
        role="img"
        aria-label={HINTS[stores.bridge.snapToOrientation(mini.angle)]}
        onpointerdown={(event) => gesture.spoke(event, mini.angle)}
        onpointerenter={() => (hovered = String(mini.angle))}
        onpointerleave={() => (hovered = null)}>
        {#each mini.blocks as block}
          <i
            style:left={block.left}
            style:top={block.top}
            style:width={block.width}
            style:height={block.height}
            style:background={block.ink}></i>
        {/each}
      </div>
    {/each}
    {#each TILES as [name, angle] (name)}
      <i class="radial-dot" class:hot={hot === name} style:--angle="{angle}deg"></i>
      <div
        class="radial-tile"
        class:grid={name === "snap"}
        class:hair={name === "hair"}
        class:eye={name === "full"}
        class:on={flags[name]}
        class:hot={hot === name}
        style:--angle="{angle}deg"
        role="img"
        aria-label={name}
        onpointerdown={(event) => gesture.tile(event, name)}
        onpointerenter={() => (hovered = name)}
        onpointerleave={() => (hovered = null)}></div>
    {/each}
    {#if homed}
      <span
        class="radial-home"
        class:hot={hot === "home"}
        style:left="{standard.x - anchor.x}px"
        style:top="{standard.y + viewportOffsetTop - anchor.y}px"
        role="img"
        aria-label="home"
        onpointerdown={gesture.homeDown}
        onpointermove={gesture.homeMove}
        onpointerup={gesture.homeUp}
        onpointercancel={gesture.homeUp}
        onpointerenter={() => (hovered = "home")}
        onpointerleave={() => (hovered = null)}></span>
    {/if}
    {#if radial.sticky}
      <div
        class="radial-lock"
        class:on={locked}
        class:hot={hot === "lock"}
        role="img"
        aria-label={locked ? "unlock" : "lock"}
        onpointerdown={gesture.lock}
        onpointerenter={() => (hovered = "lock")}
        onpointerleave={() => (hovered = null)}></div>
    {/if}
    {#if hint}
      <span class="radial-hint" class:above={!hintBelow}>{hint}</span>
    {/if}
  </div>
{/if}

<div data-zone="0" class="veil" class:on={dragging || radial.show}></div>

<style>
  .bone {
    position: fixed;
    background: var(--surface);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    pointer-events: none;
    z-index: 49;
    overflow: hidden;
    transition: opacity 0.12s;
  }
  .bone.full {
    border-radius: var(--shape-radius-key);
    z-index: 99;
  }
  .bone.full.hidden,
  .viket.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .viket {
    position: fixed;
    transform: translate(-50%, -50%);
    background: transparent;
    color: var(--text-strong);
    box-sizing: border-box;
    display: grid;
    place-items: center;
    cursor: grab;
    touch-action: none;
    user-select: none;
    z-index: 100;
    transition: opacity 0.12s;
  }
  .viket.dragging {
    cursor: grabbing;
  }
  .viket.longpress .viket-disc,
  .viket.sticky .viket-disc,
  .viket.tap3 .viket-disc {
    --ring: var(--signal-caution);
    background: var(--signal-caution);
    color: var(--signal-caution-on);
  }
  .viket.sticky .viket-disc {
    animation: viket-sticky-pulse 1.6s ease-in-out infinite;
  }
  @keyframes viket-sticky-pulse {
    0%,
    100% {
      box-shadow:
        0 0 0 2px var(--ring),
        0 4px 16px var(--shadow);
    }
    50% {
      box-shadow:
        0 0 0 2px var(--ring),
        0 4px 24px var(--signal-caution);
    }
  }
  .viket.tap1 .viket-disc {
    --ring: var(--signal-primary);
    background: var(--signal-primary);
    color: var(--signal-primary-on);
  }
  .viket.tap2 .viket-disc {
    --ring: var(--signal-positive);
    background: var(--signal-positive);
    color: var(--signal-positive-on);
  }
  .viket-disc {
    --ring: var(--brand-outline);
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    border-radius: var(--shape-radius-disc);
    background: var(--surface);
    box-shadow:
      0 0 0 2px var(--ring),
      var(--brand-glow);
    user-select: none;
    pointer-events: none;
    -webkit-user-drag: none;
    transition:
      transform 0.28s cubic-bezier(0.3, 1.3, 0.5, 1),
      width 0.2s,
      height 0.2s,
      background 0.12s,
      box-shadow 0.12s;
  }
  .viket-pictogram {
    width: 27px;
    height: 27px;
    display: grid;
    filter: var(--brand-filter);
    transition:
      width 0.2s,
      height 0.2s;
  }
  .viket.hairline .viket-disc {
    width: 24px;
    height: 24px;
    background: var(--control-contrast);
    box-shadow:
      0 0 0 var(--size-ring) var(--boundary),
      var(--shape-lift);
  }
  .viket.hairline.tap1 .viket-disc,
  .viket.hairline.tap2 .viket-disc,
  .viket.hairline.tap3 .viket-disc {
    background: var(--control-contrast);
    box-shadow:
      0 0 0 2px var(--ring),
      var(--shape-lift);
  }
  .viket.hairline .viket-pictogram {
    width: 14px;
    height: 14px;
  }
  .viket-pictogram::before {
    content: "";
    background: currentColor;
    -webkit-mask: url(/images/pictogram_viket/pic-vinca-viket_white.svg) center / contain no-repeat;
    mask: url(/images/pictogram_viket/pic-vinca-viket_white.svg) center / contain no-repeat;
    transform-origin: center center;
    transition:
      transform 0.18s ease-out,
      opacity 0.12s;
  }
  .viket.dragging .viket-disc,
  .viket.longpress .viket-disc,
  .viket.sticky .viket-disc {
    transform: translateY(var(--size-depth));
  }
  /* drag closes the eye; release re-opens it */
  .viket.dragging .viket-pictogram::before {
    opacity: 0.35;
    transform: scaleX(1.2) scaleY(0.1);
    transition: transform 0.08s ease-in;
  }
  @media (prefers-reduced-motion: reduce) {
    .viket-disc,
    .viket-pictogram::before {
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
    --unit: calc(var(--radius) / 98);
    position: fixed;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 90;
  }
  .radial.sticky {
    z-index: 101;
  }
  .radial-disc,
  .radial-wedge {
    position: absolute;
    left: 0;
    top: 0;
    width: calc(var(--radius) * 2);
    height: calc(var(--radius) * 2);
    transform: translate(-50%, -50%);
    border-radius: var(--shape-radius-full);
  }
  .radial-disc {
    background: color-mix(in srgb, var(--surface) 42%, transparent);
    backdrop-filter: blur(12px) saturate(1.4);
    -webkit-backdrop-filter: blur(12px) saturate(1.4);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--boundary) 80%, transparent),
      var(--shape-lift);
  }
  .radial-wedge {
    background: conic-gradient(
      from calc(var(--hot) + 67.5deg),
      color-mix(in srgb, var(--control-contrast) 85%, transparent) 0 45deg,
      transparent 45deg 360deg
    );
  }
  .radial-dot {
    position: absolute;
    left: calc(var(--unit) * -3);
    top: calc(var(--unit) * -3);
    width: calc(var(--unit) * 6);
    height: calc(var(--unit) * 6);
    border-radius: var(--shape-radius-full);
    background: var(--boundary-strong);
    box-shadow:
      inset 0 1px 1.5px var(--shadow),
      0 1px 0 color-mix(in srgb, var(--control-contrast) 70%, transparent);
    transform: rotate(var(--angle)) translate(calc(var(--radius) - var(--unit) * 9 + 2px));
    transition: background 0.12s;
  }
  .radial-dot.hot {
    background: var(--text-strong);
  }
  .radial-mini,
  .radial-tile,
  .radial-lock {
    position: absolute;
    left: calc(var(--unit) * -15);
    top: calc(var(--unit) * -15);
    width: calc(var(--unit) * 30);
    height: calc(var(--unit) * 30);
    box-sizing: border-box;
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    transition:
      scale 0.14s,
      box-shadow 0.14s,
      background-color 0.14s;
    -webkit-tap-highlight-color: transparent;
  }
  .radial-mini {
    overflow: hidden;
    border-radius: var(--shape-radius-key);
    background: var(--text-strong);
    transform: rotate(var(--angle)) translate(calc(var(--unit) * 64)) rotate(calc(-1 * var(--angle)));
  }
  .radial-mini i {
    position: absolute;
  }
  .radial-tile,
  .radial-lock {
    --glyph: var(--control-on-muted);
    --bar: calc(var(--unit) * 14);
    --line: calc(var(--unit) * 1.5);
    --gap: calc(var(--unit) * 3.5);
    display: grid;
    place-items: center;
    border-radius: calc(var(--unit) * 6);
    background-color: var(--control-contrast);
    background-repeat: no-repeat;
  }
  .radial-tile {
    transform: rotate(var(--angle)) translate(calc(var(--unit) * 64)) rotate(calc(-1 * var(--angle)));
  }
  .radial-tile.on,
  .radial-lock.on {
    --glyph: var(--control-contrast);
    background-color: var(--control-on);
  }
  .radial-lock::before {
    content: "";
    width: calc(var(--unit) * 16);
    height: calc(var(--unit) * 16);
    background: var(--glyph);
    -webkit-mask: url(/icons/carbon/32/unlocked.svg) center / contain no-repeat;
    mask: url(/icons/carbon/32/unlocked.svg) center / contain no-repeat;
  }
  .radial-lock.on::before {
    -webkit-mask-image: url(/icons/carbon/32/locked.svg);
    mask-image: url(/icons/carbon/32/locked.svg);
  }
  .radial-tile.grid {
    background-image:
      linear-gradient(var(--glyph), var(--glyph)),
      linear-gradient(var(--glyph), var(--glyph)),
      linear-gradient(var(--glyph), var(--glyph)),
      linear-gradient(var(--glyph), var(--glyph));
    background-size:
      var(--line) var(--bar),
      var(--line) var(--bar),
      var(--bar) var(--line),
      var(--bar) var(--line);
    background-position:
      calc(50% - var(--gap)) 50%,
      calc(50% + var(--gap)) 50%,
      50% calc(50% - var(--gap)),
      50% calc(50% + var(--gap));
  }
  .radial-tile.hair {
    background-image:
      linear-gradient(var(--glyph), var(--glyph)),
      linear-gradient(var(--glyph), var(--glyph));
    background-size:
      var(--bar) var(--line),
      var(--line) calc(var(--unit) * 11);
    background-position:
      50% calc(50% - var(--gap)),
      50% calc(50% + var(--unit) * 3);
  }
  .radial-tile.eye::before {
    content: "";
    width: calc(var(--unit) * 17);
    height: calc(var(--unit) * 17);
    background: var(--glyph);
    -webkit-mask: url(/icons/anima/eye-off.svg) center / contain no-repeat;
    mask: url(/icons/anima/eye-off.svg) center / contain no-repeat;
  }
  .radial-mini.hot,
  .radial-tile.hot,
  .radial-lock.hot {
    scale: 1.12;
    box-shadow:
      0 0 0 var(--size-ring) var(--boundary),
      var(--shape-lift);
  }
  .radial.sticky .radial-mini,
  .radial.sticky .radial-tile,
  .radial.sticky .radial-lock,
  .radial.sticky .radial-home {
    pointer-events: auto;
    cursor: pointer;
  }
  .radial.sticky .radial-home {
    cursor: grab;
    touch-action: none;
  }
  .radial-hint {
    position: absolute;
    left: 0;
    top: calc(var(--radius) + 10px);
    height: 24px;
    padding: 0 10px;
    display: grid;
    place-items: center;
    white-space: nowrap;
    transform: translateX(-50%);
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast);
    color: var(--control-on);
    box-shadow:
      0 0 0 var(--size-ring) var(--boundary),
      var(--shape-lift);
    font-family: var(--font-family-code);
    font-size: 11px;
  }
  .radial-hint.above {
    top: calc(-1 * var(--radius) - 34px);
  }
  .radial-home {
    position: absolute;
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%);
    border-radius: var(--shape-radius-disc);
    background: var(--surface);
    color: var(--text-strong);
    box-shadow:
      0 0 0 2px var(--brand-outline),
      var(--brand-glow);
    opacity: 0.7;
    transition:
      scale 0.14s,
      opacity 0.14s;
  }
  .radial-home.hot {
    scale: 1.12;
    opacity: 1;
  }
  .radial-home::before {
    content: "";
    width: 27px;
    height: 27px;
    background: currentColor;
    -webkit-mask: url(/images/pictogram_viket/pic-vinca-viket_white.svg) center / contain no-repeat;
    mask: url(/images/pictogram_viket/pic-vinca-viket_white.svg) center / contain no-repeat;
  }

  .veil {
    position: fixed;
    inset: 0;
    z-index: 88;
    pointer-events: none;
    opacity: 0;
    background: color-mix(in srgb, var(--surface) 12%, transparent);
    backdrop-filter: blur(0px) saturate(1);
    -webkit-backdrop-filter: blur(0px) saturate(1);
    transition:
      opacity 360ms ease,
      backdrop-filter 360ms ease,
      -webkit-backdrop-filter 360ms ease;
  }
  .veil.on {
    opacity: 1;
    backdrop-filter: blur(3px) saturate(1.15);
    -webkit-backdrop-filter: blur(3px) saturate(1.15);
  }
  @media (prefers-reduced-motion: reduce) {
    .radial-mini,
    .radial-tile,
    .radial-lock,
    .radial-dot,
    .veil {
      transition: none;
    }
  }
</style>
