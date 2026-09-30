import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import { Terminal } from "../../src/typology/entities/terminal.js";
import { ModeTraits } from "../../src/typology/entities/mode/index.js";

const { describe, it, expect } = specimen;

const entry = { id: "m1", slug: "dojo" };

const row = (fields) => ({ ...fields, on: { release: () => {} } });

const thread = (id, buffers, create) => {
  const minted = [];
  const $buffers = atom(buffers.map(row));
  const merge = (fields) => {
    const buffer = row(fields);
    $buffers.set([...$buffers.get(), buffer]);
    return buffer;
  };
  return {
    id,
    minted,
    $buffers,
    $phase: atom("manual"),
    daemon: {
      entities: {
        buffer: {
          create: (data) => {
            minted.push(data);
            const fields = { id: `b${minted.length}`, ...data };
            return (create ? create(fields) : Promise.resolve(fields)).then(merge);
          },
        },
      },
    },
  };
};

const seated = (held) => {
  const terminal = Terminal({ id: "x" });
  terminal.thread = held;
  return terminal;
};

describe("an entrypoint mode opens its buffer when it is set", () => {
  it("a thread with no buffer on the mode mints one and the terminal shows it", async () => {
    const held = thread("t1", []);
    const terminal = seated(held);
    await ModeTraits.standalone.open(terminal, entry);
    expect(held.minted).toEqual([{ mode: "m1", thread: "t1", data: {} }]);
    expect(terminal.buffer).toBe(held.$buffers.get()[0]);
    expect(terminal.buffer.id).toBe("b1");
  });

  it("a thread that already holds buffers on the mode reopens its last one and mints none", async () => {
    const held = thread("t1", [
      { id: "b1", mode: "m1", index: 0 },
      { id: "b2", mode: { id: "m1" }, index: 2 },
      { id: "b3", mode: "m2", index: 5 },
    ]);
    const terminal = seated(held);
    await ModeTraits.standalone.open(terminal, entry);
    expect(held.minted).toEqual([]);
    expect(terminal.buffer.id).toBe("b2");
  });

  it("a terminal moved to another thread while the mint is in flight keeps that thread's screen", async () => {
    let settle;
    const held = thread("t1", [], (fields) => new Promise((resolve) => (settle = () => resolve(fields))));
    const terminal = seated(held);
    const opening = ModeTraits.standalone.open(terminal, entry);
    terminal.thread = thread("t2", []);
    settle();
    await opening;
    expect(terminal.buffer).toBe(null);
  });
});
