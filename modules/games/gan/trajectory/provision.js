import LearnablesAgent from "./agents/learnables.js";
import SessionAgent from "./agents/session.js";

export default async function provision(input, ctx) {
  const learnables = await LearnablesAgent({}, ctx);
  const session = await SessionAgent({ learnables }, ctx);
  return { session, learnables };
}
