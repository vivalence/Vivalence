<script>
    import store from "../store.js";

    function handleInput(person, value) {
        store.setInputs(person, value);
    }
</script>

<table class="table table-hover ">
    <thead>
        <tr>
            <th>Person</th>
            <th>Conjugation</th>
            <th>Correct Answer</th>
        </tr>
    </thead>
    <tbody>
        {#each $store.instruction.conjugations as conjugation}
            <tr>
              <td>
                  <p class=" text-lg mt-2">
                    {conjugation.spoken}
                    </p>
              </td>
                <td>
                    <input
                        class="border input u-full-width text-lg"
                        type="text"
                        bind:value={$store.inputs[conjugation.scope.unit.id]}
                        on:input={(event) => store.setInput(conjugation.scope.unit.id, event.target.value)}
                        disabled={$store.revealed}
                    />
                </td>
                <td class="answer ">
                  <p class="text-token text-lg mt-2">
                    {#if $store.revealed}
                        {conjugation.learning}
                    {:else}
                        *****
                    {/if}
                    </p>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

