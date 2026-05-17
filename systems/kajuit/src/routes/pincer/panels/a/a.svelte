<script>
  import { getContext } from "svelte";
  import { MAIN, QUARTERS } from "$client";
  import { Frame } from "@vivalence/drapes";
  import Dock from "./widgets/Dock.svelte";
  import { resolve, shareAfterDrag, defaultDock } from "./dock.geometry.js";

  let { rect } = $props();

  const main = getContext(MAIN);
  const quarters = getContext(QUARTERS);

  let currentThread = $state(null);
  let bufferAtom = $state(null);
  let buffer = $state(null);
  let status = $state(null);
  let terminal = $state(null);
  let dock = $state(defaultDock());
  let threadTraits = $state([]);

  let teardownBuffer = null;
  let teardownStatus = null;
  let teardownDock = null;
  let teardownTraits = null;

  main.$terminal.subscribe((value) => {
    terminal = value;
    if (teardownDock) {
      teardownDock();
      teardownDock = null;
    }
    if (value?.$dock) {
      dock = value.dock;
      teardownDock = value.$dock.subscribe((next) => {
        dock = next;
      });
    }
  });

  main.$current.subscribe((current) => {
    currentThread = current;
    if (teardownBuffer) {
      teardownBuffer();
      teardownBuffer = null;
    }
    if (teardownStatus) {
      teardownStatus();
      teardownStatus = null;
    }
    if (teardownTraits) {
      teardownTraits();
      teardownTraits = null;
    }
    bufferAtom = null;
    buffer = null;
    status = null;
    threadTraits = current?.traits ?? [];
    if (!current) return;
    bufferAtom = current.$buffer;
    teardownBuffer = current.$buffer.subscribe((value) => {
      buffer = value;
    });
    if (current.queue) {
      teardownStatus = current.queue.$status.subscribe((value) => {
        status = value;
      });
    }
    teardownTraits = current.$traits.subscribe((next) => {
      threadTraits = next;
    });
  });

  const dockEnabled = $derived(threadTraits.includes("CONVERSATIONAL"));
  const geometry = $derived(resolve(dock, rect));

  function ondock(patch) {
    const next = { ...dock, ...patch };
    if (terminal?.id && quarters?.terminals?.update) {
      quarters.terminals.update(terminal.id, { dock: next });
    } else if (terminal?.$dock) {
      terminal.$dock.set(next);
    } else {
      dock = next;
    }
  }

  function onTwig(event) {
    event.preventDefault();
    const axis = geometry.vertical ? "clientX" : "clientY";
    let lastPos = event[axis];

    function onMove(e) {
      const current = e[axis];
      const deltaPx = current - lastPos;
      lastPos = current;
      const nextShare = shareAfterDrag({
        side: geometry.side,
        share: geometry.share,
        rect,
        deltaPx,
      });
      ondock({ share: nextShare });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:flex-direction={geometry.direction}
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px">
    <div class="body">
      {#if buffer && bufferAtom}
        <Frame buffer={bufferAtom} />
      {:else if currentThread}
        <div class="yield-state">
          {#if status === "EXHAUSTED"}
            <p class="yield-label">session complete</p>
          {:else if status === "ERROR"}
            <p class="yield-label yield-error">
              {currentThread.queue?.$error.get()?.message ?? "error"}
            </p>
          {:else}
            <span class="yield-dot"></span>
          {/if}
        </div>
      {:else}
        <span class="label">A</span>
      {/if}
    </div>

    {#if dockEnabled}
      <div
        class="twig"
        class:horizontal={!geometry.vertical}
        role="separator"
        aria-orientation={geometry.vertical ? "vertical" : "horizontal"}
        onpointerdown={onTwig}>
      </div>

      <div
        class="chat"
        style:width={geometry.vertical ? geometry.size + "px" : "100%"}
        style:height={geometry.vertical ? "100%" : geometry.size + "px"}
        style:flex={`0 0 ${geometry.size}px`}>
        <Dock thread={currentThread} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: flex;
    overflow: hidden;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
  }
  .body {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    display: grid;
    place-items: center;
  }
  .twig {
    flex: 0 0 3px;
    background: var(--colors-skeleton-0-boundary);
    cursor: col-resize;
  }
  .twig.horizontal {
    cursor: row-resize;
  }
  .chat {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .label {
    font-size: 64px;
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }
  .yield-state {
    display: grid;
    place-items: center;
    min-height: 0;
    height: 100%;
  }
  .yield-label {
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .yield-error {
    color: var(--colors-skeleton-0-danger-base);
  }
  .yield-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
</style>
