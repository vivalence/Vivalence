import * as fold from "../fold.js";

const SELF_FEED_COUNT = 5;

const random = () => (Math.random() > 0.5 ? "KNOWN" : "LEARNING");

export const recallFor = (recall, index) => {
  if (!recall) return random();
  if (Array.isArray(recall)) return recall[index] ?? random();
  return recall;
};

export const playable = (terminal, knowable, axes) =>
  fold.speakable(knowable) &&
  (axes.prompt !== "AUDIO" || Boolean(terminal.daemon.getAsset(knowable.asset)));

export const carriers = (buffer) => [
  ...(buffer.literals ?? []).map(fold.fromLiteral),
  ...((buffer.data ?? {}).knowables ?? []),
];

export const admit = (terminal, set, axes) => {
  const rejected = set.filter((knowable) => !playable(terminal, knowable, axes));
  if (rejected.length)
    console.warn(
      "[rep-o-gram] dropped unplayable knowables",
      rejected.map((entry) => entry.literal ?? entry.learning),
    );

  return set.filter((knowable) => playable(terminal, knowable, axes));
};

export const carried = (terminal, buffer) => admit(terminal, carriers(buffer), buffer.data ?? {});

export const draw = (buffer, axes = buffer.data ?? {}) => ({
  count: SELF_FEED_COUNT,
  prompt: axes.prompt,
  symbols: (buffer.symbols ?? []).map((symbol) => symbol.slug),
});

export const refetch = async (terminal, buffer, axes = buffer.data ?? {}) => {
  const drawn = await buffer.mode.connection.call("/draw", draw(buffer, axes));
  return drawn ?? [];
};
