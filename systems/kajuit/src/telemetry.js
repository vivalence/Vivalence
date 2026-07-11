import { atom } from "nanostores";
import { Pipe, trace } from "@vivalence/typology";

export const $span = atom(null);

export const $telemetry = atom(trace.chronicle.seed());

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

let pipe;
export const telemetry = () => {
  if (pipe) return pipe;
  pipe = new Pipe();
  pipe.tap((record) => $telemetry.set(trim(trace.chronicle.step($telemetry.get(), record))));
  return pipe;
};
