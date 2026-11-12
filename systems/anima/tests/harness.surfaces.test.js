import { TIER_POINTS } from "@vivalence/typology/scenarios";
import { atom } from "nanostores";
import { Cortex, soma, specimen, Vector } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import { belt } from "@vivalence/ghost";
import * as oracle from "../../../commons/playground/chaosmonkey/oracle/oracle.viva.js";
import { contexted, previewing, sections } from "../src/surfaces/chrome/panels/sidebar/sections.js";
import { indexed, picked, served } from "../src/surfaces/chrome/panels/telemetry/entities.js";

const seer = () => ({
  type: "dialogue",
  id: "dialogue-1",
  tune: [0.9, 0.3, 0.5],
  context: 200000,
  channels: { in: ["text"], out: ["text"] },
  via: { stream: async () => soma.drain({ role: "assistant", parts: [{ type: "text", text: "the mist parts" }], meta: { state: "complete" } }) },
});

let scenario;
const MOUNT = "/mode/chaosmonkey/oracle";

specimen.beforeAll(async () => {
  scenario = await mountMode(oracle, { cortex: new Cortex(TIER_POINTS).register([seer()]) });
});
specimen.afterAll(async () => {
  await scenario.orm.close();
});

const worlded = async (TOOLED, expand, turns = []) => {
  const metadata = await scenario.authedConn.branch(MOUNT).call("/metadata/harness");
  const mode = {
    type: "chaosmonkey",
    slug: "oracle",
    name: "oracle",
    version: "0.0.1",
    traits: ["HARNESSED"],
    daemon: null,
    reference: { absolute: metadata.home },
    implements: (trait) => trait === "HARNESSED",
    metadata: { harness: metadata },
    repl: scenario.mode.aperture,
    keymap: scenario.mode.aperture,
  };
  const thread = { id: "th1", word: "first words", mode, traits: ["HARNESSED"], trait: { HARNESSED: { tier: "fast", effort: "low", rounds: 6, slugging: "deep" }, TOOLED, PRIMED: {} } };
  const runtime = {
    cortex: new Cortex(TIER_POINTS).register([seer()]),
    status: { code: "HEALTHY" },
    reference: { absolute: "/runtime/stub" },
    lighthouse: { isAuthorized: true, status: { code: "VERIFIED" }, user: { slug: "beef" } },
    entities: {},
  };
  return {
    sections: { expand, peeks: {}, views: {}, filter: {}, current: null, pick: null, hostsOff: { thread: [], mode: [] }, traits: { thread: [], mode: [] } },
    hidden: [],
    terminal: { dock: { ...belt.dock.DEFAULT_DOCK }, thread, repl: { commands: new Vector() } },
    thread,
    runtime,
    activities: [],
    buffers: [],
    turns,
    terminals: [],
    threads: [thread],
    modes: [mode],
    daemons: [],
    hosts: ["/runtime/stub"],
    app: {
      theme: "northsea",
      bridge: { font: "base", call: null, dictation: null },
      client: { mask: { manifest: { slug: "anima" } } },
      box: {
        device: {
          microphone: { claimed: false, paused: false, level: 0, permission: "prompt" },
          speaker: { claimed: false, playing: false },
        },
      },
    },
    telemetry: { open: false },
  };
};

specimen.describe("anima surfaces over the served map", () => {
  specimen.it("the sidebar: the strip tallies and holds the view; a tree row per owner → mode → leaf, indented, a pressed own key resets, its glyph by state, a set of acts inline, a fold; a key carries its leaves on a rail; the bar's tally", async () => {
    const world = await worlded({}, { tools: true });
    const home = world.thread.mode.metadata.harness.home;
    const lookup = `${home}/lookup`;
    const valence = world.thread.mode.metadata.harness.index.TOOLED[0].valence;
    const owner = home.split("/").slice(0, 3).join("/");
    const said = owner;
    const open = { tools: true, [`tools${owner}`]: true, [`tools${home}`]: true, [`tools${lookup}`]: true };
    const tail = (held) => {
      const rows = sections(held).find((section) => section.id === "harness").rows;
      return rows.slice(rows.findIndex((row) => row.label === "tools"));
    };
    const pairs = (tally) => tally.map((pair) => `${pair.count}${pair.mark}`).join(" ");
    const acted = (set) => set.map((entry) => `${entry.mark}${entry.on ? " on" : ""}${entry.off ? " off" : ""}${entry.signal === undefined ? "" : ` ${entry.signal}`}`);
    const SHOWN = {
      sub: (row) => ["sub", row.label, pairs(row.tally), row.chips.map((chip) => `${chip.label}${chip.cur ? "*" : ""}`)],
      item: (row) => ["item", row.label, row.sub, row.mark, row.mk, row.lc, row.depth, row.rail, pairs(row.tally), acted(row.set), row.fold === null ? null : row.fold.mark, row.cur],
      note: (row) => ["note", row.text],
      value: (row) => ["value", row.label, row.value],
      more: (row) => ["more", row.label, row.signal],
    };
    const shown = (rows) => rows.map((row) => SHOWN[row.type](row));
    const shut = tail(world);
    const opened = tail(await worlded({}, open));
    const carried = tail(await worlded({ [home]: "eager" }, open));
    const loaded = (held) => ({ ...held, sections: { ...held.sections, current: `tools${lookup}` } });
    const current = tail(loaded(await worlded({ [lookup]: "none" }, open)));
    const none = tail(await worlded({ [home]: "none" }, { tools: true }));
    console.log(JSON.stringify({ shut: shown(shut), opened: shown(opened), carried: shown(carried), current: shown(current), none: shown(none) }, null, 2));
    specimen.expect(shown(shut)).toEqual([
      ["sub", "tools", "1●", ["loaded*", "all"]],
      ["item", said, "", "", "none", "strong", 0, -1, "1●", ["● /tool/load " + owner, "○ /tool/preload " + owner, "× /tool/unload " + owner], "▸", false],
    ]);
    specimen.expect(shown(opened).slice(1)).toEqual([
      ["item", said, "", "", "none", "strong", 0, -1, "", ["● /tool/load " + owner, "○ /tool/preload " + owner, "× /tool/unload " + owner], "▾", false],
      ["item", "chaosmonkey/oracle", "home", "", "none", "strong", 1, -1, "", ["● /tool/load " + home, "○ /tool/preload " + home, "× /tool/unload " + home], "▾", false],
      ["item", "lookup", "", "●", "eager", "ink", 2, -1, "", ["● on", "○ off", "× /tool/unload " + lookup], null, false],
      ["note", valence],
      ["value", "reference", lookup],
      ["value", "decided by", "mode default"],
    ]);
    specimen.expect(shown(current).slice(3, 4)).toEqual([
      ["item", "lookup", "", "", "none keyed", "light", 2, -1, "", ["● /tool/load " + lookup, "○ /tool/preload " + lookup, "× on /tool/reset " + lookup], null, true],
    ]);
    specimen.expect(shown(carried).slice(2, 4)).toEqual([
      ["item", "chaosmonkey/oracle", "home", "●", "eager keyed", "strong", 1, -1, "", ["● on /tool/reset " + home, "○ off", "× /tool/unload " + home], "▾", false],
      ["item", "lookup", "", "●", "eager carried", "ink", 2, 1, "", ["● on", "○ off", "× /tool/unload " + lookup], null, false],
    ]);
    specimen.expect(shown(none)).toEqual([
      ["sub", "tools", "", ["loaded*", "all"]],
      ["item", said, "", "", "none", "strong", 0, -1, "", ["● /tool/load " + owner, "○ /tool/preload " + owner], "▸", false],
    ]);
    specimen.expect(belt.harness.tallied(world.thread)).toEqual({ eager: 1, lazy: 0 });
  });

  specimen.it("the context row: the last reported turn's usage against the model's window, thirty cells, a toggle that opens used · last turn · cost", async () => {
    const turns = [
      { role: "user", meta: null },
      { role: "assistant", meta: { state: "complete", usage: { input: 25700, output: 300, cost: 0.0123 } } },
      { role: "user", meta: null },
    ];
    const limit = seer().context;
    const rows = (held) => sections(held).find((section) => section.id === "harness").rows;
    const at = (list) => list.findIndex((row) => row.label === "context");
    const shut = rows(await worlded({}, {}, turns));
    const open = rows(await worlded({}, { context: true }, turns));
    const silent = rows(await worlded({}, {}, []));
    const shown = (list) => list.slice(at(list), at(list) + 4).map((row) => [row.type, row.label, row.text ?? row.value, row.pct, row.rings, row.fn, row.open]);
    console.log(JSON.stringify({ shut: shown(shut), open: shown(open), silent: shown(silent).slice(0, 1) }, null, 2));
    specimen.expect(contexted(turns, seer())).toEqual({ input: 25700, output: 300, cost: 0.0123, used: 26000, limit, pct: Math.round((26000 / limit) * 100) });
    specimen.expect(shown(shut).slice(0, 1)).toEqual([["meter", "context", `${Math.round((26000 / limit) * 100)} %`, Math.round((26000 / limit) * 100), 30, "expand", false]]);
    specimen.expect(shown(open).slice(1)).toEqual([
      ["value", "used", "26.0k / 200.0k", undefined, undefined, undefined, undefined],
      ["value", "last turn", "25.7k in · 300 out", undefined, undefined, undefined, undefined],
      ["value", "cost", "$0.0123", undefined, undefined, undefined, undefined],
    ]);
    specimen.expect(shown(silent).slice(0, 1)).toEqual([["meter", "context", "0 %", 0, 30, "expand", false]]);
  });

  specimen.it("the inspector: the map grouped mode → leaf; a leaf's lines as the comp names them, a mode's members and acts", async () => {
    const world = await worlded({}, {});
    const home = world.thread.mode.metadata.harness.home;
    const lookup = `${home}/lookup`;
    const map = served("map", world.thread);
    const index = indexed(map);
    const leaf = picked(index, `map/tools${lookup}`);
    const said = home.split("/").slice(0, 3).join("/");
    specimen.expect(map.kids[0].kids.map((owner) => [owner.name, owner.kids.map((mode) => [mode.name, mode.quiet])])).toEqual([
      [said, [["chaosmonkey/oracle", "home · 1●"]]],
    ]);
    const mode = picked(index, `map/tools${home}`);
    console.log(JSON.stringify({ leaf, mode }, null, 2));
    specimen.expect([leaf.kind, leaf.title, leaf.acts.map((act) => act.signal)]).toEqual(["tool", "/lookup", [`/tool/unload ${lookup}`]]);
    specimen.expect(leaf.sections.map((section) => [section.label, section.rows.map((row) => [row.k, row.v])])).toEqual([
      ["own", [["reference", lookup], ["state", "● loaded"], ["decided by", "mode default"], ["model sees", "lookup 6/64"]]],
      ["valence", [["valence", world.thread.mode.metadata.harness.index.TOOLED[0].valence]]],
    ]);
    specimen.expect([mode.kind, mode.title, mode.acts.map((act) => act.signal)]).toEqual(["branch", "chaosmonkey/oracle", [`/tool/load ${home}`, `/tool/preload ${home}`, `/tool/unload ${home}`]]);
    specimen.expect(mode.sections.slice(0, 2).map((section) => [section.label, section.rows.map((row) => [row.k, row.v])])).toEqual([
      ["own", [["reference", home], ["state", "1●"], ["decided by", "—"]]],
      ["members", [["● lookup", "loaded"]]],
    ]);
  });

  specimen.it("the repl: a references command completes the next segment and previews its changes before enter; a deeper none outlives a wider load", async () => {
    const world = await worlded({}, {});
    const home = world.thread.mode.metadata.harness.home;
    const catalog = [{ nature: "/tool/unload", args: true, options: [], input: { type: "object", properties: { references: { type: "array" } } } }];
    const offered = (nature) => belt.harness.indexed(world.thread, nature);
    const pathed = belt.catalog.pathing(catalog, `/tool/unload ${home.slice(0, -3)}`, offered);
    const loading = belt.harness.previewed(world.thread, "/tool/load", [`${home}/lookup`]);
    const keyed = { ...world.thread, trait: { ...world.thread.trait, TOOLED: { [`${home}/lookup`]: "none" } } };
    console.log(JSON.stringify({ pathed, loading, unloading: belt.harness.previewed(keyed, "/tool/unload", [`${home}/lookup`]) }, null, 2));
    specimen.expect(pathed.options).toEqual([home]);
    specimen.expect(loading).toEqual([]);
    specimen.expect(belt.harness.previewed(keyed, "/tool/unload", [`${home}/lookup`])).toEqual([]);
    specimen.expect(belt.harness.previewed(world.thread, "/tool/unload", [`${home}/lookup`])).toEqual([{ reference: `${home}/lookup`, before: "eager", after: "none" }]);
    specimen.expect(belt.harness.previewed(keyed, "/tool/load", [home])).toEqual([]);
    specimen.expect(belt.harness.previewed(null, "/tool/load", [home])).toEqual([]);
    const lookup = `${home}/lookup`;
    const unloading = previewing(world.thread, "/tool/unload", [lookup], lookup, []);
    console.log(JSON.stringify(unloading, null, 2));
    specimen.expect(unloading).toMatchObject({ said: "", fault: false, count: 1, head: "would change 1" });
    specimen.expect(unloading.rows.map((row) => [row.head, row.mark, row.label, row.sub])).toEqual([
      [true, "", "chaosmonkey/oracle", home.split("/")[2]],
      [false, "×", "lookup", "● → ×"],
    ]);
    specimen.expect(previewing(world.thread, "/tool/load", [lookup], lookup, [lookup])).toMatchObject({ said: "already so", rows: [] });
    specimen.expect(previewing(world.thread, "/tool/load", ["/nowhere"], "/nowhere", [])).toMatchObject({ said: "matches nothing: /nowhere", fault: true });
    specimen.expect(previewing(world.thread, "/primer/unload", [lookup], lookup, [])).toMatchObject({ said: `matches nothing: ${lookup}`, fault: true, rows: [] });
  });
});
