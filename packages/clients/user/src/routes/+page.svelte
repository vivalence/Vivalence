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

  {#each data.tags as tag}
  <div class="card bg-base-100 w-96 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{tag.name}</h2>
      {#if tag.description}
      <p>{tag.description}</p>
      {/if}

      <div class="card-actions justify-end">
        <button class="btn btn-primary" on:click="{to(tag)}">Learn Now</button>
      </div>
    </div>
  </div>
  {/each}
</div>
