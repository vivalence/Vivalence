import { fn } from "@vivalence/shared";

import ontology from "./ontology/index.js";
import corpora from "./corpora.js";
import tactics from "./tactics.js";
import strategies from "./strategies.js";
import games from "./games.js";
import runtimeboot from "./runtime/index.js";

export default async function boot(runtime) {
  await fn.reduce(
    [runtimeboot, ontology, corpora, tactics, games, strategies],
    runtime,
  );
}
