import { soma } from "@vivalence/typology";

export const stream = async (mode, terminal, parts) => {
  let turn = null;
  for await (const packet of mode.harness.dialogue.stream({ thread: terminal.thread.id, terminal: terminal.id, turn: crypto.randomUUID(), parts })) {
    turn = soma.pour(turn, packet);
    await terminal.client.runtime.entities.turn.merge({ ...turn, thread: terminal.thread.id, mode: mode.id });
  }
};
