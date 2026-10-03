<script>
  import { getContext } from "svelte";
  import { stores } from "@vivalence/anima";
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
  const panes = stores.bridge.panes;
  const { PANE_BAR, PANE_HEAD } = panes;
  const FOLDS = panes.PANELS.b.folds;

  const bridge = getContext(BRIDGE);
  const tree = bridge.panels.b.$tree;
  const fold = bridge.panels.b.$fold;
  const expanded = bridge.panels.b.$expanded;
  const previous = bridge.panels.b.$previous;
  const place = bridge.view.$strip;

  let width = $state(0);
  let rail = $state(false);
  let hosts = $state({});

  const paged = $derived($fold === "page");
  const opened = $derived(panes.leaves($tree));
  const shown = $derived(panes.shown($tree, $expanded));
  const alone = $derived($tree?.type === "leaf" && Boolean($previous));
  const keys = $derived(SECTIONS.map(({ name }) => ({ name, label: name, latched: panes.latched({ tree: $tree, fold: $fold, expanded: $expanded }, name) })));
  const drawn = $derived(paged ? SECTIONS.filter((section) => section.name === shown) : SECTIONS);

  const reveal = (name) => requestAnimationFrame(() => hosts[name]?.scrollIntoView({ block: "start", behavior: "smooth" }));

  function commit(next) {
    for (const [key, value] of Object.entries(next)) bridge.panels.b[key] = value;
    bridge.save();
  }

  const pick = (name) => {
    const opening = !opened.includes(name);
    commit(panes.tap({ tree: $tree, fold: $fold }, name));
    if (!paged && opening) reveal(name);
  };

  const solo = (name) => {
    commit({ ...panes.solo($tree, name, $previous), expanded: name });
    if (!paged) reveal(name);
  };

  const refold = (name) => commit({ fold: name });
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
    style:height="{rect.height}px"
    style:--pane-rest="{PANE_HEAD}px"
    style:--pane-bar="{PANE_BAR}px">
    <div class="stack" class:paged>
      {#each drawn as section (section.name)}
        <div class="fold" bind:this={hosts[section.name]}>
          <section.part
            name={section.name}
            framed
            flowing={!paged}
            folded={!(paged || opened.includes(section.name))}
            tappable={!paged}
            ontap={pick}
            {alone}
            onsolo={solo}
            onpark={paged ? null : pick} />
        </div>
      {/each}
    </div>
    <Strip {keys} folds={FOLDS} fold={$fold} place={$place} {width} bind:rail onpick={pick} onsolo={solo} onfold={refold} />
  </div>
{/if}

<style>
  .panel {
    --pane-gutter: 2px;
    --pane-head: calc(var(--pane-rest) - 2 * var(--pane-gutter));
    position: fixed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    color: var(--text-strong);
  }
  @media (pointer: coarse) {
    .panel {
      --pane-head: var(--pane-bar);
    }
  }
  .panel.railed {
    flex-direction: row;
  }
  .stack {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }
  .stack.paged {
    padding: var(--pane-gutter);
    overflow: hidden;
  }
  .fold {
    display: flex;
    flex-direction: column;
    min-height: 0;
    scroll-margin-top: 10px;
  }
  .stack.paged .fold {
    flex: 1;
  }
</style>
