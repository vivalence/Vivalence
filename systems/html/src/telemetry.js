import { atom } from "nanostores";
import { Pipe } from "@vivalence/typology";

export const telemetry = new Pipe();

export const $telemetry = atom([]);

telemetry.tap((span) => {
  const current = $telemetry.get();
  $telemetry.set(current.length >= 200 ? [...current.slice(-199), span] : [...current, span]);
});
