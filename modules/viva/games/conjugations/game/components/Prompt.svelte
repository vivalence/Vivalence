<script>
  import { getStore } from "../store.js";
  const store = getStore();
</script>

<header class="card bg-base-100 rounded-t-xl rounded-b-none">
  <div class="card-body">
    <div class="flex flex-row">
      <h1 class="card-title text-xl mr-2">
        {$store.instruction.infinitive.known}
      </h1>
      {#if $store.revealed}
        <h1 class="card-title text-2xl mr-2">-</h1>

        <h1 class="card-title text-2xl">
          {$store.instruction.infinitive.learning}
        </h1>
      {/if}
    </div>
    <div class="flex flex-row">
      <label class="text-sm mr-2"> in: </label>
      <label class="badge badge-secondary mr-2">
        {$store.instruction.tense}
      </label>

      <label class="badge badge-secondary">
        {$store.instruction.mood}
      </label>
    </div>
  </div>
</header>
