<script>
  import { getContext } from "svelte";
  import { Strip } from "@vivalence/drapes";
  import { BRIDGE } from "$client";
  import BridgeSection from "./widgets/BridgeSection.svelte";
  import LighthouseSection from "./widgets/LighthouseSection.svelte";
  import BoxSection from "./widgets/BoxSection.svelte";
  import DockSection from "./widgets/DockSection.svelte";

  let { rect } = $props();

  const SECTIONS = [
    { name: "config", part: BridgeSection },
    { name: "auth", part: LighthouseSection },
    { name: "box", part: BoxSection },
    { name: "dock", part: DockSection },
  ];
  const FOLDS = ["page", "stack"];

  const bridge = getContext(BRIDGE);
  const fold = bridge.view.$fold;
  const place = bridge.view.$strip;

  let width = $state(0);
  let rail = $state(false);
  let shown = $state("config");
  let opened = $state(SECTIONS.map((section) => section.name));
  let hosts = $state({});

  const paged = $derived($fold === "page");
  const lit = (name) => (paged ? shown === name : opened.includes(name));
  const keys = $derived(SECTIONS.map(({ name }) => ({ name, label: name, latched: lit(name) })));
  const drawn = $derived(paged ? SECTIONS.filter((section) => section.name === shown) : SECTIONS);

  const reveal = (name) => requestAnimationFrame(() => hosts[name]?.scrollIntoView({ block: "start", behavior: "smooth" }));

  const pick = (name) => {
    if (paged) return void (shown = name);
    const opening = !opened.includes(name);
    opened = opening ? [...opened, name] : opened.filter((held) => held !== name);
    if (opening) reveal(name);
  };

  const solo = (name) => {
    shown = name;
    opened = [name];
    if (!paged) reveal(name);
  };

  const refold = (name) => {
    if (name === "page" && !opened.includes(shown)) shown = opened[0] ?? shown;
    bridge.setFold(name);
  };
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    data-zone="0"
    class="panel"
    class:railed={rail}
    bind:clientWidth={width}
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px">
    <div class="stack">
      {#each drawn as section (section.name)}
        <div class="fold" bind:this={hosts[section.name]}>
          <section.part open={paged || opened.includes(section.name)} ontoggle={paged ? null : () => pick(section.name)} />
        </div>
      {/each}
    </div>
    <Strip {keys} folds={FOLDS} fold={$fold} place={$place} {width} bind:rail onpick={pick} onsolo={solo} onfold={refold} />
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-sunk);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    color: var(--text-strong);
  }
  .panel.railed {
    flex-direction: row;
  }
  .stack {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 14px 12px 20px;
  }
  .fold {
    display: flex;
    flex-direction: column;
    gap: 8px;
    scroll-margin-top: 10px;
  }
</style>
