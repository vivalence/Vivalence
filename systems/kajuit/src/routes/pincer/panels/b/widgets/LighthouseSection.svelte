<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE } from "$client";
  import Section from "./Section.svelte";

  const lighthouse = getContext(LIGHTHOUSE);

  let status = $state(lighthouse.status);
  let identity = $state(lighthouse.identity);
  let daemons = $state(lighthouse.$daemons.get() ?? []);

  lighthouse.$status.subscribe((v) => (status = v));
  lighthouse.$identity.subscribe((v) => (identity = v));
  lighthouse.$daemons.subscribe((v) => (daemons = v ?? []));
</script>

<Section name="lighthouse" meta={(status?.code ?? "—").toLowerCase()}>
  <div class="row"><span class="k">identity</span><span class="v">{identity?.slug ?? "—"}</span></div>
  <div class="row"><span class="k">daemons</span><span class="v">{daemons.length}</span></div>
  {#each daemons as d (d.slug)}
    <div class="row"><span class="k">{d.slug}</span><span class="v">{d.connection?.$state?.get?.() ?? "—"}</span></div>
  {/each}
  <div class="actions">
    <button class="act danger" onclick={() => lighthouse.logout()}>logout</button>
  </div>
</Section>
