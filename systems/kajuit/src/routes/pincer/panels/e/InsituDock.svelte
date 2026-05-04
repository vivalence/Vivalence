<script>
  import Row from "./Row.svelte";

  let { thread, terminal } = $props();

  const SIDES = ["top", "right", "bottom", "left"];

  let dock = $state({ side: "right", share: 0.32, collapsed: true, session: "ended" });
  let teardown;

  $effect(() => {
    teardown?.();
    const atom = terminal?.$dock;
    if (!atom) return;
    dock = atom.get();
    teardown = atom.subscribe((value) => (dock = value));
    return () => teardown?.();
  });

  function patch(next) {
    if (!terminal?.$dock) return;
    terminal.$dock.set({ ...dock, ...next });
  }

  function setSide(side) {
    patch({ side, collapsed: false });
  }
  function toggleCollapsed() {
    patch({ collapsed: !dock.collapsed });
  }
  function toggleSession() {
    patch({ session: dock.session === "live" ? "ended" : "live" });
  }
  function setShare(value) {
    const next = Math.max(0.1, Math.min(0.9, Number(value)));
    patch({ share: next, collapsed: false });
  }

  let live = $derived(dock.session === "live");
</script>

<Row letter="D" name="dock" status={dock.collapsed ? "collapsed" : `${dock.side} · ${Math.round(dock.share * 100)}%`} statusKind={live ? "live" : "idle"}>
  <div class="kv">
    <span class="k">side</span>
    <div class="chips">
      {#each SIDES as side}
        <button class="chip" class:on={dock.side === side} onclick={() => setSide(side)}>{side}</button>
      {/each}
    </div>
  </div>
  <div class="kv">
    <span class="k">share</span>
    <input
      type="range"
      min="0.1"
      max="0.9"
      step="0.01"
      value={dock.share}
      oninput={(e) => setShare(e.currentTarget.value)}
      class="slider" />
    <span class="muted small">{Math.round(dock.share * 100)}%</span>
  </div>
  <div class="kv">
    <span class="k">collapsed</span>
    <button class="chip" class:on={dock.collapsed} onclick={toggleCollapsed}>{dock.collapsed ? "yes" : "no"}</button>
  </div>
  <div class="kv">
    <span class="k">session</span>
    <button class="chip" class:on={live} onclick={toggleSession}>{dock.session}</button>
  </div>
</Row>

<style>
  .kv {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .k {
    min-width: 80px;
    opacity: 0.5;
  }
  .chips {
    display: flex;
    gap: 3px;
    flex: 1;
  }
  .chip {
    padding: 1px 6px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: 8px;
    cursor: pointer;
    opacity: 0.55;
  }
  .chip:hover {
    opacity: 0.85;
  }
  .chip.on {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .slider {
    flex: 1;
  }
  .muted {
    opacity: 0.4;
  }
  .small {
    font-size: 8px;
  }
</style>
