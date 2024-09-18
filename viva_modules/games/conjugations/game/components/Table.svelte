<script>
  import TableRow from "./TableRow.svelte";

  import { getStore } from "../store.js";
  const store = getStore();
</script>

<div
  class={`overflow-x-auto container bg-base-100 pt-4 pb-6 px-4 rounded-b-xl border-t-2 border-neutral`}
>
  <table class="table">
    <thead>
      <tr>
        <th class="w-1">Person</th>
        <th>Conjugation</th>
        <th class={`text-neutral-content/${$store.revealed ? "100" : "0"}`}>Corrent Answer</th>
      </tr>
    </thead>
    <tbody>
      {#each $store.instruction.conjugations as conjugation}
        <TableRow {conjugation} />
      {/each}
    </tbody>
  </table>
</div>
