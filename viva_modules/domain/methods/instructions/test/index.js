// import { make } from "../provision.js";
import localStrategy from "./strategies/index.js";

export default async function (body, runtime) {
  let blacklist = { tags: [], units: [] };

  console.log("make");
  const instructions = await make({
    strategyId: localStrategy.id,
    userId: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
    blacklist,
    locals: runtime.locals,
    dry: true,
    local: localStrategy.provision,
  });
  console.log("made", instructions);

  return instructions;
}
