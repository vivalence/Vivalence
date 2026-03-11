<script>
  import { effect } from "nanostores";
  import { Text } from "@vivalence/drapes";
  import { Terminal } from "@vivalence/html/typology";
  import { setContext, getContext, onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { parse, serialize } from "./lib/url.js";
  import { populate } from "./lib/populate.js";

  import Modeline from "./Modeline.svelte";
  import Stream from "./phases/Stream.svelte";

  const terminal = new Terminal();
  setContext("terminal", terminal);

  let unsubs = [];
  // let booted = false;

  afterNavigate(({ to }) => {
    if (!to?.url) return;
    // booted = true;

    parse(terminal, to.url);
    unsubs.push(serialize(terminal));
    // console.log("afterNvigate", to?.url?.pathname, terminal.perspective, to?.url?.search);
  });

  unsubs.push(
    effect(terminal.$perspective, (perspective) => {
      if (perspective) populate(terminal);
    }),
  );

  onDestroy(() => {
    unsubs.forEach((fn) => fn?.());
  });

  const phase = terminal.$phase;
</script>

<div class="bsp-node" style="grid-template-rows: 1fr auto;">
  <div class="bsp-node">
    {#if $phase === "STREAM"}
      <Stream />
    {:else if $phase === "FEED"}
      <!-- <Feed /> -->
    {:else if $phase === "CHAT"}
      <!-- <Chat /> -->
    {/if}
  </div>

  <Modeline />
</div>
