import { Annotation } from "@codemirror/state";

export const External = Annotation.define();

export const NONE = [];

export const diff = (from, to) => {
  let head = 0;
  const shortest = Math.min(from.length, to.length);
  while (head < shortest && from[head] === to[head]) head++;
  let tail = 0;
  while (tail < shortest - head && from[from.length - 1 - tail] === to[to.length - 1 - tail]) tail++;
  return { from: head, to: from.length - tail, insert: to.slice(head, to.length - tail) };
};

export const originated = (update) => update.transactions.some((transaction) => transaction.annotation(External));
