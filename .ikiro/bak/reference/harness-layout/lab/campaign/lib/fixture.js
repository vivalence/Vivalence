import { shard, steer, ToolCall, Vector } from "@vivalence/typology";
import * as harness from "/Users/finn/vivalence/code/vivalence/commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/registry.js";
import { toolTree } from "./world.js";

const primerOf = (sections) => {
  const primer = new Vector();
  for (const [nature, text] of Object.entries(sections)) primer.open({ nature, valence: `section ${nature}` }, () => text);
  return primer;
};

export const fixture = async () => {
  const harvest = await accio("@education/tactic/harvest");
  const nyan = await accio("@education/game/nyan");
  const cloze = await accio("@education/game/cloze");
  const francesca = {
    manifest: { type: "teacher", slug: "francesca", description: "the education teacher" },
    tools: toolTree(["/drill/deal", "/drill/grade"], "education·francesca"),
    primer: primerOf({ role: "You are Francesca (education)." }),
  };
  const chessFrancesca = {
    manifest: { type: "teacher", slug: "francesca", description: "the chess francesca" },
    tools: toolTree(["/drill/deal"], "chess·francesca"),
    primer: primerOf({ role: "You are Francesca (chess)." }),
  };
  const coach = {
    manifest: { type: "teacher", slug: "coach", description: "the chess coach" },
    tools: toolTree(["/whoami", "/position/analyse"], "chess·coach"),
    primer: primerOf({ role: "You are the coach." }),
  };
  const flushed = [];
  const em = { flush: async () => flushed.push("flush") };
  const education = {
    reference: "/daemon/education",
    statics: { language: "it" },
    entities: { literal: {}, em },
    modes: { tactic: { harvest }, game: { nyan, cloze }, teacher: { francesca } },
  };
  const chess = {
    reference: "/daemon/chess",
    statics: { language: "en" },
    entities: { position: {}, em },
    modes: { teacher: { coach, francesca: chessFrancesca } },
  };
  const runtimeHarness = { manifest: harness.manifest, tools: harness.tools, primer: harness.primer };
  const runtime = {
    reference: "/runtime/runtime",
    statics: { host: "runtime" },
    entities: { em },
    modes: { [harness.manifest.type]: { [harness.manifest.slug]: runtimeHarness } },
    daemons: { education, chess },
  };
  return { harvest, nyan, cloze, francesca, coach, chessFrancesca, education, chess, runtime, runtimeHarness, harness, flushed, em };
};

export const mount = (vectors, ctx) => {
  const tools = new Vector().graft(...vectors);
  for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
  tools.use(shard.context.bind("tools", tools));
  const call = (name, input = {}) => steer.dispatch.invoke(tools, new ToolCall(name), steer.strategy.guarded)(input);
  return { tools, call };
};

export const snapshot = (dir, name, value) => {
  Deno.mkdirSync(dir, { recursive: true });
  const path = `${dir}/${name}.json`;
  Deno.writeTextFileSync(path, JSON.stringify(value, null, 2));
  return path;
};
