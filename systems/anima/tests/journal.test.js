import { specimen, trace } from "@vivalence/typology";
import { atom } from "nanostores";
import { fire, paint, settle, surface, words, world } from "./world.js";
import { oracle, shape } from "../../../subsystems/drapes/tests/parts/oracle.js";

const seated = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  const rig = paint(() => surface.Journal({ client: held.client, terminal: held.terminal }));
  await settle();
  return { ...held, rig };
};

const at = (iso) => surface.clock(Date.parse(iso));

const YOU = (time) =>
  `<div class="entry you headed " data-fn="jsel" data-arg="0"><div class="ehead"><span class="reg">&lt;&lt;</span><span class="who">beef</span><span class="meta">${time}</span><span class="ops"><button data-fn="copy" data-arg="0">copy</button><button data-fn="retry" data-arg="0">retry</button></span></div><div class="body"><div class="text">ciao, come stai?</div></div></div>`;

const AGENT = (time) =>
  `<div class="entry agent headed " data-fn="jsel" data-arg="1"><div class="ehead"><span class="reg">&gt;&gt;</span><span class="meta">${time} · 1 call</span><span class="ops"><button data-fn="copy" data-arg="1">copy</button><button data-fn="fold" data-arg="1">fold</button></span></div><div class="body"><div class="text">bene, grazie</div><div class="tools"><div class="tool" data-fn="tool" data-arg="1:0" title="click for the yield"><span class="g pos">✓</span><span class="name">lookup</span><span class="arg">{"word":"bene"}</span><span class="dur"></span></div></div></div></div>`;

const TRACE = (time, path) =>
  `<div class="entry trace  sel" data-fn="jsel" data-arg="2"><div class="reg">·</div><div class="body"><div class="text"><span class="ts">${time}</span>terminal/terminal-1 hello from the span<span class="path">${path}</span></div><div class="verbs"><button data-fn="copy" data-arg="2"><b>c</b>copy</button></div></div></div>`;

const OBJECT = (time, path) =>
  `<div class="entry trace  " data-fn="jsel" data-arg="3"><div class="reg">·</div><div class="body"><div class="text"><span class="ts">${time}</span>terminal/terminal-1<span class="path">${path}</span></div><div class="blocks"><div class="block"><div class="yield" style="padding:8px 12px 10px"><span style="padding-left:0px"><span class="k">home</span> <span class="s">"thread-1"</span></span></div></div></div></div></div>`;

const FAULT = `<div class="entry fault  " data-fn="jsel" data-arg="4"><div class="reg">!</div><div class="body"><div class="text">no such command /hepl</div></div></div>`;

specimen.describe("anima journal — the design's journal (dom.js:272) folded from thread.$turns + the terminal's records", () => {
  specimen.it("the thread's turns paint as the design's .entry rows: you · agent with its tool", async () => {
    const { rig } = await seated();
    specimen.expect(shape(rig.target)).toBe(oracle(YOU(at("2026-10-21T10:00:00.000Z")) + AGENT(at("2026-10-21T10:00:05.000Z"))));
    rig.close();
  });

  specimen.it("records on the terminal's span: a string is a trace, an object a json block, a fault is !; the chat lens hides them, trace drops the turns", async () => {
    const { rig, terminal, client, entities } = await seated();
    terminal.controller.stdout.log("hello from the span");
    terminal.controller.stdout.log({ home: "thread-1" });
    terminal.controller.stdout.fault(new Error("no such command /hepl"));
    client.controller.stdout.log("the client's own record");
    await settle();
    const records = terminal.controller.stdout.history.filter((record) => trace.key(record.path) === trace.key(terminal.controller.stdout.absolute) && record.track === "log");
    const [said, homed] = records.map((record) => surface.clock(record.at));
    const lensed = (lens) => {
      terminal.dock = { ...terminal.dock, lens };
      entities.terminal.$entities.set([...entities.terminal.$entities.get()]);
    };
    lensed("trace");
    client.surface.$focus.set("journal");
    await settle();
    fire(rig.target.querySelectorAll(".entry")[0], "click");
    await settle();
    specimen.expect(client.surface.jsel).toBe(0);
    specimen.expect(shape(rig.target)).toBe(oracle(TRACE(said, trace.pathname(terminal.controller.stdout.absolute)).replace('data-arg="2"', 'data-arg="0"') + OBJECT(homed, trace.pathname(terminal.controller.stdout.absolute)) + FAULT));
    lensed("chat");
    await settle();
    specimen.expect([...rig.target.querySelectorAll(".entry")].map((entry) => entry.className.split(" ")[1])).toEqual(["you", "agent"]);
    lensed("repl");
    await settle();
    specimen.expect([...rig.target.querySelectorAll(".entry")].map((entry) => entry.className.split(" ")[1])).toEqual(["you", "agent", "trace", "trace", "fault"]);
    rig.close();
  });

  specimen.it("a pick selects by index under journal focus; the selected trace wears .sel and the verbs row", async () => {
    const { rig, terminal, client } = await seated();
    terminal.controller.stdout.log("hello from the span");
    await settle();
    const [said] = terminal.controller.stdout.history.filter((record) => record.track === "log" && trace.key(record.path) === trace.key(terminal.controller.stdout.absolute)).map((record) => surface.clock(record.at));
    fire(rig.target.querySelectorAll(".entry")[2], "click");
    await settle();
    specimen.expect([client.surface.focus, client.surface.jsel]).toEqual(["journal", 2]);
    specimen.expect(shape(rig.target.querySelectorAll(".entry")[2].parentNode).split("\n")[2]).toBe(oracle(TRACE(said, trace.pathname(terminal.controller.stdout.absolute)).replace('<span class="path">' + trace.pathname(terminal.controller.stdout.absolute) + "</span>", "")));
    client.surface.$focus.set("frame");
    await settle();
    specimen.expect(rig.target.querySelector(".entry.sel")).toBe(null);
    rig.close();
  });

  specimen.it("ops are lines: retry re-says the turn; a tool click opens its yield", async () => {
    const { rig, sent } = await seated();
    fire(rig.target.querySelectorAll(".entry.you .ops button")[1], "click");
    specimen.expect(sent).toEqual(["ciao, come stai?"]);
    fire(rig.target.querySelector(".tool"), "click");
    await settle();
    specimen.expect(words(rig.target.querySelector(".tool + .yield"))).toBe('"well"');
    rig.close();
  });

  specimen.it("a PAUSED activity on the thread turns an unsettled call to wait; thinking parts fold into .think", async () => {
    const { rig, thread, entities } = await seated();
    thread.$turns.set([
      ...thread.$turns.get(),
      {
        role: "assistant",
        createdAt: "2026-10-21T10:00:09.000Z",
        parts: [
          { type: "thinking", text: "weigh e4\nit opens the bishop" },
          { type: "tool_use", id: "call-2", name: "match_move", input: { uci: "e2e4" } },
        ],
      },
    ]);
    entities.activity.$entities.set([{ id: "activity-1", type: "HALLUCINATION", status: "PAUSED", steps: [], thread }]);
    await settle();
    const last = [...rig.target.querySelectorAll(".entry")].at(-1);
    specimen.expect(words(last.querySelector(".tool"))).toBe('? match_move {"uci":"e2e4"} waiting');
    specimen.expect(last.querySelector(".tool .g").className).toBe("g cau");
    specimen.expect(shape(last.querySelector(".think").parentNode).split("\n")[0]).toBe(
      oracle(`<div class="think  "><button class="thh" aria-expanded="false"><span class="g">✓</span><span class="l">thinking</span><span class="m">1 steps · 0 calls</span><span class="cv">▸</span></button></div>`),
    );
    rig.close();
  });

  specimen.it("a turn merged mid-stream, its row not yet landed, paints as the streaming agent entry with the cursor; the landed row under the same id ends it", async () => {
    const { rig, thread } = await seated();
    const reply = { id: "a9", role: "assistant", parts: [{ type: "text", text: "sto" }] };
    thread.$turns.set([...thread.$turns.get(), reply]);
    await settle();
    const live = [...rig.target.querySelectorAll(".entry")].at(-1);
    specimen.expect([words(live.querySelector(".text")), live.querySelector(".text .cursor") !== null, words(live.querySelector(".meta"))]).toEqual(["sto", true, "…"]);
    thread.$turns.set([...thread.$turns.get().slice(0, -1), { ...reply, createdAt: "2026-10-21T10:00:09.000Z" }]);
    await settle();
    const landed = [...rig.target.querySelectorAll(".entry")];
    specimen.expect(landed.length).toBe(3);
    specimen.expect([words(landed.at(-1).querySelector(".text")), landed.at(-1).querySelector(".text .cursor")]).toEqual(["sto", null]);
    rig.close();
  });

  specimen.it("a buffer whose turns name a turn rides it as the design's .artcard; fullscreen is /buffer/full", async () => {
    const { rig, thread, terminal, sent } = await seated();
    const turns = thread.$turns.get();
    thread.$turns.set([turns[0], { ...turns[1], id: "turn-2" }]);
    const board = { id: "buffer-1", mime: "application/json", mode: "chess/chess", traits: ["LABELED"], trait: { LABELED: { name: "board" } }, views: [], files: [], turns: ["turn-2"], $data: atom({ turn: "w" }) };
    thread.$buffers.set([board]);
    terminal.$buffer.set(board);
    await settle();
    await settle();
    const card = rig.target.querySelector(".artcard");
    specimen.expect(shape(card.parentNode)).toBe(
      oracle(
        `<div class="artcard inframe"><div class="ah"><span class="sign">◆</span><span class="al">artifact</span><span>chess/chess</span><label class="asel" title=""><select aria-label="artifact"></select><svg><path/></svg></label><button class="iconbtn full" aria-label="fullscreen" title="fullscreen · /buffer/full board"><svg><path/></svg></button></div><div class="yield" style="padding:8px 12px 10px"><span style="padding-left:0px"><span class="k">turn</span> <span class="s">"w"</span></span></div></div>`,
      ),
    );
    specimen.expect(words(rig.target.querySelector(".entry.agent .meta")).endsWith("1 call · 1 artifact")).toBe(true);
    fire(card.querySelector(".full"), "click");
    fire([...rig.target.querySelectorAll(".entry.agent .ops button")].at(-1), "click");
    specimen.expect(sent).toEqual(["/buffer/full board", '/buffer "board"']);
    rig.close();
  });
});
