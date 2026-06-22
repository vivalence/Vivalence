import { specimen } from "@vivalence/typology";
import { turnText, turnTools, turnArtifacts } from "../src/app/panels/a/widgets/turns.js";

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
    specimen.expect(JSON.stringify(tools[0].body)).toBe(JSON.stringify({ ok: true }));
  });

  specimen.it("marks error results", () => {
    const turn = {
      parts: [
        { type: "tool_use", id: "t1", name: "x" },
        { type: "tool_result", tool_use_id: "t1", is_error: true, content: "boom" },
      ],
    };
    specimen.expect(turnTools(turn)[0].status).toBe("error");
  });

  specimen.it("an unmatched use is running and falls back to its input", () => {
    const turn = { parts: [{ type: "tool_use", id: "t1", name: "x", input: { q: 2 } }] };
    const tool = turnTools(turn)[0];
    specimen.expect(tool.status).toBe("running");
    specimen.expect(JSON.stringify(tool.body)).toBe(JSON.stringify({ q: 2 }));
  });

  specimen.it("maps standalone results with their own status", () => {
    const turn = { parts: [{ type: "tool_result", name: "r1", output: 5, is_error: false }] };
    const tools = turnTools(turn);
    specimen.expect(tools.length).toBe(1);
    specimen.expect(tools[0].status).toBe("ok");
    specimen.expect(tools[0].body).toBe(5);
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
