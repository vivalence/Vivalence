<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";
  import Section from "./Section.svelte";

  const bridge = getContext(BRIDGE);

  let pincer = $state(bridge.layout.pincer);
  let orientation = $state(bridge.layout.orientation);
  let viewport = $state(bridge.layout.viewport);
  let g = $state(bridge.view.g);
  let h = $state(bridge.view.h);
  let snap = $state(bridge.view.snap);

  bridge.layout.$pincer.subscribe((v) => (pincer = v));
  bridge.layout.$orientation.subscribe((v) => (orientation = v));
  bridge.layout.$viewport.subscribe((v) => (viewport = v));
  bridge.view.$g.subscribe((v) => (g = v));
  bridge.view.$h.subscribe((v) => (h = v));
  bridge.view.$snap.subscribe((v) => (snap = v));
</script>

<Section name="bridge" meta={`${orientation}°`}>
  <div class="row"><span class="k">pincer</span><span class="v mono">{Math.round(pincer.x)}·{Math.round(pincer.y)}</span></div>
  <div class="row"><span class="k">viewport</span><span class="v mono">{viewport.width}×{viewport.height}</span></div>
  <div class="actions">
    <button class="act" class:on={g} onclick={() => bridge.toggle("g")}>g</button>
    <button class="act" class:on={h} onclick={() => bridge.toggle("h")}>h</button>
    <button class="act" class:on={snap} onclick={() => bridge.toggle("snap")}>snap</button>
  </div>
</Section>
