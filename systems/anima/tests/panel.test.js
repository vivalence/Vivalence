import { specimen, Vector } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { fire, paint, settle, surface, world } from "./world.js";
import { oracle, shaped } from "../../../subsystems/drapes/tests/scenarios/shape.js";

const WALKED = `<div class="ph"><span class="tag">d</span><span class="crumb">ctrl-v d</span><span class="hint"></span></div><div class="pb">
<button class="krow  " data-fn="entry"><span class="key">j</span><span class="nm">/dock/lens</span><span class="val"></span></button>
<button class="krow  " data-fn="entry"><span class="key">d</span><span class="nm">/dock</span><span class="val"></span></button>
<button class="krow  " data-fn="entry"><span class="key">s</span><span class="nm">/split</span><span class="val"></span></button></div>`;

const PALETTE = `<div class="ph"><span class="tag">repl</span><span class="crumb">&lt;&lt; mode</span><span class="hint">tab completes · enter runs · esc drops</span></div><div class="pb">
<button class="prow sel" data-fn="fill"><span class="nat">/<span class="hl">mode</span>s</span><span class="args"></span><span class="val"></span><span class="chord"></span></button>
<button class="prow " data-fn="fill"><span class="nat">/<span class="hl">mode</span></span><span class="args"></span><span class="val"></span><span class="chord">ctrl-v m</span></button></div>`;

const CHOOSER = `<div class="ph"><span class="tag">dock</span><span class="crumb">&lt;&lt; /dock cl</span><span class="hint">type to filter · enter picks · esc back</span></div><div class="pb chooser"><div class="cf"><span class="q">cl</span><span class="caret"></span><span class="n">1</span></div><button class="crow sel" data-line="/dock closed"><span class=""><span class="hl">cl</span>osed</span><span class="sub"></span></button></div>`;

const NOTHING = `<div class="krow"><span class="key">✕</span><span class="nm">nothing matches</span><span class="val">enter sends it anyway — the repl answers not found</span></div>`;

const seated = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  held.terminal.repl.commands = new Vector().graft(ghost.terminal.commands.dock);
  const rig = paint(() => surface.Panel({ client: held.client }));
  await settle();
  const close = () => rig.close();
  return { ...held, rig, close };
};

const pressed = async (client, ...keys) => {
  for (const key of keys) client.terminal.legend.dispatch(key);
  await settle();
  await settle();
};

specimen.describe("panel — Dom.panel: the chord walk under ctrl-v, the palette", () => {
  specimen.it("ctrl-v d walks into the display subject: .ph tag · crumb · hint over .krow edges; a row presses its key", async () => {
    const { rig, client, sent, close } = await seated();
    await pressed(client, "leader", "d");
    const panel = rig.target.querySelector("section.panel[data-zone='0']");
    specimen.expect(shaped(panel)).toBe(oracle(WALKED));
    fire(panel.querySelectorAll(".krow")[2], "click");
    await settle();
    await settle();
    specimen.expect(client.terminal.legend.chord).toBe(null);
    specimen.expect(sent).toEqual(["/split"]);
    await close();
  });

  specimen.it("the palette lists $catalog; the composer's draft narrows and lights the match, the crumb shows it; a row dispatches; nothing matching says so", async () => {
    const { rig, client, sent, close } = await seated();
    client.terminal.repl.$catalog.set([
      { nature: "/help", chord: "leader/?", options: [], args: false },
      { nature: "/modes", chord: "", options: [], args: false },
      { nature: "/mode", chord: "leader/m", options: [], args: false },
    ]);
    await settle();
    specimen.expect(rig.target.querySelectorAll(".prow").length).toBe(3);
    specimen.expect(rig.target.querySelector(".ph input")).toBe(null);
    client.surface.$draft.set("mode");
    await settle();
    specimen.expect(shaped(rig.target.querySelector("section.panel"))).toBe(oracle(PALETTE));
    client.surface.$draft.set("zzz");
    await settle();
    specimen.expect(shaped(rig.target.querySelector("section.panel .pb"))).toBe(oracle(NOTHING));
    client.surface.$draft.set("mode");
    await settle();
    fire(rig.target.querySelectorAll(".prow")[1], "click");
    await settle();
    specimen.expect(sent).toEqual(["/mode"]);
    specimen.expect(rig.target.querySelector("section.panel").hasAttribute("hidden")).toBe(true);
    await close();
  });
  specimen.it("a typed /verb with options opens the chooser: .pb.chooser › .cf filter · count, a .crow per option; a pick fills the composer's draft; enter on an exact option runs it; enter on a verb wanting args fills it", async () => {
    const { rig, client, sent, terminal, close } = await seated();
    client.terminal.repl.$catalog.set(ghost.shard.keymap.catalog(terminal.repl.commands));
    client.surface.$draft.set("/dock ");
    await settle();
    specimen.expect(rig.target.querySelectorAll(".crow").length).toBe(6);
    client.surface.$draft.set("/dock cl");
    await settle();
    specimen.expect(shaped(rig.target.querySelector("section.panel"))).toBe(oracle(CHOOSER));
    fire(rig.target.querySelector(".crow"), "click");
    await settle();
    specimen.expect([client.surface.draft, client.terminal.repl.catalog, client.surface.focus]).toEqual(["/dock closed", null, "composer"]);
    client.terminal.repl.$catalog.set(ghost.shard.keymap.catalog(terminal.repl.commands));
    await settle();
    surface.enter(client, client.terminal.repl.catalog, "/dock closed");
    await settle();
    specimen.expect(sent).toEqual(["/dock closed"]);
    specimen.expect(client.surface.draft).toBe("");
    client.terminal.repl.$catalog.set(ghost.shard.keymap.catalog(terminal.repl.commands));
    surface.enter(client, client.terminal.repl.catalog, "/spl");
    await settle();
    specimen.expect([client.surface.draft, client.terminal.repl.catalog]).toEqual(["/split ", null]);
    specimen.expect(sent).toEqual(["/dock closed"]);
    await close();
  });
});
