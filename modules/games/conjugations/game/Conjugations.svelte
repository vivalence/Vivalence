<script>
  import { onMount, onDestroy } from "svelte";
  import { Text, Button, Input } from "@vivalence/ui";

  const { instruction, game, scope, keybindings, next } = $props();
  let revealed = $state(false);
  let inputs = $state({});
  let evaluations = $state([]);

  const evaluate = async () => {
    revealed = true;
    const params = {
      conjugations: instruction.conjugations.map((c) => ({
        id: c.scope.unit.id,
        input: inputs[c.scope.unit.id],
      })),
      scope,
    };
    const { data } = await game.call("/evaluate", params);
    evaluations = data;
  };

  const onNext = () => {
    next();
  };

  const onInput = (id, value) => {
    inputs = { ...inputs, [id]: value };
  };

  keybindings({
    Enter: () => {
      if (!revealed) evaluate();
      else onNext();
    },
  });
</script>

<section class="container mx-auto mt-12 mb-20">
  {#if instruction}
    <header class="bg-base-100 rounded-t-xl p-4 shadow">
      <!-- Updated card class -->
      <div class="card-body">
        <h1 class="text-xl font-bold">{instruction.infinitive.known}</h1>
        {#if revealed}
          <h1 class="text-2xl font-bold">- {instruction.infinitive.learning}</h1>
        {/if}
        <div>
          <span class="badge badge-secondary">{instruction.tense}</span>
          <span class="badge badge-secondary">{instruction.mood}</span>
        </div>
      </div>
    </header>

    <div class="overflow-x-auto bg-base-100 py-6 px-4 rounded-b-xl border-t-2">
      <table class="table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Conjugation</th>
            <th class={revealed ? "visible" : "invisible"}>Correct Answer</th>
          </tr>
        </thead>
        <tbody>
          {#each instruction.conjugations as conjugation, index}
            <tr>
              <td>{index + 1}</td>
              <td>
                <Input
                  class={`input input-bordered input-lg w-full`}
                  placeholder={conjugation.known}
                  value={inputs[conjugation.scope.unit.id] || ""}
                  oninput={(e) => onInput(conjugation.scope.unit.id, e.target.value)}
                  disabled={revealed} />
              </td>
              <td>{revealed && conjugation.learning}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="fixed bottom-0 w-full bg-base-100 py-6 flex justify-center">
      {#if !revealed}
        <button
          class="btn btn-accent"
          on:click={evaluate}
          disabled={Object.keys(inputs).length !== instruction.conjugations.length}>
          Check
        </button>
      {:else}
        <button class="btn btn-accent" on:click={onNext}>Next</button>
      {/if}
    </div>
  {/if}
</section>

<style>
  .invisible {
    visibility: hidden;
  }
  .visible {
    visibility: visible;
  }

  .bg-base-100 {
    background-color: #f8fafc;
  }

  .shadow {
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .badge {
    display: inline-block;
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
    background-color: #e2e8f0;
    font-size: 0.75rem;
  }

  .badge-secondary {
    background-color: #cbd5e1;
  }
</style>
