import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "harness",
  slug: "runtime",
  name: "Runtime Harness",
  description: "default runtime harness",
  version: "0.2.0",
  traits: ["HARNESSED", "AGENTIC"], //, "TOOLING", "APPLICATION"],
};

export const harness = new Vector();

// identity - who you are and how to behave
// world - where you are, whats around you, and where you can go
// role - why you exist and what youre supposed to do
// skills - how to do things to the world

//

// export const application = new App('tui&dom'); //
