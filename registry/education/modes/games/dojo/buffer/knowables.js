import { array } from "@vivalence/typology";
import * as fold from "../fold.js";
import * as types from "../types.js";

const pool = (axis, all) => (Array.isArray(axis) ? axis : axis ? [axis] : all);

const drawFrom = (axis, all) => array.shuffle(pool(axis, all))[0];

export const recallFor = (recall) => drawFrom(recall, types.RECALLS);

export const gameplayFor = (gameplay) => drawFrom(gameplay, types.GAMEPLAYS);

export const promptFor = (terminal, prompt, knowable) => {
  const wanted = pool(prompt, types.PROMPTS);
  const feasible = wanted.filter((entry) => entry !== "AUDIO" || Boolean(terminal.daemon.getAsset(knowable.asset)));
  return array.shuffle(feasible.length ? feasible : wanted)[0];
};

export const playable = (terminal, knowable, axes) =>
  fold.speakable(knowable) &&
  (!types.listening(axes.prompt) || Boolean(terminal.daemon.getAsset(knowable.asset)));

export const carriers = (buffer) => [
  ...(buffer.literals ?? []).map(fold.fromLiteral),
  ...((buffer.data ?? {}).knowables ?? []),
];

export const admit = (terminal, set, axes) => {
  const rejected = set.filter((knowable) => !playable(terminal, knowable, axes));
  if (rejected.length)
    console.warn(
      "[dojo] dropped unplayable knowables",
      rejected.map((entry) => entry.literal ?? entry.learning),
    );

  return set.filter((knowable) => playable(terminal, knowable, axes));
};

export const carried = (terminal, buffer) => admit(terminal, carriers(buffer), buffer.data ?? {});

export const refetch = async (buffer, { set = [], prompt, blacklist = [] } = {}) => {
  if (!set.length) return [];
  const resolved = await buffer.mode.connection.call("/resolve", { set, prompt, blacklist });
  return (resolved?.clauses ?? []).flatMap((entry) => [...entry.literals, ...entry.knowables]);
};
