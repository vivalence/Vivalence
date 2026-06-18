<script>
  import { getContext, onMount } from "svelte";
  import { stores } from "@vivalence/kajuit";
  import { BRIDGE } from "$client";

  let { rect } = $props();

  const bridge = getContext(BRIDGE);

  let pincer = $state(bridge.layout.pincer);
  let viewportOffsetTop = $state(bridge.viewportOffsetTop);
  bridge.layout.$pincer.subscribe((v) => (pincer = v));
  bridge.$viewportOffsetTop.subscribe((v) => (viewportOffsetTop = v));

  const gesture = new stores.bridge.Gesture(bridge);
  let dragging = $state(gesture.dragging);
  let longPress = $state(gesture.longPress);
  let radial = $state(gesture.radial);
  let flash = $state(gesture.flash);
  gesture.$dragging.subscribe((v) => (dragging = v));
  gesture.$longPress.subscribe((v) => (longPress = v));
  gesture.$radial.subscribe((v) => (radial = v));
  gesture.$flash.subscribe((v) => (flash = v));

  onMount(() => gesture.reset());
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
></div>

<!-- viket — the keystone where spine meets crown.
     primary brand element, draggable; long-press opens the radial. -->
<div
  class="viket"
  class:dragging
  class:longpress={longPress}
  class:sticky={radial.sticky}
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
  <img
    class="viket-pictogram"
    src="/images/pictogram_viket/pic-vinca-viket_white.svg"
    alt="viket"
    draggable="false" />
</div>

<!-- radial menu -->
{#if radial.show && radial.sticky}
  <div class="radial-backdrop" onclick={gesture.backdrop} role="presentation"></div>
{/if}

{#if radial.show}
  <div
    class="radial"
    class:sticky={radial.sticky}
    style:left="{pincer.x}px"
    style:top="{pincer.y + viewportOffsetTop}px"
    style:--radius="{stores.bridge.RADIAL_RADIUS}px">
    <div class="radial-ring"></div>
    {#each [0, 90, 180, 270] as angle}
      <div
        class="radial-target"
        class:active={radial.snap === angle}
        style:transform="rotate({angle}deg) translate(var(--radius)) rotate(-{angle}deg)"
        onpointerdown={(event) => gesture.spoke(event, angle)}>
        {stores.bridge.snapLabel(angle)}
      </div>
    {/each}
  </div>
{/if}

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-0-boundary);
    pointer-events: none;
    z-index: 49;
    overflow: hidden;
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
    font-size: var(--font-size-lg);
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
