<script module>
  export class GameState {
    instruction = $state(null);

    runtime;
    game;
    next;

    revealed = $state(true);

    constructor({ instruction }) {
      /* constructor({ runtime, game, next, instruction }) {this.runtime = runtime; this.game = game; this.next = next; */
      this.instruction = instruction;
    }

    reveal() {
      this.revealed = true;
    }

    async review(response) {
      // todo
      console.log("this.game.call(eval) not implemented");
      await this.game.call("/evaluate", {
        // scope: this.scope,
        // response,
      });
    }

    reset() {
      this.instruction = null;
      this.scope = null;
      this.revealed = false;
      this.loading = true;
    }
  }
</script>

<script>
  import { Text, Button } from "@vivalence/ui";

  const { gameState } = $props();

  const onReview = (status) => async () => await gameState.review(status);

  const reveal = () => gameState.reveal();
</script>

{#snippet card(card, color, classes)}
  <div
    class={`card h-1/2 lg:h-auto lg:max-h-full lg:w-1/2 p-4 rounded-lg shadow-md border border-skeleton-boundary-1 ${classes} `}>
    <Text size="2xl" {color}>
      {@html card.header}
    </Text>
    <Text size="md" {color}>
      {@html card.content}
    </Text>
    <Text size="md" {color}>
      {@html card.footer}
    </Text>
  </div>
{/snippet}

<div class="grid-chain-node root">
  <div class="grid-chain-node content grid-cols-6 grid-rows-6" onclick={reveal}>
    <div
      class={`grid-chain-end flashcard p-8 gap-4
      col-span-4 col-start-2 row-span-4 row-start-3 lg:col-span-4 lg:col-start-2 lg:row-span-2 lg:row-start-3
      flex flex-col justify-end lg:flex-row lg:justify-start`}>
      {@render card(gameState.instruction.front, "1", "front bg-skeleton-surface-1 ")}

      {#if gameState.revealed}
        {@render card(gameState.instruction.back, "2", "back bg-skeleton-surface-2 ")}
      {/if}
    </div>
  </div>

  <div
    class={`grid-chain-end menu p-4 shadow-md border-t border-skeleton-boundary-1 flex justify-center gap-2`}>
    {#if gameState.revealed}
      <Button size="xl" variant="warning" onclick={onReview("UNKNOWN")}>Unknown</Button>
      <Button size="xl" variant="success" onclick={onReview("KNOWN")}>Known</Button>
      <Button size="xl" variant="accent" onclick={onReview("GRADUATE")}>Graduate</Button>
    {:else}
      <Button size="xl" onclick={reveal}>Reveal</Button>
    {/if}
  </div>
</div>

<style>
  .root {
    grid-template-rows: 1fr auto;
  }

  .content {
    .flashcard {
    }
    .card {
      .header {
      }
      .content {
      }
      .footer {
      }

      .front {
      }
      .back {
      }
    }
  }
  .menu {
  }
</style>
