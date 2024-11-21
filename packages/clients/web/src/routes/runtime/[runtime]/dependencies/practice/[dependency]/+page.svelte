<script>
  import { Widget } from "@vivalence/ui";
  import Buffer from "$components/Buffer/Buffer.svelte";
  import SignalHandler from "./components/SignalHandler.svelte";

  const { data } = $props();
  const { locals, dependency } = data;

  const runtime = {
    ...data.runtime,
    call: locals.call.wrap(`/r/${data.runtime?.slug}`),
  };

  async function pull({ take, blacklist }) {
    try {
      const tactic = dependency.itinerary?.tactic;

      const input = {
        relations: tactic?.relations,
        masks: tactic?.masks,
        blacklist,
        scope: {
          dependency: { id: dependency.id },
          tactic: { slug: tactic.slug },
        },
      };

      const { data: instructions, error } = await runtime.call(
        `/t/${tactic.slug}/provision`,
        input,
      );

      if (error) throw error;

      return instructions;
    } catch (e) {
      return [
        {
          type: "SIGNAL",
          signal: "ERROR",
          error: { message: "Something went wrong. Please try again later.", ...e },
        },
      ];
    }
  }

  async function onCompleted(instruction) {
    console.log("practive.page.svelte OnComplete finished with instruction", instruction);
  }

  // not sure i like the object declaration here. lets see.
  const Modes = {
    GAME: {
      component: Widget,
      onState: (instruction) => ({
        instruction,
        runtime,
        game: {
          ...instruction.game,
          call: runtime.call.wrap(`/g/${instruction.game.slug}`),
        },
      }),
    },
    SIGNAL: {
      component: SignalHandler,
      onState: (instruction) => ({ instruction, runtime, dependency }),
    },
  };
  const onMode = (instruction) => {
    const mode = Modes[instruction?.type];
    if (!mode) return [null, null];
    return [mode.component, mode.onState(instruction)];
  };
</script>

<div class="bsp-chain-root">
  <Buffer {onMode} {onCompleted} {pull} />
</div>
