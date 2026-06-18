<script>
  import { getContext, onMount } from "svelte";

  import PanelA from "./panels/a/a.svelte";
  import PanelB from "./panels/b/b.svelte";
  import PanelC from "./panels/c/c.svelte";
  import PanelG from "./panels/g/g.svelte";
  import PanelH from "./panels/h/h.svelte";
  import BoneShoulder from "./bones/shoulder/shoulder.svelte";
  import BoneCrown from "./bones/crown/crown.svelte";
  import BonePincer from "./bones/pincer/pincer.svelte";
  import BoneSpine from "./bones/spine/spine.svelte";

  import { stores } from "@vivalence/kajuit";
  import { TERMINALS, BRIDGE } from "$client";

  const bridge = getContext(BRIDGE);
  const terminals = getContext(TERMINALS);

  let thread = $state(terminals.active?.thread);
  const syncThread = () => (thread = terminals.active?.thread ?? null);
  terminals.$active.subscribe(syncThread);
  terminals.$entities.subscribe(syncThread);
  let pageTitle = $derived(thread?.mode?.name ?? thread?.mode?.slug ?? "@vivalence");

  let pincer = $state(bridge.layout.pincer);
  let orientation = $state(bridge.layout.orientation);
  let viewport = $state(bridge.layout.viewport);
  bridge.layout.$pincer.subscribe((v) => (pincer = v));
  bridge.layout.$orientation.subscribe((v) => (orientation = v));
  bridge.layout.$viewport.subscribe((v) => (viewport = v));

  let viewportOffsetTop = $state(bridge.viewportOffsetTop);
  bridge.$viewportOffsetTop.subscribe((v) => (viewportOffsetTop = v));

  let rects = $derived(
    stores.bridge.applyViewportOffset(
      stores.bridge.rectsForOrientation(orientation, pincer, viewport.width, viewport.height),
      viewportOffsetTop,
    ),
  );
  let bones = $derived(
    stores.bridge.applyViewportOffset(
      stores.bridge.bonesForOrientation(orientation, pincer, viewport.width, viewport.height),
      viewportOffsetTop,
    ),
  );

  onMount(() => {
    stores.bridge.bootLayout(bridge);
    return stores.bridge.attachViewport(bridge);
  });
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>{pageTitle}</title>
</svelte:head>

{#if viewport.width > 0 && viewport.height > 0}
  <PanelA rect={rects.a} />

  <PanelB rect={rects.b} />

  <PanelC rect={rects.c} />

  <BoneShoulder rect={bones.shoulder} />
  <BoneCrown rect={bones.crown} />
  <BonePincer rect={bones.pincer} />
  <BoneSpine rect={bones.spine} />

  <PanelG />

  <PanelH />
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
</style>
