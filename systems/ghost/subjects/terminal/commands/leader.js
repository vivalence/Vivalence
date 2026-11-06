import { KeySignal, Vector } from "@vivalence/typology";

export const leader = new Vector()
  .open(
    { nature: "/leader", rank: "hidden", valence: "the leader, pressed once — legend · repl · closed, a cycle. Example: /leader" },
    (ctx) => {
      ctx.terminal.legend.presses.enqueue(new KeySignal("leader"));
    },
  )
  .open(
    { nature: "/leader/leader", rank: "hidden", valence: "the leader, pressed twice — the repl. Example: /leader/leader" },
    (ctx) => {
      ctx.terminal.legend.presses.enqueue(new KeySignal("leader")).enqueue(new KeySignal("leader"));
    },
  )
  .open(
    { nature: "/legend/close", rank: "hidden", valence: "the legend closes — its held keys drop. Example: /legend/close", chord: "leader/esc" },
    (ctx) => {
      ctx.terminal.legend.flush();
      return "legend closed";
    },
  );
