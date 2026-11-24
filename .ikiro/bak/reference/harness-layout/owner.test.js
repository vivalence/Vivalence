import { shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { tool } from "./load.test.js";

specimen.describe("a loaded tool runs on its owner's host", () => {
  specimen.it("a chess tool loaded into an education thread reads chess", async () => {
    const whoami = (ctx) => ({
      output: {
        mode: ctx.mode.manifest.slug,
        daemon: ctx.daemon.reference,
        runtime: ctx.runtime.reference,
        statics: ctx.statics,
        entities: Object.keys(ctx.entities),
        modes: Object.keys(ctx.modes),
      },
    });
    const coach = { manifest: { type: "teacher", slug: "coach" }, tools: new Vector().open({ nature: "/whoami", valence: "Names its host." }, whoami) };
    const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: new Vector().open({ nature: "/whoami", valence: "Names its host." }, whoami) };
    const flush = async () => {};
    const education = { reference: "/daemon/education", statics: { language: "it" }, entities: { literal: {}, em: { flush } }, modes: { teacher: { francesca } } };
    const chess = { reference: "/daemon/chess", statics: { language: "en" }, entities: { position: {}, em: { flush } }, modes: { teacher: { coach } } };
    const runtime = { reference: "/runtime/runtime", modes: {}, daemons: { education, chess } };
    const tools = new Vector().graft(tool);
    tools
      .use(shard.context.bind("tools", tools))
      .use(shard.context.bind("runtime", runtime))
      .use(shard.context.bind("daemon", education))
      .use(shard.context.bind("reference", education.reference))
      .use(shard.context.bind("mode", francesca))
      .use(shard.context.bind("statics", education.statics))
      .use(shard.context.bind("modes", education.modes))
      .use(shard.context.bind("entities", education.entities))
      .use(shard.context.bind("thread", { trait: { TOOLED: {} } }));
    const call = (name, input = {}) => steer.dispatch.invoke(tools, new ToolCall(name), steer.strategy.guarded)(input);
    await call("tool_load", { references: ["/daemon/chess/mode/teacher/coach", "/whoami"] });
    const own = await call("whoami");
    const foreign = await call("daemon_chess_teacher_coach_whoami");
    console.log(["", `own     ${JSON.stringify(own.output)}`, `foreign ${JSON.stringify(foreign.output)}`].join("\n"));
    specimen.expect(foreign.output.statics).toEqual({ language: "en" });
    specimen.expect(own.output.statics).toEqual({ language: "it" });
    specimen.expect(foreign.output.daemon).toBe("/daemon/chess");
    specimen.expect(own.output.daemon).toBe("/daemon/education");
  });
});
