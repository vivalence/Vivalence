<script>
  import { Widget } from "@vivalence/ui";
  import { id, blacklist as Blacklist } from "@vivalence/shared";
  import { fromScope } from "$lib/blacklist.js";
  import Buffer from "$components/Buffer/Buffer.svelte";
  import SignalHandler from "./components/SignalHandler.svelte";

  const { data } = $props();
  const { locals, dependency, aperture } = data;

  const runtime = {
    ...data.runtime,
    call: locals.call.wrap(data.runtime?.url),
  };

  const Modes = {
    GAME: (instruction) => [
      Widget,
      {
        ...instruction,
        runtime,
        game: { ...instruction.game, call: locals.call.wrap(instruction.game.url) },
        bundle: instruction.game.bundle,
      },
    ],
    SIGNAL: (instruction) => [SignalHandler, { instruction, runtime, dependency }],
  };

  async function pull({ take, buffer = null }) {
    try {
      let blacklist = Blacklist.init();

      [buffer.active, ...buffer.queue]
        .filter((x) => x?.scope)
        .forEach((item) => {
          blacklist = Blacklist.fromScope({ blacklist, scope: item.scope });
        });

      const input = { take, blacklist, dependency: { id: dependency.id } };
      const result = await aperture.call(
        `/runtime/${runtime.slug}/instructions/dependency/feed`,
        input,
      );

      if (result.error) throw result.error;
      const instructions = result.data.instructions;
      return instructions;
    } catch (e) {
      console.log("[practive.page.svelte pull]uncaught error", e);
      return [
        {
          type: "SIGNAL",
          signal: "ERROR",
          error: {
            message: "Something went wrong while pulling the next dependency instruction.",
            ...e,
          },
        },
      ];
    }
  }

  const render = (instruction) => {
    console.log(instruction);
    if (Modes[instruction?.type]) return Modes[instruction?.type](instruction);
    else [null, {}];
  };

  async function onNext({ prev, next }) {
    const result = await aperture.call(`/runtime/${runtime.slug}/instructions/remove`, prev);
    console.log("[/practice/+page.svelte] Buffer onNext remove");
  }
</script>

<div class="bsp-chain-root">
  <Buffer {pull} {render} {onNext} />
</div>
