<script>
  import { getContext } from "svelte";
  import { BRIDGE, build } from "$client";
  import { belt } from "@vivalence/typology";
  import { stores } from "@vivalence/anima";
  import { Card, Key, Reading, Section } from "@vivalence/drapes";

  let { open = true, ontoggle = null } = $props();

  const THEMES = stores.bridge.THEMES;
  const SIZES = Object.keys(stores.bridge.FONT_SIZES);
  const SNAPS = [270, 0, 90, 180];
  const PLACES = ["top", "bottom"];

  const bridge = getContext(BRIDGE);

  const logging = bridge.view.$g;
  const inspecting = bridge.view.$h;
  const snap = bridge.view.$snap;
  const theme = bridge.view.$theme;
  const fontSize = bridge.view.$fontSize;
  const strip = bridge.view.$strip;
  const viewport = bridge.layout.$viewport;
  const orientation = bridge.layout.$orientation;
  const composer = bridge.$composer;

  const age = (iso) => (iso ? belt.time.since(iso) : "—");

  const orient = (angle) => {
    bridge.layout.orientation = stores.bridge.snapToOrientation(angle);
    bridge.save();
  };

  const enterSends = () => (bridge.composer = { ...bridge.composer, enterSends: !bridge.composer.enterSends });
</script>

<Section label="config" count={build.known ? build.change : "unstamped"} {open} {ontoggle} />
{#if open}
  <Card>
    <Reading label="change"><span title={build.authored ?? "no working-copy stamp"}>{build.change} · {age(build.authored)}</span></Reading>
    <Reading label="commit">{build.commit}</Reading>
    <Reading label="bundled"><span title={build.built ?? "no build stamp"}>{age(build.built)} ago</span></Reading>
    <Reading label="viewport">{$viewport.width} × {$viewport.height}</Reading>
  </Card>
  <div class="latch">
    <span class="latch-name">theme</span>
    <div class="latch-keys">
      {#each THEMES as name (name)}
        <Key size="row" led latched={$theme === name} label={name} onclick={() => bridge.setTheme(name)} />
      {/each}
    </div>
  </div>
  <div class="latch">
    <span class="latch-name">font</span>
    <div class="latch-keys">
      {#each SIZES as name (name)}
        <Key size="row" led latched={$fontSize === name} label={name} onclick={() => bridge.setFontSize(name)} />
      {/each}
    </div>
  </div>
  <div class="latch">
    <span class="latch-name">view</span>
    <div class="latch-keys">
      <Key size="row" led latched={$snap} label="snap" onclick={() => bridge.toggle("snap")} />
      <Key size="row" led latched={$composer.enterSends} label="enter sends" onclick={enterSends} />
    </div>
  </div>
  <div class="latch">
    <span class="latch-name">telemetry</span>
    <div class="latch-keys">
      <Key size="row" led latched={$logging} label="logger" onclick={() => bridge.toggle("g")} />
      <Key size="row" led latched={$inspecting} label="inspector" onclick={() => bridge.toggle("h")} />
    </div>
  </div>
  <div class="latch">
    <span class="latch-name">orient</span>
    <div class="latch-keys">
      {#each SNAPS as angle (angle)}
        <Key
          square
          size="row"
          latched={stores.bridge.orientationToSnap($orientation) === angle}
          label={stores.bridge.snapLabel(angle)}
          title="orient {stores.bridge.A_SIDE[stores.bridge.snapToOrientation(angle)]}"
          onclick={() => orient(angle)} />
      {/each}
    </div>
  </div>
  <div class="latch">
    <span class="latch-name">strip</span>
    <div class="latch-keys">
      {#each PLACES as name (name)}
        <Key size="row" led latched={$strip === name} label={name} onclick={() => bridge.setStrip(name)} />
      {/each}
    </div>
  </div>
{/if}

<style>
  .latch {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 4px 8px;
  }
  .latch-name {
    flex: 0 0 78px;
    padding-top: 7px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .latch-keys {
    flex: 1 1 150px;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
</style>
