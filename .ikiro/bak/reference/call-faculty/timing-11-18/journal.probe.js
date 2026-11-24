// limit: 3500 chars · 11-18 journal remount counts, three wirings. Run: deno run -A --no-check --no-config --import-map=<solid-js + solid-js/store → node_modules dist> <copy outside the repo>
import { createRoot, createSignal, createMemo, mapArray, createEffect, batch } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

const turnsOf = (count, tail) => Array.from({ length: count }, (_, index) => ({ id: `t${index}`, text: index === count - 1 ? tail : `turn ${index}` }));
const entries = (turns, waiting) => turns.map((turn) => ({ id: turn.id, row: { text: turn.text, waiting, segments: [{ type: "text", items: [turn.text] }] } }));

const run = (label, wire) =>
  createRoot((dispose) => {
    const [activities, setActivities] = createSignal([]);
    const [turns, setTurns] = createSignal(turnsOf(40, "a"));
    const counts = { mounts: 0, texts: 0 };
    const list = wire(activities, turns);
    const rows = mapArray(list, (entry) => {
      counts.mounts += 1;
      createEffect(() => { entry.row.text; counts.texts += 1; });
      return entry;
    });
    createEffect(() => rows());
    queueMicrotask(() => {
      const base = { ...counts };
      for (let index = 0; index < 6; index++) setActivities([{ status: "RUNNING", index }]);
      const activity = { mounts: counts.mounts - base.mounts, texts: counts.texts - base.texts };
      const mid = { ...counts };
      setTurns(turnsOf(40, "a b"));
      const delta = { mounts: counts.mounts - mid.mounts, texts: counts.texts - mid.texts };
      const late = { ...counts };
      setTurns(turnsOf(41, "new"));
      const append = { mounts: counts.mounts - late.mounts, texts: counts.texts - late.texts };
      console.log(label, JSON.stringify({ "6 activity updates": activity, "1 streamed delta": delta, "1 turn appended": append }));
      dispose();
    });
  });

const waitingOf = (activities) => activities().some((activity) => activity.status === "PAUSED");

run("today      ", (activities, turns) => () => entries(turns(), waitingOf(activities)));
run("memo       ", (activities, turns) => {
  const waiting = createMemo(() => waitingOf(activities));
  return () => entries(turns(), waiting());
});
run("memo+store ", (activities, turns) => {
  const waiting = createMemo(() => waitingOf(activities));
  const [held, setHeld] = createStore({ entries: [] });
  createEffect(() => setHeld("entries", reconcile(entries(turns(), waiting()), { key: "id" })));
  return () => held.entries;
});
