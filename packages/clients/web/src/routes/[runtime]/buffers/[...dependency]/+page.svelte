<script>
  import { id } from "@vivalence/shared";
  import { Loader, Text } from "@vivalence/interface";
  import { Widget } from "@vivalence/interface";

  import { id, blacklist as Blacklist } from "@vivalence/shared";
  import Buffer from "@vivalence/components/Buffer/Buffer.svelte";
  import BufferState from "@vivalence/components/Buffer/state.svelte.js";

  import SignalHandler from "./components/SignalHandler.svelte";

  // const { data } = $props();
  // const { locals, dependency, ctx } = data;

  // const runtime = {
  //   ...data.runtime,
  //   call: ctx.runtime,
  // };

  // const Modes = {
  //   SIGNAL: (instruction) => [SignalHandler, { instruction, runtime, dependency }],
  //   GAME: (instruction) => [
  //     Widget,
  //     {
  //       ...instruction,
  //       runtime,
  //       game: { ...instruction.game, call: ctx.call.wrap(instruction.game.url) },
  //       bundle: instruction.game.bundle,
  //     },
  //   ],
  // };

  // async function pull({ take, buffer = null }) {
  //   try {
  //     console.log("{}", take, buffer);
  //     let blacklist = Blacklist.init();

  //     [buffer.active, ...buffer.queue]
  //       .filter((x) => x?.scope)
  //       .forEach((item) => {
  //         blacklist = Blacklist.fromScope({ blacklist, scope: item.scope });
  //       });

  //     const input = { take, blacklist, dependency: { id: dependency.id } };
  //     const result = await ctx.runtime(`/feed/dependency`, input);

  //     console.log("feed result", result.data.status);

  //     if (result.error) throw result.error;
  //     const instructions = result.data.instructions;
  //     return instructions;
  //   } catch (e) {
  //     console.log("[practive.page.svelte pull]uncaught error", e);
  //     return [
  //       {
  //         type: "SIGNAL",
  //         signal: "ERROR",
  //         error: {
  //           message: "Something went wrong while pulling the next dependency instruction.",
  //           ...e,
  //         },
  //       },
  //     ];
  //   }
  // }

  // const render = (instruction) => {
  //   if (Modes[instruction?.type]) return Modes[instruction?.type](instruction);
  //   else [null, {}];
  // };

  // async function onNext({ prev, next }) {
  //   await ctx.runtime(`/feed/remove`, prev);
  // }

  // function keybindings(map) {
  //   window.removeEventListener("keydown", keyhandler);
  //   keyhandler = createKeybindingsHandler(map);
  //   window.addEventListener("keydown", keyhandler);
  // }


  // let bufferState = new BufferState({ pull, onNext });
  // onMount(() => {
  //   bufferState.pull();
  //   return () => {
  //     window.removeEventListener("keydown", keyhandler);
  //   };
  // });

  // let bufferState = new BufferState({ pull, onNext });

  // let [Component, componentProps] = $derived.by(() => {
  //   if (bufferState.active) {
  //     const rendered = render(bufferState.active);
  //     let [Component, componentProps] = rendered;
  //     return [Component, componentProps];
  //     // @lj
  //     // deepClone fails. causes reactivity issues. props not isolated.
  //     // f.E. next updates state.active before previous game is unmounted
  //     // => game.call(/eval) happens to the wrong game
  //   } else {
  //     return [null, null];
  //   }
  // });

</script>

<div class="bsp-chain-root">
  <Buffer {pull} {render} {onNext} />
</div>
