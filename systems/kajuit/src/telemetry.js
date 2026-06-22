import { atom } from "nanostores";
import { Pipe } from "@vivalence/typology";

export const $telemetry = atom([]);

let pipe;
export const telemetry = () => {
  if (pipe) return pipe;
  pipe = new Pipe();
  pipe.tap((span) => $telemetry.set([...$telemetry.get(), span].slice(-200)));
  return pipe;
};
