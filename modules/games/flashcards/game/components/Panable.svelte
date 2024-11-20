<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const TAB_THRESHOLD = 50;
  const HORIZONTAL_BIAS = 1.3;

  let coords = $state({
    start: { x: undefined, y: undefined },
    end: { x: undefined, y: undefined },
    current: { x: 0, y: 0 },
  });

  let cancelled = $state(false);

  $effect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  });

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      resetPosition();
      cancelled = true;
    }
  }

  function handleStart(event) {
    const { clientX, clientY } = event instanceof TouchEvent ? event.touches[0] : event;

    coords.start = { x: clientX, y: clientY };
    cancelled = false;
    coords.end = { x: undefined, y: undefined };
  }

  function handleEnd(event) {
    if (cancelled) return;

    const { clientX, clientY } = event instanceof TouchEvent ? event.changedTouches[0] : event;

    coords.end = { x: clientX, y: clientY };

    if (coords.start.x !== undefined && coords.start.y !== undefined) {
      const direction = determineDirection();
      dispatchDirection(direction);
    }

    resetPosition();
  }

  function handlePan(event) {
    if (coords.start.x === undefined) {
      coords.start = {
        x: event.detail.x,
        y: event.detail.y,
      };
    }

    coords.current = {
      x: event.detail.x - coords.start.x,
      y: event.detail.y - coords.start.y,
    };
  }

  function resetPosition() {
    coords.current = { x: 0, y: 0 };
    coords.start = { x: undefined, y: undefined };
    coords.end = { x: undefined, y: undefined };
  }

  function determineDirection() {
    if (!coords.start.x || !coords.start.y || !coords.end.x || !coords.end.y) {
      return "tap";
    }

    const dx = coords.end.x - coords.start.x;
    const dy = coords.end.y - coords.start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < TAB_THRESHOLD) return "tap";

    if (Math.abs(dx) * HORIZONTAL_BIAS > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  }

  function dispatchDirection(direction) {
    dispatch(direction);
  }
</script>

<div
  class="panable"
  style="transform: translate({coords.current.x}px, {coords.current.y}px)"
  on:mousedown={handleStart}
  on:mouseup={handleEnd}
  on:touchstart={handleStart}
  on:touchend={handleEnd}
  use:pan={{ delay: 30 }}
  on:pan={handlePan}>
  <slot />
</div>

<style>
  .panable {
    @apply h-full w-full;
    touch-action: none;
    transition: transform 0.1s ease;
  }
</style>
