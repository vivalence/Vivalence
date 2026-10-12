import { specimen } from "@vivalence/typology";
import { hello } from "@vivalence/runtime/scenarios";
import { join } from "@std/path";

const { describe, it, beforeAll, afterAll, expect } = specimen;

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    Deno.mkdirSync(SNAPSHOTS, { recursive: true });
    specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  }
  expect(pojo).toEqual(JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file))));
  return pojo;
}

const MEMO = JSON.parse(await Deno.readTextFile(new URL("../instance/instance.viva.json", import.meta.url)));
const RECIPE = { ...hello.RECIPE, daemons: MEMO.daemons };
const MODE = "/daemon/memo/mode/srs/memo";
const DOMAIN = "/daemon/memo";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const ISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g;

const SCRIPT = [
  [MODE, "/deck", { limit: 5 }],
  [DOMAIN, "/preview/literal", { literal: "deus.noun" }],
  [MODE, "/grade", { card: "deus.noun", signal: "GOOD" }],
  [DOMAIN, "/pick/literal/feed", { limit: 3 }],
  [DOMAIN, "/pick/literal/novel", { limit: 3 }],
  [DOMAIN, "/history/literal", { literal: "deus.noun" }],
  [DOMAIN, "/review/literal", { literal: "crux.noun", signal: "GOOD" }],
  [DOMAIN, "/review/literal", { literal: "crux.noun", signal: "GOOD" }],
  [DOMAIN, "/review/literal", { literal: "crux.noun", signal: "AGAIN" }],
  [DOMAIN, "/review/literal", { literal: "verbum.noun", signal: "EASY" }],
  [DOMAIN, "/review/literal", { literal: "fides.noun", signal: "HARD" }],
  [DOMAIN, "/history/literal", { literal: "crux.noun" }],
  [DOMAIN, "/pick/literal/leeches", { lapses: 1, limit: 5 }],
  [DOMAIN, "/pick/literal/byStatus", { status: ["LEARNING", "UNKNOWN"], limit: 10 }],
  [DOMAIN, "/pick/literal/byStrength", { limit: 10 }],
  [DOMAIN, "/suspend/literal", { literal: "dominus.noun", reason: "snapshot" }],
  [MODE, "/deck", { limit: 2 }],
  [MODE, "/stats", {}],
  [DOMAIN, "/resume/literal", { literal: "dominus.noun" }],
  [MODE, "/deck", { limit: 2 }],
  [MODE, "/stats", {}],
];

describe("memo · the domain and the Magister's routes over a live runtime, one learner, one script", () => {
  let world;
  beforeAll(async () => {
    world = await hello.boot({ recipe: RECIPE, prefix: "memo-domain-snapshot-" });
  });
  afterAll(async () => {
    await world.stop();
  });

  it("a fresh learner's script: dealt, previewed, graded, fed, traced, lapsed into a leech, suspended and resumed — every answer pinned", async () => {
    const signup = await (await world.post("/lighthouse/signup", { username: "discipulus", password: "memo-snapshot" })).json();
    expect(signup.status).toBe("SUCCESS");
    const learner = signup.authority.access;
    const seen = new Map();
    const named = (id) => {
      if (!seen.has(id)) seen.set(id, `<id:${seen.size}>`);
      return seen.get(id);
    };
    const normalized = (value) => JSON.parse(JSON.stringify(value).replaceAll(world.origin, "<origin>").replace(UUID, named).replace(ISO, "<iso>"));

    const answers = [];
    for (const [host, route, body] of SCRIPT) {
      const response = await world.post(`${host}${route}`, body, learner);
      answers.push({ route: `${host}${route}`, body, status: response.status, answer: normalized(await response.json()) });
    }
    const pinned = pin(answers, "memo-domain-script.snapshot.json");
    expect(pinned.every((step) => step.status === 200)).toBe(true);
  });
});
