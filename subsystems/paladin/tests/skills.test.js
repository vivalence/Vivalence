import { assert, assertEquals } from "@std/assert";
import { steer, ToolCall, Vector } from "@vivalence/typology";
import { fs } from "../skills/fs.js";
import { shell } from "../skills/shell.js";

const invoke = (armed, name, input) =>
  steer.dispatch.invoke(armed, new ToolCall(name).signal, steer.strategy.guarded)(input);

// nothing is bound: every path the tools take is absolute
const harness = async () => {
  const root = await Deno.makeTempDir();
  await Deno.mkdir(`${root}/dataset`);
  await Deno.mkdir(`${root}/bak`);
  await Deno.writeTextFile(`${root}/dataset/rows.json`, `[1, 2, 3]`);
  await Deno.writeTextFile(`${root}/readme.md`, "line one\nline two\nline three");
  await Deno.writeTextFile(`${root}/empty.txt`, "");
  const armed = new Vector().slurp(fs).slurp(shell);
  return { root, armed };
};

Deno.test("paladin skills — fs + shell", async (t) => {
  const { root, armed } = await harness();

  await t.step("fs_tree lists an absolute directory and skips bak", async () => {
    const spoken = await invoke(armed, "fs_tree", { path: root });
    assert(spoken.output.message.includes("dataset/"));
    assert(spoken.output.message.includes("readme.md"));
    assert(!spoken.output.message.includes("bak"));
  });

  await t.step("fs_find matches by name and answers absolute paths", async () => {
    const spoken = await invoke(armed, "fs_find", { path: root, pattern: "\\.json$" });
    assertEquals(spoken.output.files, [`${root}/dataset/rows.json`]);
  });

  await t.step("fs_read slices by range", async () => {
    const spoken = await invoke(armed, "fs_read", {
      path: `${root}/readme.md`,
      range: { from: 2, to: 2 },
    });
    assertEquals(spoken.output.message, "line two");
  });

  await t.step("fs_read of an empty file says so", async () => {
    const spoken = await invoke(armed, "fs_read", { path: `${root}/empty.txt` });
    assertEquals(spoken.output.message, "(empty)");
  });

  await t.step("a relative path is refused, naming where the places are", async () => {
    for (const [name, input] of [
      ["fs_read", { path: "readme.md" }],
      ["fs_tree", { path: "." }],
      ["fs_move", { from: `${root}/readme.md`, to: "moved/readme.md" }],
      ["shell_run", { command: "ls", cwd: "dataset" }],
    ]) {
      let thrown = null;
      try {
        await invoke(armed, name, input);
      } catch (fault) {
        thrown = fault;
      }
      assert(thrown, `expected ${name} to throw`);
      assert(thrown.message.includes("not absolute"), thrown.message);
      assert(thrown.message.includes("mode_find"), thrown.message);
    }
  });

  await t.step("fs_write creates parents and reports bytes", async () => {
    const spoken = await invoke(armed, "fs_write", {
      path: `${root}/deep/nested/note.txt`,
      content: "hello",
    });
    assert(spoken.output.message.includes("5 bytes"));
    assertEquals(await Deno.readTextFile(`${root}/deep/nested/note.txt`), "hello");
  });

  await t.step("fs_stat describes a file", async () => {
    const spoken = await invoke(armed, "fs_stat", { path: `${root}/readme.md` });
    assertEquals(spoken.output.format, "md");
    assertEquals(spoken.output.directory, false);
    assert(spoken.output.bytes > 0);
  });

  await t.step("fs_move renames and creates the parent", async () => {
    await invoke(armed, "fs_move", { from: `${root}/deep/nested/note.txt`, to: `${root}/moved/note.txt` });
    assertEquals(await Deno.readTextFile(`${root}/moved/note.txt`), "hello");
  });

  await t.step("fs_delete removes a file and refuses a directory", async () => {
    await invoke(armed, "fs_delete", { path: `${root}/moved/note.txt` });
    assertEquals(await Deno.stat(`${root}/moved/note.txt`).catch(() => null), null);
    const refused = await invoke(armed, "fs_delete", { path: `${root}/dataset` });
    assertEquals(refused.condition, "ERROR");
  });

  await t.step("fs_tree skips the house list when nothing is bound, files included", async () => {
    await Deno.writeTextFile(`${root}/.DS_Store`, "");
    const spoken = await invoke(armed, "fs_tree", { path: root });
    assert(!spoken.output.message.includes(".DS_Store"));
  });

  await t.step("shell_run runs in the given cwd, returns the tail and exit code, nonzero stays NOMINAL", async () => {
    const ok = await invoke(armed, "shell_run", { command: "ls", cwd: `${root}/dataset` });
    assertEquals(ok.output.message, "rows.json");
    assertEquals(ok.output.code, 0);

    const nonzero = await invoke(armed, "shell_run", { command: "exit 3", cwd: root });
    assertEquals(nonzero.output.code, 3);
    assertEquals(nonzero.condition, undefined);
  });

  await Deno.remove(root, { recursive: true });
});
