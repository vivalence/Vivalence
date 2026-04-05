<script>
  import { page } from "$app/stores";
  import { setContext, onDestroy } from "svelte";
  import { Terminal } from "../../../terminal/terminal.js";
  import { populate } from "./lib/populate.js";
  import Stream from "./phases/Stream.svelte";

  const terminal = new Terminal();
  setContext("terminal", terminal);

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

{#if $phase === "STREAM"}
  <Stream />
{/if}
