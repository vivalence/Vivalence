import { assert, assertEquals } from "@std/assert";
import { shard, steer, ToolCall, Vector } from "@vivalence/typology";
import { fs } from "../skills/fs.js";
import { shell } from "../skills/shell.js";

const invoke = (armed, name, input) =>
  steer.dispatch.invoke(armed, new ToolCall(name).signal, steer.strategy.guarded)(input);

const harness = async () => {
  const root = await Deno.makeTempDir();
  await Deno.mkdir(`${root}/dataset`);
  await Deno.mkdir(`${root}/bak`);
  await Deno.writeTextFile(`${root}/dataset/rows.json`, `[1, 2, 3]`);
  await Deno.writeTextFile(`${root}/readme.md`, "line one\nline two\nline three");
  await Deno.writeTextFile(`${root}/empty.txt`, "");
  const armed = new Vector()
    .use(shard.context.bind("root", root))
    .slurp(fs)
    .slurp(shell);
  return { root, armed };
};

Deno.test("paladin skills — fs + shell", async (t) => {
  const { root, armed } = await harness();

  await t.step("fs_tree lists the root and skips bak", async () => {
    const spoken = await invoke(armed, "fs_tree", {});
    assert(spoken.output.message.includes("dataset/"));
    assert(spoken.output.message.includes("readme.md"));
    assert(!spoken.output.message.includes("bak"));
  });

  await t.step("fs_find matches by name under a path", async () => {
    const spoken = await invoke(armed, "fs_find", { pattern: "\\.json$" });
    assertEquals(spoken.output.files, ["dataset/rows.json"]);
  });

  await t.step("fs_read slices by range", async () => {
    const spoken = await invoke(armed, "fs_read", {
      path: "readme.md",
      range: { from: 2, to: 2 },
    });
    assertEquals(spoken.output.message, "line two");
  });

  await t.step("fs_read of an empty file says so", async () => {
    const spoken = await invoke(armed, "fs_read", { path: "empty.txt" });
    assertEquals(spoken.output.message, "(empty)");
  });

  await t.step("escapes throw naming the root", async () => {
    for (const path of ["../outside.txt", "a/../../outside.txt"]) {
      let thrown = null;
      try {
        await invoke(armed, "fs_read", { path });
      } catch (fault) {
        thrown = fault;
      }
      assert(thrown, `expected '${path}' to throw`);
      assert(thrown.message.includes(root));
    }
  });

  await t.step("absolute input folds under the root", async () => {
    const spoken = await invoke(armed, "fs_read", { path: "/readme.md" });
    assert(spoken.output.message.includes("line one"));
  });

  await t.step("fs_write creates parents and reports bytes", async () => {
    const spoken = await invoke(armed, "fs_write", {
      path: "deep/nested/note.txt",
      content: "hello",
    });
    assert(spoken.output.message.includes("5 bytes"));
    assertEquals(await Deno.readTextFile(`${root}/deep/nested/note.txt`), "hello");
  });

  await t.step("shell_run returns the tail and exit code, nonzero stays NOMINAL", async () => {
    const ok = await invoke(armed, "shell_run", { command: "echo hi" });
    assertEquals(ok.output.message, "hi");
    assertEquals(ok.output.code, 0);

    const nonzero = await invoke(armed, "shell_run", { command: "exit 3" });
    assertEquals(nonzero.output.code, 3);
    assertEquals(nonzero.condition, undefined);
  });

  await Deno.remove(root, { recursive: true });
});
