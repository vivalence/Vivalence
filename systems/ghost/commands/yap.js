import { Vector } from "@vivalence/typology";

export const yap = new Vector().open({ nature: "*", valence: "a line that names no verb — a turn to the active terminal's harness. Example: ciao" }, (parts, ctx) => {
  if (ctx.signal.nature !== "*") throw new Error(`${ctx.signal.pathname}: no such verb — /--help`);
  if (ctx.terminal === null) throw new Error("no terminal picked — /terminal/new");
  const { thread, mode } = ctx.terminal;
  if (thread === null || mode === null) throw new Error("no thread seated — pick a thread or a mode first");
  if (mode.harness === undefined) throw new Error(`${mode.slug} is not HARNESSED — it cannot answer a turn`);
  const id = crypto.randomUUID();
  thread.$echo.set({ id, role: "user", parts, createdAt: new Date().toISOString() });
  ctx.stream = { packets: mode.harness.dialogue.stream({ thread: thread.id, id, parts }) };
});
