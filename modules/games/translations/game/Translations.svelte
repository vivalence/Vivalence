<script>
  export class GameState {
    instruction = $state(null);
    scope = $state(null);
    input = $state("");
    revealed = $state(false);
    loading = $state(false);
    evaluation = $state(null);

    runtime;
    game;
    next;

    constructor({ instruction, runtime, game, next }) {
      this.instruction = instruction;
      this.runtime = runtime;
      this.game = game;
      this.next = next;
    }

    async evaluate() {
      this.loading = true;
      const params = {
        sentence: {
          ...this.instruction.sentence,
          translation: this.input,
        },
        scope: this.scope,
      };
      const { data: evaluation, error } = await this.game.call("/evaluate", params);
      if (error) throw error;
      this.evaluation = evaluation;
      this.loading = false;
    }

    setInput(input) {
      this.input = input;
    }

    async commitTranslation() {
      this.revealed = true;
      await this.evaluate();
    }

    async finishTranslation() {
      await this.next();
      this.reset();
    }

    reset() {
      this.instruction = null;
      this.scope = null;
      this.input = "";
      this.revealed = false;
      this.loading = false;
      this.evaluation = null;
    }
  }
</script>

<script>
  import { Text, Button, } from "@vivalence/ui";
 import Card from "./components/Card.svelte";

  const { gameState } = $props();

  const handleInput = (event) => gameState.setInput(event.target.value);

  let inputState = $derived.by(() => {
    if (!gameState.evaluation) return "";
    switch (gameState.evaluation.sentence.status) {
      case "KNOWN":
        return "input-success";
      case "NEUTRAL":
        return "input-info";
      case "UNKNOWN":
        return "input-error";
    }
  });
</script>

<div class="grid-chain-node root">
  <div class="grid-chain-node content">
    <div class="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 pt-[10vh] mb-[20vh]">
      <div class="flex flex-row items-center w-full justify-center pb-20">
        <div class="w-1/2 mb-2 mr-2">
          <div>
            <Text size="sm" color="muted">English:</Text>
            <Text size="xl" italic>{gameState.instruction.sentence.known}</Text>
          </div>
        </div>

        {#if gameState.revealed}
          <div class="w-1/2">
            <div>
              <Text size="sm" color="muted">Expected Spanish:</Text>
              <Text size="xl" italic>{gameState.instruction.sentence.learning}</Text>
            </div>
          </div>
        {/if}
      </div>

      {#if gameState.revealed}
        <div variant="neutral">
          <div>
            <div>Feedback:</CardTitle>
          </div>
          
          {#if gameState.evaluation}
            <div>
              <div class="flex flex-row flex-wrap pb-20">
                {#each gameState.evaluation.units as evaluation}
                    <!-- <FeedbackCard {...evaluation} /> -->
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="grid-chain-end menu p-4 shadow-md border-t border-skeleton-boundary-1">
    <div class="container max-w-screen-md px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-center">
      <input
        class={`input input-bordered ${inputState} w-full mr-2`}
        type="text"
        placeholder="Spanish translation here..."
        value={gameState.input}
        autofocus
        oninput={handleInput}
      />
      
      {#if !gameState.revealed}
        <Button size="xl" onclick={() => gameState.commitTranslation()}>Review</Button>
      {:else}
        <Button size="xl" onclick={() => gameState.finishTranslation()}>Next Game</Button>
      {/if}
    </div>
  </div>
</div>

<style>
  .root {
    grid-template-rows: 1fr auto;
  }

  .content {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }

  .menu {
    grid-template-columns: 1fr;
    align-items: center;
  }
</style>
