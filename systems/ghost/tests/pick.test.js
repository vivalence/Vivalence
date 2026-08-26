import { assertEquals } from "@std/assert";
import { pick } from "../belt/pick.js";

const rows = [
  { owner: "@viva", type: "instance", slug: "localhost" },
  { owner: "@viva", type: "instance", slug: "multiplayer" },
  { owner: "@localhost", type: "instance", slug: "standalone" },
];

const lens = {
  label: "instance",
  rows,
  keys: ["owner", "type", "slug"],
  facets: ["owner", "type"],
  columns: ["owner", "slug"],
  reference: (row) => `${row.owner}/${row.type}/${row.slug}`,
};

function fake({ interactive = true, chosen, flags = {} } = {}) {
  const rendered = [];
  const ctx = {
    interactive,
    signal: { flags },
    view: {
      scroll: {
        render: (data) => {
          rendered.push(data);
          return Promise.resolve(chosen);
        },
      },
    },
  };
  return { ctx, rendered };
}

Deno.test("pick: an unambiguous preset resolves without a picker", async () => {
  const { ctx, rendered } = fake();
  const result = await pick(ctx, lens, "standalone");
  assertEquals(result.reference, "@localhost/instance/standalone");
  assertEquals(rendered.length, 0);
});

Deno.test("pick: an ambiguous preset opens the picker with the query preset", async () => {
  const { ctx, rendered } = fake({ chosen: rows[1] });
  const result = await pick(ctx, lens, "@viva");
  assertEquals(rendered[0].query, "@viva");
  assertEquals(rendered[0].rows.length, 3);
  assertEquals(result.reference, "@viva/instance/multiplayer");
});

Deno.test("pick: no preset opens the picker bare", async () => {
  const { ctx, rendered } = fake({ chosen: rows[0] });
  const result = await pick(ctx, lens);
  assertEquals(rendered[0].query, "");
  assertEquals(result.reference, "@viva/instance/localhost");
});

Deno.test("pick: a preset matching nothing yields null so the caller keeps its own branch", async () => {
  const { ctx, rendered } = fake();
  assertEquals(await pick(ctx, lens, "../some/path"), null);
  assertEquals(rendered.length, 0);
});

Deno.test("pick: escaping the picker reports the abort", async () => {
  const { ctx } = fake({ chosen: { aborted: true } });
  assertEquals(await pick(ctx, lens, "@viva"), { aborted: true });
});

Deno.test("pick: a non-interactive shell throws with the candidates instead of blocking", async () => {
  const { ctx, rendered } = fake({ interactive: false });
  let thrown = null;
  try {
    await pick(ctx, lens, "@viva");
  } catch (error) {
    thrown = error;
  }
  assertEquals(rendered.length, 0);
  assertEquals(String(thrown).includes("@viva/instance/localhost"), true);
  assertEquals(String(thrown).includes("@viva/instance/multiplayer"), true);
});

Deno.test("pick: an empty lens throws rather than opening an empty picker", async () => {
  const { ctx } = fake();
  let thrown = null;
  try {
    await pick(ctx, { ...lens, rows: [] });
  } catch (error) {
    thrown = error;
  }
  assertEquals(String(thrown).includes("no instance"), true);
});
