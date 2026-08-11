import { atom } from "nanostores";
import { Pipe, Span, trace } from "@vivalence/typology";

export const $selected = atom(null);

export const $story = atom(trace.chronicle.seed());

const trim = (story) => {
  while (story.roots.length > 200) {
    const stale = story.roots.shift();
    const drop = (node) => {
      story.nodes.delete(node.id);
      node.children.forEach(drop);
    };
    drop(stale);
  }
  return story;
};

export const channel = new Pipe();
channel.tap((record) => $story.set(trim(trace.chronicle.step($story.get(), record))));

export const logbook = new Span("client").to(channel);

export const entry = (nature) => logbook.branch(nature);
