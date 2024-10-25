<script>
  import { goto } from "$app/navigation";

  import { Button } from "@vivalence/ui";
  export let data;
  const to = (tag) => () => goto(`/dependency/${tag.id}`);
</script>

<div class="container mx-auto p-4">
  <div class="prose mb-5">
    <h1 class="">Hello world!</h1>
  </div>

  {#each data.dependencies as dependency}
    <div class="card bg-base-300 w-96 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">{dependency.name}</h2>
        <div class="flex flex-row">
          {#if dependency.available}
            <p>available</p>
          {/if}
          {#if dependency.satisfied}
            <p>satisfied</p>
          {/if}
        </div>
        {#if dependency.description}
          <p>{dependency.description}</p>
        {/if}

        <div class="card-actions justify-end">
          <button class="btn btn-primary" on:click={to(dependency)}>Learn Now</button>
        </div>
      </div>
    </div>
  {/each}
</div>
