import * as InititalUserIntents from "../datasets/InitialUserIntents.js";

export default function datasets(runtime) {
  for (const dataset of [InititalUserIntents]) {
    if (dataset.manifest.traits.includes("REACTIVE"))
      dataset.react(runtime.entities.on);
  }
  return runtime;
}
