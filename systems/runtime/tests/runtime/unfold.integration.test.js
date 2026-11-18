import { specimen } from "@vivalence/typology";
import { STUB_FACULTIES } from "../../../../commons/fixtures/testing/data/stub.js";
import { hello } from "../scenarios/index.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const STUB = "@commons/hallucinator/stub";
const RECIPE = {
  ...hello.RECIPE,
  runtime: { ...hello.RECIPE.runtime, hallucinators: [{ module: STUB, faculties: STUB_FACULTIES }] },
  daemons: [
    {
      ...hello.RECIPE.daemons[0],
      modes: [
        {
          module: "@commons/demo/hello-world",
          hallucinators: [
            {
              module: STUB,
              faculties: [
                { id: "stub-speech", tier: "tongue" },
                { type: "speech", id: "stub-voice", tune: [0.9, 0.1, 0.1] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("faculty unfolding on a booted runtime — the recipe's hallucinators reach every host's own cortex (m126)", () => {
  let world;
  let finn;
  const served = async (host) => {
    const response = await world.get(`${host}/metadata/cortex`, finn.access);
    expect([host, response.status]).toEqual([host, 200]);
    return await response.json();
  };
  const ids = (faculties) => faculties.map((faculty) => faculty.id).sort();

  beforeAll(async () => {
    world = await hello.boot({ recipe: RECIPE, prefix: "viva-unfold-" });
    await (await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" })).json();
    const login = await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json();
    finn = { access: login.authority.access };
  });

  afterAll(() => world.stop());

  it("the runtime and its daemon each serve the runtime's five; no /metadata/tiers anywhere", async () => {
    const five = STUB_FACULTIES.map((faculty) => faculty.id).sort();
    expect(ids(await served("/runtime/house"))).toEqual(five);
    expect(ids(await served("/daemon/hello"))).toEqual(five);
    expect(ids(await served("/runtime/house/mode/home/probe"))).toEqual(five);
    for (const host of ["/runtime/house", "/daemon/hello"]) {
      const response = await world.get(`${host}/metadata/tiers`, finn.access);
      expect([host, response.status]).toEqual([host, 404]);
      await response.body?.cancel();
    }
  });

  it("the mode that added a faculty and restated one holds six: its own on top of its daemon's, the restated one wearing its tier, stamped with its provider", async () => {
    const own = await served("/daemon/hello/mode/demo/hello-world");
    expect(ids(own)).toEqual([...STUB_FACULTIES.map((faculty) => faculty.id), "stub-voice"].sort());
    const worn = own.find((faculty) => faculty.id === "stub-speech");
    expect([worn.type, worn.tier, worn.provider, worn.tune]).toEqual(["speech", "tongue", "stub", [0.3, 0.8, 0.9]]);
    expect((await served("/daemon/hello")).find((faculty) => faculty.id === "stub-speech").tier).toBeUndefined();
  });
});
