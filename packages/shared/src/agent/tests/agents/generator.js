import { Agent } from "../../agent.js";
import { Input, Output } from "./generator.types.js";

export function createGenerator(brain) {
  const generator = new Agent("generator", "Learning Process Generator");

  generator.withInput(Input).withOutput(Output).withBrain(brain);

  generator.withContext("identity", ``);
  generator.withContext("process", ``);
  generator.withContext("task", ``);

  return generator;
}

export const generator = createGenerator();
