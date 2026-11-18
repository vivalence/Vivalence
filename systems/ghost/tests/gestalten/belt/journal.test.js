import { specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const caller = {
  id: "01a1eeb9-7cdd-73bd-9953-0b7af9f75121",
  role: "assistant",
  parts: [
    { type: "tool_use", id: "toolu_provision", name: "provision", input: { count: 2 } },
    { type: "tool_use", id: "toolu_queue", name: "queue", input: {} },
    { type: "tool_use", id: "toolu_failed", name: "provision", input: {} },
    { type: "tool_use", id: "toolu_running", name: "provision", input: {} },
  ],
};

const answer = {
  id: "01a1eeb9-8414-732d-8670-fa592dc4cb56",
  role: "user",
  parts: [
    {
      type: "tool_result",
      id: "toolu_provision",
      condition: "NOMINAL",
      product: { message: "rep session on screen — 1 knowable, TYPE, single pass.", buffer: [{ id: "01a1eeb9-8403-720c-b7d9-109510c8fc24", status: "PENDING" }] },
    },
    { type: "tool_result", id: "toolu_queue", condition: "NOMINAL", product: { literal: [{ id: "de.adposition" }] } },
    { type: "tool_result", id: "toolu_failed", condition: "ERROR", product: "dojo is not mounted" },
  ],
};

const elsewhere = {
  id: "01a1eec1-911f-72aa-bd73-1a3369c75f59",
  role: "assistant",
  parts: [{ type: "text", text: "no tools here" }],
};

const buffers = [
  { id: "01a1eeb9-8403-720c-b7d9-109510c8fc24", turns: [] },
  { id: "01a1d570-6e78-723d-bc61-511c20784646", turns: [] },
];

specimen.describe("belt.journal.files — a turn shows the files it carries as parts and the files its own tool calls yielded", () => {
  const known = [{ id: "f-dropped" }, { id: "f-painted" }, { id: "f-elsewhere" }];
  const dropping = { id: "t-dropping", role: "user", parts: [{ type: "text", text: "look" }, { type: "file", file: "f-dropped" }] };
  const painting = { id: "t-painting", role: "assistant", parts: [{ type: "tool_use", id: "toolu_paint", name: "paint", input: {} }] };
  const painted = { id: "t-painted", role: "user", parts: [{ type: "tool_result", id: "toolu_paint", condition: "NOMINAL", product: { file: [{ id: "f-painted" }] } }] };
  const yields = ghost.belt.journal.yields([dropping, painting, painted]);

  specimen.it("a file part is the turn's file; a yielded file is its calling turn's; a file nobody names is no turn's", () => {
    specimen.expect(ghost.belt.journal.files(dropping, known, yields)).toEqual([known[0]]);
    specimen.expect(ghost.belt.journal.files(painting, known, yields)).toEqual([known[1]]);
    specimen.expect(ghost.belt.journal.files(painted, known, yields)).toEqual([]);
  });

  specimen.it("a named file the store does not hold yet shows nothing; a yield of buffers alone names no file", () => {
    specimen.expect(ghost.belt.journal.files(dropping, known.slice(1), yields)).toEqual([]);
    specimen.expect(ghost.belt.journal.files(caller, known, ghost.belt.journal.yields([caller, answer]))).toEqual([]);
  });
});

specimen.describe("belt.journal.cells — a turn shows the buffers its own tool calls yielded, read off the results, never buffer.turns", () => {
  const yields = ghost.belt.journal.yields([caller, answer, elsewhere]);

  specimen.it("yields are every tool_result part, in turn order", () => {
    specimen.expect(yields.map((part) => part.id)).toEqual(answer.parts.map((part) => part.id));
  });

  specimen.it("the calling turn holds the yielded buffer although the buffer carries no turn link", () => {
    specimen.expect(ghost.belt.journal.cells(caller, buffers, yields)).toEqual([buffers[0]]);
  });

  specimen.it("a product without buffer, a string product and a call still running yield nothing", () => {
    const quiet = { ...caller, parts: caller.parts.slice(1) };
    specimen.expect(ghost.belt.journal.cells(quiet, buffers, yields)).toEqual([]);
  });

  specimen.it("a turn without tool calls holds no buffer; a yielded id the thread no longer lists shows nothing", () => {
    specimen.expect(ghost.belt.journal.cells(elsewhere, buffers, yields)).toEqual([]);
    specimen.expect(ghost.belt.journal.cells(caller, buffers.slice(1), yields)).toEqual([]);
  });
});

specimen.describe("belt.journal.retain — an entry whose source and row did not change IS the prior entry", () => {
  const said = { id: "01a1eec1-911f-72aa-bd73-1a3369c75f60", role: "user", parts: [{ type: "text", text: "ciao" }] };
  const record = { at: 3, track: "log", data: "hello" };
  const entries = (text) => [
    { at: 1, turn: said, turns: [said], row: { kind: "you", text: said.parts[0].text, segments: null } },
    { at: 2, turn: elsewhere, turns: [elsewhere], row: { kind: "agent", text, segments: [{ type: "text", items: [text] }] } },
    { at: 3, record, row: { kind: "trace", text: record.data, blocks: [] } },
  ];

  specimen.it("a rerun over unchanged sources returns the prior list itself", () => {
    const prior = ghost.belt.journal.retain([], entries("bene"));
    specimen.expect(ghost.belt.journal.retain(prior, entries("bene"))).toBe(prior);
  });

  specimen.it("a changed row is a new entry; every other entry keeps its identity", () => {
    const prior = ghost.belt.journal.retain([], entries("bene"));
    const next = ghost.belt.journal.retain(prior, entries("bene, grazie"));
    specimen.expect(next.map((entry, index) => entry === prior[index])).toEqual([true, false, true]);
    specimen.expect(next[1].row.text).toBe("bene, grazie");
  });

  specimen.it("a turn mutated in place under the same identity is still seen: the row is compared, never the turn alone", () => {
    const prior = ghost.belt.journal.retain([], entries("bene"));
    said.parts = [{ type: "text", text: "ciao, come stai?" }];
    const next = ghost.belt.journal.retain(prior, entries("bene"));
    specimen.expect(next.map((entry, index) => entry === prior[index])).toEqual([false, true, true]);
  });

  specimen.it("an appended entry leaves the prior ones as they were; the prior list is not mutated", () => {
    const prior = ghost.belt.journal.retain([], entries("bene"));
    const frozen = [...prior];
    const late = { at: 4, record: { at: 4, track: "log", data: "later" }, row: { kind: "trace", text: "later", blocks: [] } };
    const next = ghost.belt.journal.retain(prior, [...entries("bene"), late]);
    specimen.expect(next.slice(0, 3).every((entry, index) => entry === prior[index])).toBe(true);
    specimen.expect(next[3]).toBe(late);
    specimen.expect(prior).toEqual(frozen);
  });
});
