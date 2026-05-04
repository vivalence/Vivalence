<script>
  import SessionDock from "../../typology/components/dock/SessionDock.svelte";

  const MOCK_THREAD = {
    id: "t-fixture",
    name: "fixture",
    trait: { LABELED: { name: "session · fixture" } },
  };

  const PANEL_WIDTH  = 900;
  const PANEL_HEIGHT = 600;

  const SIDES = ["top", "right", "bottom", "left"];

  let dock = $state({ side: "right", share: 0.32, collapsed: false, session: "ended" });

  const side      = $derived(SIDES.includes(dock.side) ? dock.side : "right");
  const vertical  = $derived(side === "left" || side === "right");
  const share     = $derived(Math.max(0.18, Math.min(0.60, dock.share ?? 0.32)));
  const chatSize  = $derived(
    dock.collapsed ? 26 : Math.round((vertical ? PANEL_WIDTH : PANEL_HEIGHT) * share)
  );
  const flexDir   = $derived(
    side === "right"   ? "row"
    : side === "left"  ? "row-reverse"
    : side === "bottom"? "column"
    : "column-reverse"
  );

  function ondock(patch) {
    dock = { ...dock, ...patch };
  }

  function onTwig(event) {
    event.preventDefault();
    let lastPos = vertical ? event.clientX : event.clientY;
    function onMove(e) {
      const cur = vertical ? e.clientX : e.clientY;
      const delta = cur - lastPos;
      lastPos = cur;
      const sign = (side === "right" || side === "bottom") ? -1 : 1;
      const total = vertical ? PANEL_WIDTH : PANEL_HEIGHT;
      ondock({ share: Math.max(0.18, Math.min(0.60, share + sign * delta / total)), collapsed: false });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
</script>

<svelte:head>
  <title>port · harness</title>
</svelte:head>

<div class="harness">
  <div class="panel" style:width="{PANEL_WIDTH}px" style:height="{PANEL_HEIGHT}px" style:flex-direction={flexDir}>
    <div class="body">
      <span class="placeholder">buffer body · fixture</span>
      <button class="got-it">Got it</button>
    </div>

    {#if !dock.collapsed}
      <div class="twig" class:horizontal={!vertical} role="separator" onpointerdown={onTwig}></div>
    {/if}

    <div
      class="chat"
      style:width={vertical ? chatSize + "px" : "100%"}
      style:height={vertical ? "100%" : chatSize + "px"}
      style:flex={`0 0 ${chatSize}px`}
    >
      <SessionDock thread={MOCK_THREAD} {dock} {ondock} {side} />
    </div>
  </div>
</div>

<style>
  .harness {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: var(--colors-skeleton-0-surface);
  }
  .panel {
    display: flex;
    overflow: hidden;
    border: 1px solid var(--colors-skeleton-1-boundary);
  }
  .body {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    padding: 32px 36px;
    gap: 24px;
    background: var(--colors-skeleton-0-surface);
  }
  .placeholder {
    font-family: var(--font-family-code);
    font-size: 11px;
    color: var(--colors-skeleton-2-contrast);
    letter-spacing: 0.5px;
  }
  .got-it {
    width: 100%;
    padding: 14px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border-radius: 3px;
    font-size: 13px;
    letter-spacing: 0.5px;
    cursor: pointer;
    font-family: var(--font-family-code);
    margin-top: auto;
  }
  .twig {
    flex: 0 0 3px;
    background: var(--colors-skeleton-0-boundary);
    cursor: col-resize;
  }
  .twig.horizontal { cursor: row-resize; }
  .chat {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
