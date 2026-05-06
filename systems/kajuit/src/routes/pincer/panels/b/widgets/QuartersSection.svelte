<script>
  import { getContext } from "svelte";
  import { QUARTERS, TOP } from "$client";
  import Section from "./Section.svelte";

  const quarters = getContext(QUARTERS);
  const top = getContext(TOP);

  let terminals = $state([...quarters.terminals.all()]);
  quarters.terminals.$entities.subscribe((m) => (terminals = [...m.values()]));
</script>

<Section name="quarters" meta={`${terminals.length} terminal${terminals.length === 1 ? "" : "s"}`}>
  {#each terminals as t (t.id)}
    <div class="row click" onclick={() => top.activate(t.id)} role="button" tabindex="0" title={t.thread?.id ?? ""}>
      <span class="k">{t.slug ?? t.id}</span>
      <span class="v mono">{t.thread?.id ?? "idle"}</span>
    </div>
  {/each}
  <div class="actions">
    <button class="act" onclick={() => top.spawn()}>spawn</button>
    <button class="act danger" onclick={() => { for (const t of quarters.terminals.all()) top.close(t.id); }}>clear</button>
  </div>
</Section>

