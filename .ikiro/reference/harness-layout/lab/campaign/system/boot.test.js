import { specimen, ToolCall } from "@vivalence/typology";
import { hello } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/index.js";
import { snapshot } from "../lib/fixture.js";
import { GRAMMAR, natures, print } from "../lib/world.js";
import { narrow } from "../lib/copied/load.js";

const SNAP = new URL("../snapshots/system", import.meta.url).pathname;
const leaves = (node, steps = []) =>
  Object.entries(node?.branches ?? {}).flatMap(([key, child]) => [
    ...(child.effect !== undefined ? [[...steps, key]] : []),
    ...leaves(child, [...steps, key]),
  ]);

specimen.describe("L4 system — a real runtime + daemon on a FREE port, empty HOME", () => {
  let world;
  let access;
  specimen.beforeAll(async () => {
    world = await hello.boot();
  });
  specimen.afterAll(async () => {
    await world?.stop();
  });

  specimen.it("boots on a free port, never :2501 · :1794; signs in", async () => {
    print("world", { origin: world.origin, port: world.port, ready: world.ready, pid: world.child.pid, root: world.root, HOME: Deno.env.get("HOME") });
    specimen.expect([2501, 1794].includes(world.port)).toBe(false);
    await (await world.post("/lighthouse/signup", { username: "campaign", password: "campaign22" })).json();
    const login = await (await world.post("/lighthouse/login", { username: "campaign", password: "campaign22" })).json();
    access = login.authority.access;
    specimen.expect(login.status).toBe("SUCCESS");
  });

  specimen.it("Q22 · Q23 — the live listing's references are the full address form", async () => {
    const runtime = await (await world.get("/runtime/house/metadata/modes", access)).json();
    const daemon = await (await world.get("/daemon/hello/metadata/modes", access)).json();
    print("live mode listing, whole", { runtime, daemon });
    const shape = /^\/(runtime|daemon)\/[^/]+\/mode\/[^/]+\/[^/]+$/;
    specimen.expect([...runtime, ...daemon].every((mode) => shape.test(mode.reference))).toBe(true);
  });

  specimen.it("Q27 on LIVE trees: every mode's /metadata/harness tools, narrowed from every live home", async () => {
    const runtime = await (await world.get("/runtime/house/metadata/modes", access)).json();
    const daemon = await (await world.get("/daemon/hello/metadata/modes", access)).json();
    const modes = [...runtime, ...daemon];
    const harnesses = {};
    const statuses = [];
    for (const mode of modes) {
      for (const method of ["get", "post"]) {
        const response = method === "get" ? await world.get(`${mode.metadata}/harness`, access) : await world.post(`${mode.metadata}/harness`, {}, access);
        const body = await response.text();
        statuses.push({ reference: mode.reference, method, status: response.status, chars: body.length });
        if (response.status === 200 && !harnesses[mode.reference]) harnesses[mode.reference] = JSON.parse(body);
      }
    }
    print("GET/POST <mode>/metadata/harness", statuses);
    const today = Object.fromEntries(Object.entries(harnesses).map(([reference, held]) => [reference, leaves(held.tools).map((steps) => new ToolCall(steps.map((nature) => ({ nature })).filter((step) => step.nature)).name)]));
    print("TODAY: the names each live harness declares (shard.hallucinate naming)", today);
    const held = Object.entries(harnesses).flatMap(([reference, metadata]) => leaves(metadata.tools).map((steps) => `${reference}/${steps.flatMap((step) => natures(`/${step}`)).join("/")}`));
    const rows = [];
    for (const mode of modes) {
      const [kind, slug] = natures(mode.reference);
      const home = { host: `/${kind}/${slug}`, mode: mode.reference };
      for (const reference of held) {
        const name = new ToolCall(natures(narrow(home, reference)).map((nature) => ({ nature }))).name;
        rows.push({ home: mode.reference, reference, name, chars: name.length, grammar: GRAMMAR.test(name) });
      }
    }
    const path = snapshot(SNAP, "live-narrow", { harnesses, rows });
    const collisions = modes.flatMap((mode) => {
      const mine = rows.filter((row) => row.home === mode.reference);
      return Object.entries(Object.groupBy(mine, (row) => row.name)).filter(([, group]) => group.length > 1).map(([name, group]) => ({ home: mode.reference, name, references: group.map((row) => row.reference) }));
    });
    print("DESIGN: narrowed names over the live world", { denominator: `${rows.length} (home × tool) over ${modes.length} homes × ${held.length} tools`, collisions, overlong: rows.filter((row) => row.chars > 64), offGrammar: rows.filter((row) => !row.grammar), snapshot: path });
    specimen.expect(held.length > 0).toBe(true);
    specimen.expect(collisions).toEqual([]);
  });
});
