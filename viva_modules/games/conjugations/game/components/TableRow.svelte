<script>
  import Label from "./Label.svelte";
  import toRoman from "./intToRoman.js";

  import { getStore } from "../store.js";
  const store = getStore();

  export let conjugation;

  let evaluation;
  $: evaluation = $store.evaluations
    ? $store.evaluations[conjugation.scope.unit.id].evaluation
    : null;
</script>

<tr class="">
  <td class="">
    <p class="text-lg">{toRoman(conjugation.meta.index + 1)}</p>
  </td>
  <td class="max-w-xs flex flex-col">
    <input
      autocomplete="off"
      autofocus={conjugation.meta.index === 0}
      type="text"
      placeholder={conjugation.known}
      disabled={$store.revealed}
      class={`input border-neutral-content/20 focus:border-content/50 disabled:text-neutral-content/75 placeholder-neutral-content/50 w-full input-sm text-lg`}
      bind:value={$store.inputs[conjugation.scope.unit.id]}
      on:input={(event) => store.setInput(conjugation.scope.unit.id, event.target.value)}
    />
  </td>

  <td class={` ${!$store.revealed && "text-neutral-content/0"}`}>
    {#if $store.revealed}
      <div class="flex items-center justify-between icon-container">
        <p class="text-lg mr-2">{conjugation.learning}</p>
        {#if evaluation}
          {#if evaluation.feedback}
            <div class="tooltip tooltip-left" data-tip={evaluation.feedback}>
              <Label {evaluation} />
            </div>
          {:else}
            <Label {evaluation} />
          {/if}
        {/if}
      </div>
    {:else}
      ..as if. try network?
    {/if}
  </td>
</tr>

<style>
  .icon-container .tooltip {
    display: inherit;
  }
</style>
