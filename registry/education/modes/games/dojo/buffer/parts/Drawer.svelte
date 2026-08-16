<script>
  import Library from "./Library.svelte";
  import Builder from "./Builder.svelte";
  import Clauses from "./Clauses.svelte";
  import Gameplay from "./Gameplay.svelte";

  const {
    open,
    tier = "wide",
    short = false,
    width = 0,
    height = 0,
    space = "build",
    side = "set",
    libraryOpen = false,
    panes = {},
    total = 0,
    axesSummary = "",
    startable = false,
    startLabel = "",
    committing = false,
    playing = false,
    library,
    builder,
    clauses,
    gameplay,
    onspace,
    onside,
    onlibrary,
    onclose,
    onstart,
    onstop,
    onpanes,
  } = $props();

  const PANE_MIN = 180;
  const BUILD_MIN = 320;
  const RAIL = 44;
  const DRAWER_MIN = 30;
  const DRAWER_MAX = 100;
  const CLICK_SLOP = 4;

  const narrow = $derived(tier === "narrow");
  const medium = $derived(tier === "medium");
  const wide = $derived(tier === "wide");

  const stubs = $derived([
    { id: "library", label: "library", meta: `${library.saved.length} saved` },
    { id: "build", label: "build", meta: "rule" },
    { id: "set", label: "set", meta: String(total) },
    { id: "gameplay", label: "gameplay", meta: axesSummary.toLowerCase() },
  ]);

  const spare = $derived.by(() => {
    if (!width) return Infinity;
    const others = wide
      ? (libraryOpen ? panes.library : RAIL) + panes.set + panes.gameplay
      : RAIL + panes.side;
    return Math.max(PANE_MIN, width - BUILD_MIN - others);
  });

  const clamp = (value, current) => Math.max(PANE_MIN, Math.min(current + spare, value));

  let dragging = null;

  function grab(pane, direction, event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging = { pane, direction, from: event.clientX, base: panes[pane] };
  }

  function drag(event) {
    if (!dragging) return;
    const delta = (event.clientX - dragging.from) * dragging.direction;
    onpanes({ [dragging.pane]: clamp(dragging.base + delta, panes[dragging.pane]) }, false);
  }

  function release() {
    if (!dragging) return;
    dragging = null;
    onpanes({}, true);
  }

  let lowering = null;

  function lower(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    lowering = { from: event.clientY, base: panes.drawer, moved: false };
  }

  function lowerMove(event) {
    if (!lowering || !height) return;
    const delta = event.clientY - lowering.from;
    if (Math.abs(delta) > CLICK_SLOP) lowering.moved = true;
    if (!lowering.moved) return;
    const percent = Math.max(DRAWER_MIN, Math.min(DRAWER_MAX, lowering.base + (delta / height) * 100));
    onpanes({ drawer: Math.round(percent) }, false);
  }

  function lowerEnd() {
    if (!lowering) return;
    const moved = lowering.moved;
    lowering = null;
    if (moved) onpanes({}, true);
    else onclose();
  }

  const drawerHeight = $derived(narrow || short ? "100%" : `${panes.drawer ?? 76}%`);

  const startText = $derived(committing ? "materializing…" : playing ? "restart · " + startLabel.replace(/^start · /, "") : startLabel);
</script>

<div class="drawer" class:open class:narrow style:height={drawerHeight}>
  {#if narrow}
    <button class="grab" title="send the drawer away" onclick={onclose}><span class="pill"></span></button>
  {/if}

  <div class="columns">
    {#if !narrow && !libraryOpen}
      <div class="rail">
        <button class="rail-button" title="library — saved sets, recents" onclick={onlibrary}>☰</button>
        <span class="rail-label">library</span>
      </div>
    {/if}

    {#if (wide && libraryOpen) || (narrow && space === "library")}
      <div class="column library" style:width={wide ? `${panes.library}px` : null}>
        <Library {...library} closable={wide} onclose={onlibrary} />
      </div>
      {#if wide}
        <div class="wall" role="separator" aria-orientation="vertical" onpointerdown={(event) => grab("library", 1, event)} onpointermove={drag} onpointerup={release}></div>
      {/if}
    {/if}

    {#if !narrow || space === "build"}
      <div class="column build">
        <Builder {...builder} {narrow} split={panes.results ?? null} onsplit={(px, persist) => onpanes({ results: px }, persist)} />
        {#if medium && libraryOpen}
          <div class="overlay">
            <Library {...library} closable onclose={onlibrary} />
          </div>
        {/if}
      </div>
    {/if}

    {#if wide || (narrow && space === "set")}
      {#if wide}
        <div class="wall" role="separator" aria-orientation="vertical" onpointerdown={(event) => grab("set", -1, event)} onpointermove={drag} onpointerup={release}></div>
      {/if}
      <div class="column set" style:width={wide ? `${panes.set}px` : null}>
        <Clauses {...clauses} />
      </div>
    {/if}

    {#if wide || (narrow && space === "gameplay")}
      {#if wide}
        <div class="wall" role="separator" aria-orientation="vertical" onpointerdown={(event) => grab("gameplay", -1, event)} onpointermove={drag} onpointerup={release}></div>
      {/if}
      <div class="column gameplay" style:width={wide ? `${panes.gameplay}px` : null}>
        <Gameplay {...gameplay} showStart={wide} />
      </div>
    {/if}

    {#if medium}
      <div class="wall" role="separator" aria-orientation="vertical" onpointerdown={(event) => grab("side", -1, event)} onpointermove={drag} onpointerup={release}></div>
      <div class="column side" style:width="{panes.side}px">
        <div class="side-tabs">
          <button class="side-tab" class:on={side === "set"} onclick={() => onside("set")}>set <span class="meta">{total}</span></button>
          <button class="side-tab" class:on={side === "gameplay"} onclick={() => onside("gameplay")}>gameplay <span class="meta">{axesSummary.toLowerCase()}</span></button>
        </div>
        <div class="side-body">
          {#if side === "set"}
            <Clauses {...clauses} />
          {:else}
            <Gameplay {...gameplay} showStart={false} />
          {/if}
        </div>
        <div class="side-start">
          <button class="start" class:ready={startable} disabled={!startable || committing} onclick={onstart}>{startText}</button>
          {#if playing}<button class="stop" title="end the session — the set and axes stay" onclick={onstop}>end</button>{/if}
        </div>
      </div>
    {/if}
  </div>

  {#if narrow}
    <div class="stub-bar">
      <div class="stubs">
        {#each stubs as stub (stub.id)}
          <button class="stub" class:on={space === stub.id} onclick={() => onspace(stub.id)}>
            <span class="stub-label">{stub.label}</span>
            <span class="stub-meta">{stub.meta}</span>
          </button>
        {/each}
      </div>
      <div class="start-pair">
        <button class="start" class:ready={startable} disabled={!startable || committing} onclick={onstart}>
          <span>{startText}</span><span class="arrow">▲</span>
        </button>
        {#if playing}<button class="stop" title="end the session — the set and axes stay" onclick={onstop}>end</button>{/if}
      </div>
    </div>
  {:else}
    <div
      class="close-bar"
      role="button"
      tabindex="0"
      title="drag to resize · click to send the drawer away"
      onpointerdown={lower}
      onpointermove={lowerMove}
      onpointerup={lowerEnd}
      onpointercancel={lowerEnd}
      onkeydown={(event) => {
        if (event.key === "Enter" || event.key === " ") onclose();
      }}>
      <span class="arrow">▲</span>
      <span class="pill small"></span>
      <span class="close-note">{total ? `close · ${total} in the set` : "close"}</span>
    </div>
  {/if}
</div>

<style>
  .drawer {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 76%;
    transform: translateY(-101%);
    transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1);
    background: var(--colors-skeleton-1-surface);
    border-bottom: 1px solid var(--colors-theme-primary-contrast);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    z-index: 6;
  }
  .drawer.open {
    transform: translateY(0);
  }
  .grab {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0 0.35rem;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .pill {
    width: 38px;
    height: 4px;
    border-radius: 2px;
    background: var(--colors-skeleton-2-boundary);
  }
  .pill.small {
    width: 44px;
    height: 3px;
  }
  .columns {
    flex: 1;
    min-height: 0;
    display: flex;
    position: relative;
  }
  .rail {
    flex: 0 0 44px;
    border-right: 1px solid var(--colors-skeleton-2-boundary);
    background: var(--colors-skeleton-1-surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0.6rem;
    gap: 0.5rem;
  }
  .rail-button {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 0.2rem;
    border: 1px solid var(--colors-skeleton-2-boundary);
    background: transparent;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    cursor: pointer;
    padding: 0;
  }
  .rail-button:hover {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }
  .rail-label {
    writing-mode: vertical-rl;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-support);
    opacity: 0.7;
  }
  .column {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: relative;
    flex: none;
  }
  .column.build {
    flex: 1 1 320px;
  }
  .column.library,
  .column.set,
  .column.gameplay,
  .column.side {
    flex: none;
  }
  .column.side {
    background: var(--colors-skeleton-0-surface);
  }
  .narrow .column {
    flex: 1 1 auto;
    width: auto !important;
    max-width: none;
    border: none;
  }
  .wall {
    flex: none;
    width: 7px;
    margin: 0 -3px;
    z-index: 4;
    cursor: col-resize;
    touch-action: none;
    position: relative;
  }
  .wall::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 3px;
    width: 1px;
    background: var(--colors-skeleton-2-boundary);
  }
  .wall:hover::after,
  .wall:active::after {
    background: var(--colors-theme-primary-contrast);
    width: 2px;
  }
  .overlay {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(300px, 100%);
    z-index: 3;
    border-right: 1px solid var(--colors-theme-primary-contrast);
    box-shadow: 12px 0 30px rgba(0, 0, 0, 0.4);
  }
  .side-tabs {
    flex: none;
    display: flex;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
  }
  .side-tab {
    flex: 1;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.55rem 0.4rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    cursor: pointer;
    min-width: 0;
  }
  .side-tab.on {
    color: var(--colors-theme-primary-contrast);
    border-bottom-color: var(--colors-theme-primary-contrast);
  }
  .meta {
    opacity: 0.6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .side-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .side-start,
  .start-pair {
    flex: none;
    display: flex;
    gap: 0.4rem;
  }
  .side-start {
    padding: 0.5rem 0.65rem;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
  }
  .start {
    flex: 1;
    min-width: 0;
    min-height: 2.75rem;
    border-radius: 0.25rem;
    border: 1px solid var(--colors-skeleton-2-boundary);
    background: transparent;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  .start.ready {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
  .start:disabled {
    cursor: default;
  }
  .stop {
    flex: none;
    padding: 0 0.8rem;
    border-radius: 0.25rem;
    border: 1px solid var(--colors-system-error-contrast);
    background: transparent;
    color: var(--colors-system-error-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    cursor: pointer;
  }
  .stub-bar {
    flex: none;
    border-top: 1px solid var(--colors-skeleton-2-boundary);
    background: var(--colors-skeleton-0-surface);
    padding: 0.45rem 0.5rem 0.55rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .stubs {
    display: flex;
    gap: 0.25rem;
  }
  .stub {
    flex: 1;
    min-width: 0;
    min-height: 2.75rem;
    border-radius: 0.25rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    padding: 0 0.15rem;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
  }
  .stub.on {
    border-color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .stub-meta {
    opacity: 0.6;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .arrow {
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
  }
  .close-bar {
    flex: none;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-1-surface);
    padding: 0.35rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    cursor: row-resize;
    touch-action: none;
    user-select: none;
  }
  .close-bar:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .close-bar .arrow {
    color: var(--colors-theme-primary-contrast);
  }
  .close-note {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
</style>
