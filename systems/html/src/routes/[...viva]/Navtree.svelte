<script>
  import { goto } from "$app/navigation";
  import { getContext } from "svelte";
  import { dataspace } from "$client";

  const terminal = getContext("terminal");
  const daemon = terminal.$daemon;
  const mode = terminal.$mode;
  const valence = terminal.$valence;
  let { onnavigate } = $props();

  const daemons = $derived([...dataspace.daemon.$entities.get()]);

  const navigableModes = (d) =>
    [...d.entities.mode.$entities.get()].filter((m) => m.implements("BUFFERED"));

  const valenticModes = (d) =>
    [...d.entities.mode.$entities.get()]
      .filter((m) => m.implements("VALENTIC"))
      .filter((m) => [...(m.valences || [])].some((v) => v.type === "SELFEVIDENT"));

  const selfevidentValences = (m) =>
    [...(m.valences || [])].filter((v) => v.type === "SELFEVIDENT");

  function navMode(m) {
    goto(m.link.absolute);
    terminal.reset();
  }

  function navValence(v) {
    goto(v.link.absolute);
    terminal.reset();
  }
</script>

<div class="nt" onclick={(e) => e.stopPropagation()}>
  {#each daemons as d (d.slug)}
    <div class="nt-daemon">{d.manifest?.name ?? d.slug}</div>

    <div class="nt-group">modes</div>
    {#each navigableModes(d) as m (m.id)}
      <button class="nt-val" class:active={$mode?.id === m.id} onclick={() => navMode(m)}>
        <span class="nt-dot" class:active={$mode?.id === m.id}></span>
        {m.manifest?.name ?? m.slug}
      </button>
    {/each}

    <div class="nt-group">valences</div>
    {#each valenticModes(d) as m (m.id)}
      <div class="nt-mode">{m.manifest?.name ?? m.slug}</div>
      {#each selfevidentValences(m) as v (v.id)}
        {@const isActive = $mode?.id === m.id && $valence?.id === v.id}
        <button class="nt-val" class:active={isActive} onclick={() => navValence(v)}>
          <span class="nt-dot" class:active={isActive}></span>
          {v.slug}
        </button>
      {/each}
    {/each}
  {/each}
</div>

<style>
  .nt {
    position: absolute;
    bottom: 100%;
    left: 0;
    min-width: 180px;
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: none;
    border-radius: var(--border-radius-default) var(--border-radius-default) 0 0;
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
    padding: 4px 0;
    z-index: 100;
  }

  .nt-daemon {
    padding: 6px 10px 2px;
    font-size: 10px;
    font-weight: 600;
    color: var(--colors-skeleton-1-contrast);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
  }

  .nt-daemon:first-child {
    border-top: none;
  }

  .nt-group {
    padding: 6px 10px 2px;
    font-size: 8px;
    color: var(--colors-skeleton-2-contrast);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    margin-top: 2px;
  }

  .nt-mode {
    padding: 4px 10px 2px 16px;
    font-size: 9px;
    color: var(--colors-skeleton-2-contrast);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .nt-val {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 28px;
    padding: 0 10px 0 16px;
    background: none;
    border: none;
    font: inherit;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-contrast);
    cursor: pointer;
    text-align: left;
  }

  .nt-val:hover {
    background: var(--colors-skeleton-2-surface);
  }

  .nt-val.active {
    color: var(--colors-theme-primary-contrast);
  }

  .nt-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--colors-skeleton-2-contrast);
  }

  .nt-dot.active {
    background: var(--colors-theme-primary-contrast);
  }
</style>
