<script>
  import { getContext } from "svelte";
  import { TERMINALS } from "$client";
  import Section from "./Section.svelte";

  const terminals = getContext(TERMINALS);

  let terminal = $state(terminals.active);
  let thread = $state(terminals.active?.thread);

  const syncThread = () => (thread = terminals.active?.thread ?? null);
  terminals.$active.subscribe((v) => {
    terminal = v;
    syncThread();
  });
  terminals.$entities.subscribe(syncThread);
</script>

<Section name="main" meta={thread?.mode?.slug ?? "no thread"}>
  <div class="row" title={terminal?.id ?? ""}><span class="k">terminal</span><span class="v mono">{terminal?.id ?? "—"}</span></div>
  <div class="row" title={thread?.id ?? ""}><span class="k">thread</span><span class="v mono">{thread?.id ?? "—"}</span></div>
  <div class="row"><span class="k">mode</span><span class="v">{thread?.mode?.slug ?? "—"}</span></div>
  <div class="row"><span class="k">intent</span><span class="v">{thread?.intent?.slug ?? "—"}</span></div>
  {#if thread}
    <div class="actions">
      <button class="act danger" onclick={() => (terminals.active.thread = null)}>clear thread</button>
    </div>
  {/if}
</Section>
