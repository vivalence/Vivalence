import { specimen } from "@vivalence/typology";
import {
  turnText,
  turnThinking,
  turnTools,
  turnArtifacts,
  toolResults,
  isToolTurn,
  toolCensus,
  toolChannels,
  toolBuffers,
  toolDigest,
  toolPreview,
  turnClipboard,
  entityRows,
  bufferLabel,
  scalarPairs,
  strengthBand,
  turnCensus,
  turnUsage,
  sessionUsage,
  tokens,
  turnManifest,
  turnVerdict,
  enrich,
  exchanges,
  callRoster,
  manifest,
  project,
  dayLabel,
} from "../src/app/panels/a/widgets/turns.js";

specimen.describe("turnVerdict", () => {
  specimen.it("is null for a complete answer, a tool round, a user turn and a turn with no meta", () => {
    specimen.expect(turnVerdict({ role: "assistant", parts: [{ type: "text", text: "hi" }], meta: { state: "complete" } })).toBe(null);
    specimen.expect(turnVerdict({ role: "assistant", parts: [{ type: "tool_use", name: "x" }], meta: { state: "tools" } })).toBe(null);
    specimen.expect(turnVerdict({ role: "user", parts: [], meta: { state: "length" } })).toBe(null);
    specimen.expect(turnVerdict({ role: "assistant", parts: [] })).toBe(null);
  });

  specimen.it("names the close that left nothing to read — length, filter, abort, error with the fault's message", () => {
    specimen.expect(turnVerdict({ role: "assistant", parts: [], meta: { state: "length", provider: { finish_reason: "length", model: "openai/gpt-5.1" } } }))
      .toEqual({ state: "length", message: "the model returned nothing — its output limit was hit before a word (openai/gpt-5.1)" });
    specimen.expect(turnVerdict({ role: "assistant", parts: [], meta: { state: "filter" } })).toEqual({ state: "filter", message: "the answer was filtered by the provider" });
    specimen.expect(turnVerdict({ role: "assistant", parts: [], meta: { state: "abort" } })).toEqual({ state: "abort", message: "stopped" });
    specimen.expect(turnVerdict({ role: "assistant", parts: [], meta: { state: "error", fault: { kind: "request", message: "401 invalid key" } } }))
      .toEqual({ state: "error", message: "401 invalid key" });
  });

  specimen.it("a length close that still said something is NOT a verdict — the text is the answer", () => {
    specimen.expect(turnVerdict({ role: "assistant", parts: [{ type: "text", text: "half an ans" }], meta: { state: "length" } })).toBe(null);
  });
});

specimen.describe("turnText", () => {
  specimen.it("joins text parts and ignores non-text", () => {
    const turn = {
      parts: [
        { type: "text", text: "hello " },
        { type: "tool_use", name: "x" },
        { type: "text", text: "world" },
      ],
    };
    specimen.expect(turnText(turn)).toBe("hello world");
  });

  specimen.it("is empty for missing parts", () => {
    specimen.expect(turnText(null)).toBe("");
    specimen.expect(turnText({})).toBe("");
  });
});

specimen.describe("turnTools pairing", () => {
  specimen.it("pairs a use with its matching result as ok", () => {
    const turn = {
      parts: [
        { type: "tool_use", id: "t1", name: "entities.thread.create", input: { a: 1 } },
        { type: "tool_result", tool_use_id: "t1", output: { ok: true } },
      ],
    };
    const tools = turnTools(turn);
    specimen.expect(tools.length).toBe(1);
    specimen.expect(tools[0].name).toBe("entities.thread.create");
    specimen.expect(tools[0].status).toBe("ok");
    specimen.expect(JSON.stringify(tools[0].input)).toBe(JSON.stringify({ a: 1 }));
    specimen.expect(JSON.stringify(tools[0].output)).toBe(JSON.stringify({ ok: true }));
  });

  specimen.it("marks a result carrying an error output", () => {
    const turn = {
      parts: [
        { type: "tool_use", id: "t1", name: "x" },
        { type: "tool_result", tool_use_id: "t1", condition: "ERROR", output: { message: "boom" } },
      ],
    };
    specimen.expect(turnTools(turn)[0].status).toBe("error");
  });

  specimen.it("an unmatched use is running and still shows its input", () => {
    const turn = { parts: [{ type: "tool_use", id: "t1", name: "x", input: { q: 2 } }] };
    const tool = turnTools(turn)[0];
    specimen.expect(tool.status).toBe("running");
    specimen.expect(tool.output).toBe(null);
    specimen.expect(JSON.stringify(tool.input)).toBe(JSON.stringify({ q: 2 }));
  });

  specimen.it("maps standalone results with their own status", () => {
    const turn = { parts: [{ type: "tool_result", name: "r1", output: 5 }] };
    const tools = turnTools(turn);
    specimen.expect(tools.length).toBe(1);
    specimen.expect(tools[0].status).toBe("ok");
    specimen.expect(tools[0].output).toBe(5);
  });

  specimen.it("matches a result by id when tool_use_id is absent", () => {
    const turn = {
      parts: [
        { type: "tool_use", id: "t9", name: "y" },
        { type: "tool_result", id: "t9", output: "done" },
      ],
    };
    specimen.expect(turnTools(turn)[0].status).toBe("ok");
  });

  specimen.it("is empty for missing parts", () => {
    specimen.expect(turnTools({}).length).toBe(0);
  });
});

specimen.describe("tool results across turns", () => {
  const assistant = {
    role: "assistant",
    parts: [
      { type: "text", text: "Ciao!" },
      { type: "tool_use", id: "u1", name: "pull", input: { ask: "due", limit: 20 } },
    ],
  };
  const tooling = {
    role: "user",
    parts: [{ type: "tool_result", id: "u1", output: { message: "due list", literal: [1, 2] } }],
  };

  specimen.it("names and settles a use whose result arrives in the following turn", () => {
    const tools = turnTools(assistant, toolResults([assistant, tooling]));
    specimen.expect(tools[0].name).toBe("pull");
    specimen.expect(tools[0].status).toBe("ok");
    specimen.expect(tools[0].output).toBe("due list");
    specimen.expect(tools[0].entities.literal.length).toBe(2);
  });

  specimen.it("recognises the synthetic tool-result turn so the log can drop it", () => {
    specimen.expect(isToolTurn(tooling)).toBe(true);
    specimen.expect(isToolTurn(assistant)).toBe(false);
    specimen.expect(isToolTurn({ parts: [] })).toBe(false);
  });
});

specimen.describe("toolCensus", () => {
  specimen.it("counts each entity bucket by its type key", () => {
    const census = toolCensus({ literal: [1, 2, 3], retention: [], buffer: [9] });
    specimen.expect(census.length).toBe(2);
    specimen.expect(census[0].type).toBe("literal");
    specimen.expect(census[0].count).toBe(3);
    specimen.expect(census[1].type).toBe("buffer");
  });

  specimen.it("is empty when a tool yields no entities", () => {
    specimen.expect(toolCensus(null).length).toBe(0);
    specimen.expect(toolCensus({}).length).toBe(0);
  });
});

specimen.describe("toolDigest", () => {
  specimen.it("summarises scalar input on one line", () => {
    specimen.expect(toolDigest({ ask: "due", limit: 20 })).toBe("ask due · limit 20");
  });

  specimen.it("elides nested values and is empty for no input", () => {
    specimen.expect(toolDigest({ where: { symbols: ["word"] } })).toBe("where …");
    specimen.expect(toolDigest(null)).toBe("");
  });
});

specimen.describe("toolPreview", () => {
  specimen.it("names the keys of an object and counts an array", () => {
    specimen.expect(toolPreview({ slugs: [], ask: "due" })).toBe("{ slugs · ask }");
    specimen.expect(toolPreview([1, 2, 3])).toBe("[ 3 ]");
    specimen.expect(toolPreview(null)).toBe("—");
  });
});

specimen.describe("turnClipboard", () => {
  const turn = { role: "assistant", parts: [{ type: "text", text: "Ciao! Let's start." }] };

  specimen.it("emits a JSON record, never prose", () => {
    const copy = turnClipboard(turn, [
      { name: "pull", input: { ask: "due" }, output: "casa · house", status: "ok", entities: { literal: [{ slug: "casa" }] } },
    ]);
    const record = JSON.parse(copy);
    specimen.expect(record.role).toBe("assistant");
    specimen.expect(record.text).toBe("Ciao! Let's start.");
    specimen.expect(record.tools[0].name).toBe("pull");
    specimen.expect(record.tools[0].input.ask).toBe("due");
    specimen.expect(record.tools[0].status).toBe("ok");
    specimen.expect(record.tools[0].entities.literal[0].slug).toBe("casa");
  });

  specimen.it("omits absent channels rather than emitting nulls", () => {
    const record = JSON.parse(turnClipboard({ role: "assistant", parts: [] }, [
      { name: "drill", input: null, output: null, status: "running" },
    ]));
    specimen.expect(record.text).toBe(undefined);
    specimen.expect(record.tools[0].status).toBe("running");
    specimen.expect("output" in record.tools[0]).toBe(false);
    specimen.expect("entities" in record.tools[0]).toBe(false);
  });

  specimen.it("carries thinking when the turn had any", () => {
    const record = JSON.parse(turnClipboard({
      role: "assistant",
      parts: [{ type: "thinking", text: "ambush from the weak set" }],
    }, []));
    specimen.expect(record.thinking).toBe("ambush from the weak set");
    specimen.expect("tools" in record).toBe(false);
  });
});

specimen.describe("turnArtifacts", () => {
  specimen.it("keeps only media, file, and artifact parts", () => {
    const turn = {
      parts: [
        { type: "text", text: "hi" },
        { type: "image", source: {} },
        { type: "audio", url: "a" },
        { type: "file", name: "deck.json" },
        { type: "artifact" },
        { type: "tool_use" },
      ],
    };
    specimen.expect(turnArtifacts(turn).length).toBe(4);
  });
});

specimen.describe("turnThinking", () => {
  specimen.it("joins thinking parts and ignores everything else", () => {
    const turn = {
      parts: [
        { type: "thinking", text: "weigh the due list" },
        { type: "text", text: "Ciao!" },
        { type: "thinking", text: "ambush instead" },
      ],
    };
    specimen.expect(turnThinking(turn)).toBe("weigh the due list\n\nambush instead");
    specimen.expect(turnThinking({ parts: [{ type: "text", text: "hi" }] })).toBe("");
  });
});

specimen.describe("toolChannels", () => {
  const tool = {
    input: { ask: "due", limit: 20 },
    entities: { literal: [{ slug: "casa" }, { slug: "che" }], buffer: [{ id: "b1" }] },
    object: { slugs: ["casa"] },
  };

  specimen.it("opens one channel per entity key, between input and object", () => {
    const channels = toolChannels(tool);
    specimen.expect(channels.map((channel) => channel.key).join(",")).toBe(
      "input,literal,buffer,object",
    );
    specimen.expect(channels[1].summary).toBe("×2");
    specimen.expect(channels[0].summary).toBe("{ ask · limit }");
  });

  specimen.it("gives entity channels rows and leaves payload channels raw", () => {
    const channels = toolChannels(tool);
    specimen.expect(channels[1].rows.length).toBe(2);
    specimen.expect(channels[0].rows).toBe(null);
    specimen.expect(channels[3].rows).toBe(null);
  });

  specimen.it("is empty for a tool that yielded nothing", () => {
    specimen.expect(toolChannels({}).length).toBe(0);
    specimen.expect(toolChannels(null).length).toBe(0);
  });
});

specimen.describe("entityRows", () => {
  specimen.it("projects a literal down to term, kind and both translated faces", () => {
    const rows = entityRows("literal", [
      { id: "1", slug: "casa", ontology: "word", strength: 0.4, trait: { TRANSLATED: { known: "house", learning: "casa" } } },
    ]);
    specimen.expect(rows[0].term).toBe("casa");
    specimen.expect(rows[0].kind).toBe("word");
    specimen.expect(rows[0].gloss).toBe("house · casa");
    specimen.expect(rows[0].strength).toBe(0.4);
    specimen.expect(rows[0].band).toBe("weak");
    specimen.expect(rows[0].fill).toBe(0.4);
    specimen.expect(rows[0].launchable).toBe(false);
  });

  specimen.it("marks buffer rows launchable and never shows a raw id as the term", () => {
    const rows = entityRows("buffer", [{ id: "b1", index: 2 }]);
    specimen.expect(rows[0].launchable).toBe(true);
    specimen.expect(rows[0].term).toBe("buffer 2");
    specimen.expect(rows[0].kind).toBe("buffer");
    specimen.expect(rows[0].id).toBe("b1");
  });

  specimen.it("bands a buffer runnable at a full track — runnable is not a strength", () => {
    const rows = entityRows("buffer", [{ id: "b1", index: 0 }]);
    specimen.expect(rows[0].band).toBe("runnable");
    specimen.expect(rows[0].fill).toBe(1);
    specimen.expect(rows[0].strength).toBe(null);
  });

  specimen.it("labels a buffer by its LABELED name, then its index — never its data or mode", () => {
    specimen.expect(bufferLabel({ trait: { LABELED: { name: "cold ambush" } }, data: { title: "no" }, mode: "impara" })).toBe("cold ambush");
    specimen.expect(bufferLabel({ data: { title: "no" }, mode: { slug: "impara" }, index: 0 })).toBe("buffer 0");
    specimen.expect(bufferLabel({ mode: "vocabolario", index: 2 })).toBe("buffer 2");
    specimen.expect(bufferLabel({ id: "b1" })).toBe("buffer");
  });

  specimen.it("refuses to project scalars", () => {
    specimen.expect(entityRows("literal", ["casa"])).toBe(null);
    specimen.expect(entityRows("literal", [])).toBe(null);
    specimen.expect(entityRows("literal", 4)).toBe(null);
  });
});

specimen.describe("toolBuffers", () => {
  specimen.it("gathers every buffer across a turn's tools", () => {
    const buffers = toolBuffers([
      { entities: { buffer: [{ id: "b1" }], literal: [{ slug: "casa" }] } },
      { entities: null },
      { entities: { buffer: [{ id: "b2" }] } },
    ]);
    specimen.expect(buffers.length).toBe(2);
    specimen.expect(buffers[1].id).toBe("b2");
    specimen.expect(toolBuffers(null).length).toBe(0);
  });

  specimen.it("names a buffer once when render, revise and list all return it — the chips are keyed by id, the newest row wins", () => {
    const buffers = toolBuffers([
      { entities: { buffer: [{ id: "b1", label: { name: "draft" } }] } },
      { entities: { buffer: [{ id: "b1", label: { name: "final" } }] } },
      { entities: { buffer: [{ id: "b2" }, { id: "b1", label: { name: "final" } }] } },
    ]);
    specimen.expect(buffers.map((buffer) => buffer.id)).toEqual(["b1", "b2"]);
    specimen.expect(buffers[0].label.name).toBe("final");
  });
});

specimen.describe("usage", () => {
  specimen.it("reads either provider spelling and stays null when absent", () => {
    specimen.expect(turnUsage({ meta: { usage: { input_tokens: 38000, output_tokens: 3100 } } }).input).toBe(38000);
    specimen.expect(turnUsage({ meta: { usage: { prompt_tokens: 12, completion_tokens: 4 } } }).output).toBe(4);
    specimen.expect(turnUsage({ meta: {} })).toBe(null);
    specimen.expect(turnUsage({ meta: { usage: {} } })).toBe(null);
  });

  specimen.it("sums a session and reports whether anything was seen", () => {
    const spend = sessionUsage([
      { meta: { usage: { input_tokens: 100, output_tokens: 10 } } },
      { meta: {} },
      { meta: { usage: { input_tokens: 50, output_tokens: 5 } } },
    ]);
    specimen.expect(spend.input).toBe(150);
    specimen.expect(spend.output).toBe(15);
    specimen.expect(spend.seen).toBe(true);
    specimen.expect(sessionUsage([{ meta: {} }]).seen).toBe(false);
  });

  specimen.it("abbreviates thousands", () => {
    specimen.expect(tokens(38200)).toBe("38.2k");
    specimen.expect(tokens(940)).toBe("940");
  });
});

specimen.describe("turnManifest", () => {
  specimen.it("counts part types and only pluralises what repeats", () => {
    const manifest = turnManifest({
      parts: [
        { type: "text" },
        { type: "tool_use" },
        { type: "tool_use" },
        { type: "thinking" },
      ],
    });
    specimen.expect(manifest.join(" · ")).toBe("text · tool_use ×2 · thinking");
    specimen.expect(turnManifest({}).length).toBe(0);
  });
});

specimen.describe("scalarPairs", () => {
  specimen.it("aligns a flat input record instead of handing it to a tree", () => {
    const pairs = scalarPairs({ ask: "due", limit: 20, deep: undefined });
    specimen.expect(pairs.length).toBe(3);
    specimen.expect(pairs[0].key).toBe("ask");
    specimen.expect(pairs[1].value).toBe("20");
  });

  specimen.it("refuses anything nested, empty, or not a record", () => {
    specimen.expect(scalarPairs({ where: { symbols: ["word"] } })).toBe(null);
    specimen.expect(scalarPairs([1, 2])).toBe(null);
    specimen.expect(scalarPairs({})).toBe(null);
    specimen.expect(scalarPairs("due")).toBe(null);
  });

  specimen.it("keeps null visible rather than dropping the key", () => {
    specimen.expect(scalarPairs({ thread: null })[0].value).toBe("null");
  });
});

specimen.describe("strengthBand", () => {
  specimen.it("bands the retention curve into three", () => {
    specimen.expect(strengthBand(0.9)).toBe("strong");
    specimen.expect(strengthBand(0.66)).toBe("strong");
    specimen.expect(strengthBand(0.4)).toBe("weak");
    specimen.expect(strengthBand(0.25)).toBe("weak");
    specimen.expect(strengthBand(0)).toBe("unknown");
    specimen.expect(strengthBand(undefined)).toBe(null);
  });
});

specimen.describe("turnCensus", () => {
  specimen.it("sums each entity type across every call in the turn", () => {
    const census = turnCensus([
      { census: [{ type: "literal", count: 14 }] },
      { census: [{ type: "literal", count: 6 }, { type: "buffer", count: 1 }] },
    ]);
    specimen.expect(census.length).toBe(2);
    specimen.expect(census[0].type).toBe("literal");
    specimen.expect(census[0].count).toBe(20);
    specimen.expect(census[1].count).toBe(1);
  });

  specimen.it("falls back to the raw entities bag and is empty for no tools", () => {
    specimen.expect(turnCensus([{ entities: { engram: [1, 2] } }])[0].count).toBe(2);
    specimen.expect(turnCensus([]).length).toBe(0);
    specimen.expect(turnCensus(null).length).toBe(0);
  });
});

specimen.describe("the session's folds — one projection for the dock and the harness pane", () => {
  const NOW = new Date("2026-03-04T12:00:00");
  const THREAD = [
    { id: "u1", role: "user", createdAt: "2026-03-03T09:15:00", parts: [{ type: "text", text: "what is due?" }] },
    {
      id: "a1",
      role: "assistant",
      createdAt: "2026-03-03T09:15:04",
      parts: [{ type: "thinking", text: "look at the queue" }, { type: "tool_use", id: "call-1", name: "queue_due", input: { limit: 3 } }],
      meta: { state: "tools" },
    },
    { id: "r1", role: "user", createdAt: "2026-03-03T09:15:05", parts: [{ type: "tool_result", tool_use_id: "call-1", content: "three" }] },
    { id: "a2", role: "assistant", createdAt: "2026-03-04T10:30:00", parts: [{ type: "text", text: "three cards are due." }], meta: { state: "complete" } },
  ];
  const held = Object.freeze(structuredClone(THREAD));

  specimen.it("rules a day before its first turn and drops the tool round", () => {
    const items = enrich(THREAD, NOW);
    specimen.expect(items.map((item) => item.kind)).toEqual(["divider", "turn", "turn", "divider", "turn"]);
    specimen.expect(items.filter((item) => item.kind === "divider").map((item) => item.label)).toEqual(["yesterday", "today"]);
    specimen.expect(items.filter((item) => item.kind === "turn").map((item) => item.turn.id)).toEqual(["u1", "a1", "a2"]);
  });

  specimen.it("joins two assistant turns that follow each other into one item", () => {
    const together = THREAD.map((turn) => (turn.id === "a2" ? { ...turn, createdAt: "2026-03-03T09:15:09" } : turn));
    const items = enrich(together, NOW).filter((item) => item.kind === "turn");
    specimen.expect(items.map((item) => item.turn.id)).toEqual(["u1", "a1"]);
    specimen.expect(items[1].text).toBe("three cards are due.");
    specimen.expect(items[1].tools.map((tool) => tool.name)).toEqual(["queue_due"]);
    specimen.expect(items[1].think).toBe("look at the queue");
  });

  specimen.it("an item is the turn's projection", () => {
    const [, asked] = enrich(THREAD, NOW);
    const { kind: _kind, turn: _turn, date: _date, ...projected } = asked;
    specimen.expect(projected).toEqual(project(THREAD[0], []));
  });

  specimen.it("exchanges are the turns that called a tool or thought; the roster names each tool once", () => {
    const calls = exchanges(enrich(THREAD, NOW));
    specimen.expect(calls.map((item) => item.turn.id)).toEqual(["a1"]);
    specimen.expect(callRoster(calls)).toEqual(["queue_due"]);
    specimen.expect(callRoster([...calls, ...calls])).toEqual(["queue_due"]);
  });

  specimen.it("the manifest names who spoke, when, and in what parts", () => {
    specimen.expect(manifest(enrich(THREAD, NOW), "dealer")).toEqual([
      { id: "u1", who: "you", time: "09:15", parts: "text" },
      { id: "a1", who: "dealer", time: "09:15", parts: "thinking · tool_use" },
      { id: "a2", who: "dealer", time: "10:30", parts: "text" },
    ]);
    specimen.expect(manifest(enrich(THREAD, NOW))[1].who).toBe("agent");
  });

  specimen.it("an empty thread folds to nothing", () => {
    specimen.expect(enrich([], NOW)).toEqual([]);
    specimen.expect(exchanges([])).toEqual([]);
    specimen.expect(manifest([])).toEqual([]);
  });

  specimen.it("a day older than yesterday is named by its date", () => {
    specimen.expect(dayLabel(new Date("2026-02-20T08:00:00"), NOW)).not.toBe("today");
    specimen.expect(dayLabel(new Date("2026-02-20T08:00:00"), NOW)).not.toBe("yesterday");
    specimen.expect(dayLabel(null, NOW)).toBe("");
  });

  specimen.it("the source is not mutated", () => {
    enrich(THREAD, NOW);
    specimen.expect(THREAD).toEqual(held);
  });
});
