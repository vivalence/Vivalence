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

// [telemetry]
// Object { span: {…} }
// ​
// span: Object { gauges: [], nature: "lighthouse", _hash: "59ff7063", … }
// ​​
// _hash: "59ff7063"
// ​​
// fault: null
// ​​
// gauges: Array []
// ​​
// nature: "lighthouse"
// ​​
// pipe: Object { listeners: Set(2) }
// ​​
// subject: null
// ​​
// timing: Object { span: {…}, begun: 4959, sealed: 6456 }
// ​​
// track: Object { transport: transport(options), transition: transition(options), subject: subject(options), … }
// ​​
// transition: null
// ​​
// transport: Object { span: {…}, request: {…}, response: {…} }
// ​​
// <prototype>: Object { … }
// ​
// <prototype>: Object { … }
// telemetry.js:12:30
