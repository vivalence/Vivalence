<script>
  import { page } from "$app/stores";
  import { setContext, onDestroy } from "svelte";
  import { Terminal } from "@vivalence/html/typology";
  import { populate } from "./lib/populate.js";

  import Modeline from "./Modeline.svelte";
  import Stream from "./phases/Stream.svelte";

  const terminal = new Terminal();
  setContext("terminal", terminal);
  window.__viva_terminal = terminal;

  function mount(segments) {
    if (!segments) return;
    terminal.reset();
    populate(terminal, segments);
  }

  const unsub = page.subscribe(($page) => {
    mount($page.params.terminal);
  });

  onDestroy(unsub);

  const phase = terminal.$phase;
</script>

<div class="bsp-node" style="grid-template-rows: 1fr auto; height: 100dvh;">
  <div class="bsp-node">
    {#if $phase === "STREAM"}
      <Stream />
    {/if}
  </div>
  <Modeline />
</div>
