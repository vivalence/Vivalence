import { fn } from "@vivalence/shared";

import ontology from "./ontology/index.js";
import corpora from "./corpora.js";
import tactics from "./tactics.js";
import strategies from "./strategies.js";
import games from "./games.js";
import domain from "./domain/index.js";

import datasets from "./datasets.js";

export default async function boot(runtime) {
  await fn.reduce(
    [domain, ontology, corpora, tactics, games, strategies],
    // corpora to topology?
    runtime,
  );

  // temporary
  await datasets(runtime);
}
