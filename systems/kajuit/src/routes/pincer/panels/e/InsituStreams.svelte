<script>
  import Row from "./Row.svelte";

  let { thread, terminal } = $props();

  let dialoguePackets = $state(0);
  let lastPacket = $state(null);
  let queueOpen = $state(false);

  $effect(() => {
    const queue = terminal?.streams?.dialogue;
    if (!queue) {
      dialoguePackets = 0;
      lastPacket = null;
      queueOpen = false;
      return;
    }
    queueOpen = true;
    function read() {
      dialoguePackets = queue.size?.() ?? queue.length ?? 0;
    }
    read();
    const interval = setInterval(read, 250);
    return () => {
      clearInterval(interval);
    };
  });
</script>

<Row letter="X" name="streams" status={queueOpen ? "live" : "—"} statusKind={queueOpen ? "live" : "stub"}>
  <div class="kv">
    <span class="k">dialogue</span>
    <span class="v">
      <span class="lamp" class:on={queueOpen}></span>
      <span>{queueOpen ? "queue open" : "no queue"}</span>
      <span class="muted">· buffered {dialoguePackets}</span>
    </span>
  </div>
  {#if lastPacket}
    <div class="kv">
      <span class="k">last</span>
      <code class="v">{JSON.stringify(lastPacket)}</code>
    </div>
  {/if}
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
  .v {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
  }
  .lamp {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
  }
  .lamp.on {
    background: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .muted {
    opacity: 0.4;
    font-size: 8px;
  }
  code {
    font: inherit;
    font-size: 8px;
    opacity: 0.6;
    word-break: break-all;
  }
</style>
