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

  import { stores } from "@vivalence/anima";
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

  const gesture = new stores.bridge.Gesture(bridge);
  let radial = $state.raw(gesture.radial);
  let hair = $state(bridge.view.hair);
  let full = $state(bridge.view.full);
  gesture.$radial.subscribe((v) => (radial = v));
  bridge.view.$hair.subscribe((v) => (hair = v));
  bridge.view.$full.subscribe((v) => (full = v));

  let thickness = $derived(hair && !radial.show && !full ? stores.bridge.HAIRLINE : stores.bridge.BONE_THICKNESS);
  let rects = $derived(
    stores.bridge.applyViewportOffset(
      {
        ...stores.bridge.rectsForOrientation(orientation, pincer, viewport.width, viewport.height, thickness),
        ...(full ? { a: { left: 0, top: 0, width: viewport.width, height: viewport.height } } : {}),
      },
      viewportOffsetTop,
    ),
  );
  let bones = $derived(
    stores.bridge.applyViewportOffset(
      stores.bridge.bonesForOrientation(orientation, pincer, viewport.width, viewport.height, thickness),
      viewportOffsetTop,
    ),
  );

  onMount(() => {
    stores.bridge.bootLayout(bridge);
    const unsubscribeTheme = bridge.view.$theme.subscribe(
      (theme) => (document.documentElement.dataset.theme = theme),
    );
    const unsubscribeFontSize = bridge.view.$fontSize.subscribe(
      (name) => (document.documentElement.style.fontSize = stores.bridge.FONT_SIZES[name] ?? "16px"),
    );
    const detachViewport = stores.bridge.attachViewport(bridge);
    return () => {
      unsubscribeTheme();
      unsubscribeFontSize();
      detachViewport();
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
  <PanelA rect={rects.a} />

  <div class="chassis" class:full class:hairline={thickness === stores.bridge.HAIRLINE}>
    <PanelB rect={rects.b} />

    <PanelC rect={rects.c} />

    <BoneShoulder rect={bones.shoulder} />
    <BoneCrown rect={bones.crown} />
    <BoneSpine rect={bones.spine} />
  </div>
  <BonePincer rect={bones.pincer} {gesture} />

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
    background: var(--surface);
  }
  .chassis {
    display: contents;
  }
  .chassis.full {
    display: none;
  }
  .chassis.hairline > :global(.bone > *) {
    visibility: hidden;
  }
</style>
