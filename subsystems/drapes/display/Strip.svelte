<script>
  import Key from "../controls/Key.svelte";
  import Float from "../panels/Float.svelte";
  import { fit, SHORT } from "./strip.js";

  const SOLO = 450;
  const CHOOSE = 420;

  let { keys = [], folds = [], fold = null, place = "bottom", width = 0, rail = $bindable(false), onpick, onsolo, onfold } = $props();

  let strip = $state(null);
  let full = $state([]);
  let short = $state([]);
  let folder = $state(0);
  let turned = $state(null);
  let listed = $state(false);
  let choosing = $state(false);

  const cut = (label) => label.slice(0, SHORT);
  const active = $derived(Math.max(0, keys.findIndex((key) => key.latched)));
  const held = $derived(
    fit({ width, full: keys.map((key, index) => full[index] ?? 0), short: keys.map((key, index) => short[index] ?? 0), fold: folder, stacked: fold === "stack", active }),
  );
  const page = $derived(held.mode === "pages" ? Math.min(held.pages.length - 1, turned ?? held.page) : 0);
  const shown = $derived(held.mode === "pages" ? keys.slice(...held.pages[page]) : held.mode === "merged" ? keys.slice(active, active + 1) : keys);
  const small = $derived(held.mode === "rail" || held.mode === "merged");
  const side = $derived(held.mode === "rail" ? "after" : place === "top" ? "below" : "above");

  $effect(() => {
    rail = held.mode === "rail";
  });

  const pick = (key) => {
    listed = false;
    onpick?.(key.name);
  };

  const choose = (name) => {
    choosing = false;
    onfold?.(name);
  };

  const cycle = () => onfold?.(folds[(folds.indexOf(fold) + 1) % folds.length]);
</script>

<div class="sizer" inert>
  {#each keys as key, index (key.name)}
    <span bind:offsetWidth={full[index]}><Key size="row" led={key.led} label={key.label} /></span>
    <span bind:offsetWidth={short[index]}><Key size="row" led={key.led} label={cut(key.label)} /></span>
  {/each}
  {#if folds.length}<span bind:offsetWidth={folder}><Key size="row" led label={fold} /></span>{/if}
</div>

<div data-zone="0" class="strip {held.mode} {place}" style:zoom={held.zoom} bind:this={strip}>
  {#if held.mode === "pages"}
    <Key size="row" square muted={page === 0} title="previous" label="‹" onclick={() => (turned = Math.max(0, page - 1))} />
    <span class="spring"></span>
  {/if}
  {#each shown as key (key.name)}
    <Key
      size={small ? "mini" : "row"}
      latched={key.latched}
      led={key.led && !small}
      title={key.label}
      hold={SOLO}
      onhold={() => onsolo?.(key.name)}
      onclick={() => (held.mode === "merged" ? (listed = !listed) : pick(key))}>
      {held.labels === "short" ? cut(key.label) : key.label}
      {#if key.count != null && !small}<span class="count">{key.count}</span>{/if}
    </Key>
  {/each}
  {#if held.mode === "pages"}
    <span class="spring"></span>
    <Key size="row" square muted={page === held.pages.length - 1} title="next" label="›" onclick={() => (turned = Math.min(held.pages.length - 1, page + 1))} />
  {:else}
    <span class="spring"></span>
  {/if}
  {#if folds.length}
    <Key
      size={small ? "mini" : "row"}
      square={held.labels === "short" || small}
      latched={choosing}
      title="fold · {fold} · click to cycle · hold for all"
      hold={CHOOSE}
      onhold={() => (choosing = true)}
      onclick={cycle}>
      <span class="pips">{#each folds as name (name)}<i class:lit={name === fold}></i>{/each}</span>
      {#if held.mode === "row" && held.labels === "full"}{fold}{/if}
    </Key>
  {/if}
</div>

{#if choosing}
  <Float anchor={strip} zone="0" {side} snug onclose={() => (choosing = false)}>
    {#each folds as name (name)}
      <Key size="row" latched={name === fold} label={name} onclick={() => choose(name)} />
    {/each}
  </Float>
{/if}

{#if listed}
  <Float anchor={strip} zone="0" {side} snug onclose={() => (listed = false)}>
    {#each keys as key (key.name)}
      <Key size="row" latched={key.latched} led={key.led} label={key.label} hold={SOLO} onhold={() => onsolo?.(key.name)} onclick={() => pick(key)} />
    {/each}
  </Float>
{/if}

<style>
  .sizer {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    display: flex;
    height: 0;
    overflow: hidden;
  }
  .sizer span {
    flex: none;
    display: inline-block;
  }
  .strip {
    order: 1;
    flex: none;
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 6px calc(5px + var(--size-depth));
    background: var(--surface-sunk);
    color: var(--text-strong);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  .strip.top,
  .strip.rail {
    order: -1;
  }
  .strip.pages {
    gap: 8px;
  }
  .strip.merged {
    padding: 3px 6px calc(3px + var(--size-depth));
  }
  .strip.rail {
    flex-direction: column;
    gap: 2px;
    padding: 4px 3px;
  }
  .spring {
    flex: 1 1 0;
    min-width: 0;
  }
  .count {
    letter-spacing: 0;
    color: var(--control-on-muted);
  }
  .pips {
    display: grid;
    grid-template-columns: repeat(2, 4px);
    gap: 2px;
  }
  .pips i {
    width: 4px;
    height: 4px;
    border-radius: var(--shape-radius-full);
    background: var(--boundary);
  }
  .pips i.lit {
    background: var(--signal-primary-ink);
  }
</style>
