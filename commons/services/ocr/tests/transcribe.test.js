import { shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { tools } from "../tools/index.js";

const { describe, it, expect } = specimen;

const MOUNT = new URL("./fixtures/one-word.png", import.meta.url).pathname;

const rig = (mime) => {
  const asked = [];
  const service = async function* (source, settings) {
    asked.push({ source, settings });
    yield { text: "Tide Tables", words: [{ word: "Tide" }, { word: "Tables" }] };
    yield { text: "The tide rises twice a day.", words: [{ word: "The" }] };
  };
  const entities = { file: { findOneOrFail: async ({ id }) => ({ id, mime, mount: MOUNT }) } };
  const armed = new Vector()
    .use(shard.context.bind("service", service))
    .use(shard.context.bind("entities", entities))
    .graft(tools);
  const invoke = (input) => steer.dispatch.invoke(armed, new ToolCall("transcribe").signal, steer.strategy.guarded)(input);
  return { asked, invoke };
};

describe("ocr transcribe — the tool over the service", () => {
  it("answers the text, the blocks joined in order", async () => {
    const { invoke } = rig("image/png");
    const spoken = await invoke({ file: "01a1b1c0-e5fa-776b-b1aa-1ec226521760" });
    expect(spoken.product.message).toBe("Tide Tables The tide rises twice a day.");
  });

  it("hands the service an image part holding the file's bytes", async () => {
    const { asked, invoke } = rig("image/png");
    await invoke({ file: "01a1b1c0-e5fa-776b-b1aa-1ec226521760" });
    expect(asked[0].source.type).toBe("image");
    expect(asked[0].source.media).toBe("image/png");
    expect(asked[0].source.data.startsWith("iVBORw0KGgo")).toBe(true);
    expect(asked[0].settings).toEqual({});
  });

  it("hands a pdf over as a document part, a language as a setting", async () => {
    const { asked, invoke } = rig("application/pdf");
    await invoke({ file: "01a1b1c0-e5fa-776b-b1aa-1ec226521760", language: "ita" });
    expect(asked[0].source.type).toBe("document");
    expect(asked[0].settings).toEqual({ language: "ita" });
  });
});
