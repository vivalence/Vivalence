import { KeySignal, Vector } from "@vivalence/typology";

export const leader = new Vector()
  .open(
    { nature: "/leader", valence: "the leader, pressed once — legend · repl · closed, a cycle. Example: /leader" },
    (ctx) => {
      ctx.terminal.legend.presses.enqueue(new KeySignal("leader"));
    },
  )
  .open(
    { nature: "/leader/leader", valence: "the leader, pressed twice — the repl. Example: /leader/leader" },
    (ctx) => {
      ctx.terminal.legend.presses.enqueue(new KeySignal("leader")).enqueue(new KeySignal("leader"));
    },
  )
  .open(
    { nature: "/legend/close", valence: "the legend closes — its held keys drop. Example: /legend/close", chord: "leader/esc" },
    (ctx) => {
      ctx.terminal.legend.flush();
      return "legend closed";
    },
  );
