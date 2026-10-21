import { ReplSignal, shape, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
import { create } from "../scenarios/cortex.js";
const { LOOPING } = traits.mode;

const console_ = new Vector()
  .open({ nature: "/hello", valence: "the hosted mode answers. Example: /hello" }, () => "hello from ghost")
  .open({ nature: "/mode/console/whoami", valence: "the terminal's id. Example: /mode/console/whoami" }, (ctx) => ({ terminal: ctx.terminal }));

// the terminal is a fake socket: it answers the strip and executes a Signal { nature, body, flags } the way socket.js:133 seats one
const socketOf = (terminal, frames) => ({
  call: async (route, body) => {
    frames.push({ route, body });
    if (route === `/terminal/${terminal}/metadata/repl`) return shape.strip(console_);
    const signal = Object.assign(new ReplSignal(body.nature), { body: body.body, flags: body.flags });
    return await steer.dispatch.execute(console_, { terminal, signal }, signal);
  },
});

const names = (tools) => steer.trie.rollup(tools, () => null).map((entry) => entry.steps.map((step) => step.nature).join("_"));

let scenario;
let captured;
let frames;

const ask = (input) =>
  steer.dispatch.invoke(scenario.daemon.aperture, `${scenario.dewey.reference.absolute}/harness/dialogue/render`, steer.strategy.request)(input);

specimen.describe("LOOPING — the terminal's repl is the harness's tools under /repl, called back over the terminal's own socket", () => {
  specimen.beforeAll(async () => {
    const harness = new Vector().use(async (ctx, next) => {
      captured = ctx;
      await next();
    });
    scenario = await create({ harness });
    const { dewey, daemon } = scenario;
    dewey.manifest.traits.push("LOOPING");
    LOOPING(dewey);
    frames = [];
    daemon.aperture.use(async (ctx, next) => {
      ctx.socket = socketOf("t1", frames);
      await next();
    });
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("a terminal's harness call PULLS its strip over the socket it arrived on; every verb is a tool under /repl with the universal Call input", async () => {
    const { entities, em, fixtures } = scenario;
    const thread = await scenario.createThread();
    await entities.terminal.create({ id: "t1", user: fixtures.user.id, thread, daemon: fixtures.daemon });
    await em.flush();

    await ask({ thread: thread.id, terminal: "t1", parts: [{ type: "text", text: "who am i" }] });

    specimen.expect(captured.terminal.id).toBe("t1");
    specimen.expect(frames.map((frame) => frame.route)).toEqual(["/terminal/t1/metadata/repl"]);
    const tools = names(captured.hallucination.tools).filter((name) => name.startsWith("repl_"));
    specimen.expect(tools).toEqual(["repl_hello", "repl_mode_console_whoami"]);
    const whoami = steer.trie.rollup(captured.hallucination.tools, () => null).find((entry) => entry.steps.at(-1).nature === "whoami");
    specimen.expect(Object.keys(whoami.pattern.input.properties)).toEqual(["body", "flags"]);
    specimen.expect(whoami.pattern.valence).toBe("the terminal's id. Example: /mode/console/whoami");
  });

  specimen.it("the model's tool_use dispatches a Signal { nature, body, flags } back down the socket; the verb's own output is the tool result", async () => {
    frames.length = 0;
    const output = await steer.dispatch.invoke(captured.hallucination.tools, new ToolCall("repl_mode_console_whoami").signal, steer.strategy.guarded)({ body: [], flags: {} });
    specimen.expect(output).toEqual({ terminal: "t1" });
    specimen.expect(frames).toEqual([{ route: "/terminal/t1/repl", body: { nature: "/mode/console/whoami", body: [], flags: {} } }]);
    const hello = await steer.dispatch.invoke(captured.hallucination.tools, new ToolCall("repl_hello").signal, steer.strategy.guarded)({ body: ["ciao"], flags: { pace: "40ms" } });
    specimen.expect(hello).toBe("hello from ghost");
    specimen.expect(frames.at(-1).body).toEqual({ nature: "/hello", body: ["ciao"], flags: { pace: "40ms" } });
  });

  specimen.it("the terminal's request names its turn: the user Turn row is minted under the id the client sent, on the thread, with the terminal claimed", async () => {
    const { entities, em } = scenario;
    const thread = await scenario.createThread();
    (await entities.terminal.findOneOrFail({ id: "t1" })).thread = thread;
    await em.flush();

    await ask({ thread: thread.id, terminal: "t1", turn: "6f1c0d2e-row2", parts: [{ type: "text", text: "who am i" }] });

    specimen.expect(captured.terminal.id).toBe("t1");
    specimen.expect(captured.turn.id).toBe("6f1c0d2e-row2");
    const row = await entities.turn.findOneOrFail({ id: "6f1c0d2e-row2" });
    specimen.expect([row.role, row.thread.id]).toEqual(["user", thread.id]);
  });

  specimen.it("a call with no terminal arms no repl tool — the live value, not a flag", async () => {
    frames.length = 0;
    const thread = await scenario.createThread();
    await ask({ thread: thread.id, parts: [{ type: "text", text: "who am i" }] });
    specimen.expect(captured.terminal).toBe(null);
    specimen.expect(frames).toEqual([]);
    specimen.expect(names(captured.hallucination.tools).filter((name) => name.startsWith("repl_"))).toEqual([]);
  });

  specimen.it("a terminal seated on another thread is loud at the claim", async () => {
    const thread = await scenario.createThread();
    await specimen.expect(ask({ thread: thread.id, terminal: "t1", parts: [{ type: "text", text: "who am i" }] })).rejects.toThrow("TerminalEntity not found");
  });
});
