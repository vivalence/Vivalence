<script>
  import { getContext } from "svelte";
  import { MAIN } from "$client";
  import Section from "./Section.svelte";

  const main = getContext(MAIN);

  let terminal = $state(main.terminal);
  let thread = $state(main.current);

  main.$terminal.subscribe((v) => (terminal = v));
  main.$current.subscribe((v) => (thread = v));
</script>

<Section name="main" meta={thread?.mode?.slug ?? "no thread"}>
  <div class="row" title={terminal?.id ?? ""}><span class="k">terminal</span><span class="v mono">{terminal?.id ?? "—"}</span></div>
  <div class="row" title={thread?.id ?? ""}><span class="k">thread</span><span class="v mono">{thread?.id ?? "—"}</span></div>
  <div class="row"><span class="k">mode</span><span class="v">{thread?.mode?.slug ?? "—"}</span></div>
  <div class="row"><span class="k">intent</span><span class="v">{thread?.intent?.slug ?? "—"}</span></div>
  {#if thread}
    <div class="actions">
      <button class="act danger" onclick={() => main.clear()}>clear thread</button>
    </div>
  {/if}
</Section>
