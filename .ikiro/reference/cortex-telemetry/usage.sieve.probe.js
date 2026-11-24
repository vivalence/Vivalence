import { ranked, held } from "../../../subsystems/paladin/prototypes/telemetry.js";

const record = { at: 0, path: ["hallucination"], track: "usage", data: {} };
const sieves = {
  default: { "/runtime/(.*)": ["status", "fault", "log"] },
  below: { "/(.*)": ["usage"] },
  exact: { "/hallucination": ["usage"] },
};
for (const [name, sieve] of Object.entries(sieves)) console.log(name, JSON.stringify(sieve), "→", held(ranked(sieve), record));
