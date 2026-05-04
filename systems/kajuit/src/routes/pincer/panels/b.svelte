<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, QUARTERS, BRIDGE } from "$client";

  let { rect } = $props();
  const lighthouse = getContext(LIGHTHOUSE);
  const quarters = getContext(QUARTERS);
  const bridge = getContext(BRIDGE);

  let g = $state(bridge.view.g);
  let h = $state(bridge.view.h);
  let snap = $state(bridge.view.snap);
  bridge.view.$g.subscribe(v => g = v);
  bridge.view.$h.subscribe(v => h = v);
  bridge.view.$snap.subscribe(v => snap = v);

  let eruda = $state(false);
  async function toggleEruda() {
    if (!eruda) {
      if (!window.eruda) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/eruda";
        script.onload = () => { window.eruda.init(); eruda = true; };
        document.head.appendChild(script);
      } else {
        window.eruda.init();
        eruda = true;
      }
    } else {
      window.eruda.destroy();
      eruda = false;
    }
  }
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px"
  >
    <span class="label">B</span>
    <div class="toggles">
      <button class="toggle" class:active={g} onclick={() => bridge.toggle("g")}>G</button>
      <button class="toggle" class:active={h} onclick={() => bridge.toggle("h")}>H</button>
      <button class="toggle" class:active={snap} onclick={() => bridge.toggle("snap")}>snap</button>
      <button class="toggle danger" onclick={() => { for (const terminal of quarters.terminals.all()) quarters.close(terminal.id); }}>clear</button>
      <button class="toggle danger" onclick={() => lighthouse.logout()}>out</button>
      <button class="toggle" class:active={eruda} onclick={toggleEruda}>eruda</button>
    </div>
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
  }
  .label {
    font-size: 64px;
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }
  .toggles {
    display: flex;
    gap: 6px;
  }
  .toggle {
    height: 24px;
    min-width: 32px;
    padding: 0 8px;
    background: var(--colors-skeleton-2-surface);
    border: 1px solid var(--colors-skeleton-2-boundary);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0.55;
  }
  .toggle:hover {
    opacity: 0.85;
  }
  .toggle.active {
    opacity: 1;
    border-color: var(--colors-skeleton-2-primary-base);
    color: var(--colors-skeleton-2-primary-base);
  }
  .toggle.danger {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
    opacity: 0.4;
  }
  .toggle.danger:hover {
    opacity: 0.85;
  }
</style>
