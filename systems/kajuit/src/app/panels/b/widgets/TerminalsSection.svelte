<script>
  import { getContext } from "svelte";
  import { TERMINALS } from "$client";
  import Section from "./Section.svelte";
  import TerminalRow from "./TerminalRow.svelte";

  const terminals = getContext(TERMINALS);

  let tabs = $state([...terminals.entities]);
  terminals.$entities.subscribe((entities) => (tabs = [...entities]));
</script>

<Section name="terminals" meta={`${tabs.length} terminal${tabs.length === 1 ? "" : "s"}`}>
  {#each tabs as t (t.id)}
    <TerminalRow terminal={t} onactivate={() => terminals.activate(t.id)} />
  {/each}
  <div class="actions">
    <button class="act" onclick={() => terminals.create()}>spawn</button>
    <button class="act danger" onclick={() => { for (const t of [...terminals.entities]) terminals.remove(t.id); }}>clear</button>
  </div>
</Section>
