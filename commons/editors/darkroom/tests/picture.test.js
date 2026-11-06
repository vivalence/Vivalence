import { decodeBase64 } from "@std/encoding/base64";
import { Cortex, Path, specimen, v } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as darkroom from "../darkroom.viva.js";

const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const seen = [];
const painter = () => ({
  type: "picture",
  id: "scripted-picture",
  tune: [0.5, 0.5, 0.5, 0.5],
  channels: { in: ["text", "image"], out: ["image"] },
  via: {
    render: async (request) => {
      seen.push(request);
      return { images: [{ type: "image", media: "image/png", data: PNG }] };
    },
  },
});

let scenario;
specimen.beforeAll(async () => {
  scenario = await mountMode(darkroom, { cortex: new Cortex().register([painter()]) });
  scenario.mode.mountpoint = new Path(await Deno.makeTempDir({ prefix: "darkroom-" }));
});
specimen.afterAll(async () => {
  await scenario.orm.close();
});

specimen.describe("darkroom — the runtime harness leaf /picture/render, called straight", () => {
  specimen.it("the mode declares one Solid dom view and four traits", () => {
    specimen.expect(darkroom.manifest.traits).toEqual(["VIEWABLE", "HARNESSED", "CONVERSATIONAL", "EXPOSED"]);
    specimen.expect(darkroom.views.map((view) => [view.slug, view.mount])).toEqual([["darkroom", "buffer/Darkroom.jsx"]]);
  });

  specimen.it("/metadata/harness lists the picture leaf; a render answers Picture.Response with the faculty stamped", async () => {
    const metadata = await scenario.authedConn.branch("/mode/editor/darkroom").call("/metadata/harness");
    specimen.expect(Object.keys(metadata.routes.branches.picture.branches)).toEqual(["render"]);
    specimen.expect(Object.keys(metadata.routes.branches.picture.branches.render.effect)).toEqual(["input", "output"]);
    const rendered = await scenario.mode.harness.picture.render({
      thread: scenario.fixtures.thread.id,
      id: "scripted-picture",
      prompt: "a red fox in loose watercolor",
      images: [{ image: { type: "image", media: "image/png", data: PNG }, role: "subject" }],
      settings: { aspect: "3:2", count: 1 },
    });
    specimen.expect([...v.primitives.hallucination.Picture.Response.errors(rendered)]).toEqual([]);
    specimen.expect(rendered.images[0].media).toBe("image/png");
    specimen.expect(rendered.id).toBe("scripted-picture");
    specimen.expect(seen[0].prompt).toBe("a red fox in loose watercolor");
    specimen.expect(seen[0].images).toHaveLength(1);
    specimen.expect(seen[0]).not.toHaveProperty("thread");
    const wired = await scenario.authedConn.branch("/mode/editor/darkroom").call("/harness/picture/render", {
      thread: scenario.fixtures.thread.id,
      id: "scripted-picture",
      prompt: "the same fox, over the wire",
      images: [],
      settings: { aspect: "3:2", count: 1 },
    });
    specimen.expect(wired.images[0].media).toBe("image/png");
    specimen.expect(wired.id).toBe("scripted-picture");
  });

  specimen.it("an unknown faculty id is refused loud", async () => {
    await specimen.expect(scenario.mode.harness.picture.render({ thread: scenario.fixtures.thread.id, id: "nobody", prompt: "x", images: [], settings: {} }))
      .rejects.toThrow(/no 'picture' faculty resolves a 'render' avenue/);
  });
});

specimen.describe("darkroom — the desk aperture writes the buffer; every picture and reference is a File on it", () => {
  const desk = () => scenario.authedConn.branch("/mode/editor/darkroom");
  let buffer;
  let painted;
  let uploaded;

  specimen.beforeAll(async () => {
    buffer = await scenario.mode.buffer({ thread: scenario.fixtures.thread.id });
    await scenario.em.flush();
  });

  specimen.it("a fresh desk is Settings filled: no prompt, nothing shown, iterate on gpt-image-2 at 3:2", () => {
    specimen.expect(buffer.data).toEqual({ prompt: "", next: "iterate", model: "openai/gpt-image-2", aspect: "3:2", count: 1, references: [], pictures: [], shown: null });
  });

  specimen.it("/picture/settle writes the desk's state whole and answers the buffer", async () => {
    const settled = await desk().call("/picture/settle", { buffer: buffer.id, data: { ...buffer.data, prompt: "a heron at dusk", aspect: "2:3", model: "scripted-picture" } });
    specimen.expect(settled.id).toBe(buffer.id);
    specimen.expect(settled.data.model).toBe("scripted-picture");
    specimen.expect(settled.data.prompt).toBe("a heron at dusk");
    specimen.expect(settled.data.aspect).toBe("2:3");
    specimen.expect(settled.files).toEqual([]);
  });

  specimen.it("/picture/hallucinate paints the prompt on the buffer's thread, files the picture under pictures/, shows it, clears the ask", async () => {
    painted = await desk().call("/picture/hallucinate", { buffer: buffer.id });
    specimen.expect(painted.data.pictures).toHaveLength(1);
    specimen.expect(painted.data.pictures[0]).toEqual({ file: painted.files[0].id, prompt: "a heron at dusk", parent: null, references: [], model: "scripted-picture", aspect: "2:3" });
    specimen.expect(painted.data.shown).toBe(painted.files[0].id);
    specimen.expect(painted.data.prompt).toBe("");
    specimen.expect(painted.files[0].mime).toBe("image/png");
    specimen.expect(painted.files[0].path.startsWith("pictures/")).toBe(true);
    specimen.expect((await Deno.readFile(painted.files[0].mount)).length).toBe(painted.files[0].bytes);
    specimen.expect(seen.at(-1).prompt).toBe("a heron at dusk");
    specimen.expect(seen.at(-1).images).toEqual([]);
    specimen.expect(seen.at(-1).settings).toEqual({ aspect: "2:3", count: 1 });
  });

  specimen.it("/picture/upload/:buffer takes raw bytes by their content-type and files them under references/", async () => {
    const bytes = decodeBase64(PNG);
    uploaded = await desk().call(`/picture/upload/${buffer.id}`, {}, { raw: { body: new Blob([bytes]).stream() }, headers: { "content-type": "image/png" } });
    specimen.expect(uploaded.mime).toBe("image/png");
    specimen.expect(uploaded.bytes).toBe(bytes.length);
    specimen.expect(uploaded.path.startsWith("references/")).toBe(true);
    const settled = await desk().call("/picture/settle", { buffer: buffer.id, data: { ...painted.data, prompt: "the heron, bolder", references: [{ file: uploaded.id, role: "style" }] } });
    specimen.expect(settled.files.map((file) => file.id).sort()).toEqual([painted.files[0].id, uploaded.id].sort());
  });

  specimen.it("iterating seeds the shown picture as init, then every reference by role, each read off its File", async () => {
    const iterated = await desk().call("/picture/hallucinate", { buffer: buffer.id });
    specimen.expect(seen.at(-1).images.map((held) => held.role)).toEqual(["init", "style"]);
    specimen.expect(seen.at(-1).images.map((held) => held.image.media)).toEqual(["image/png", "image/png"]);
    specimen.expect(iterated.data.pictures).toHaveLength(2);
    specimen.expect(iterated.data.pictures[1].parent).toBe(painted.files[0].id);
    specimen.expect(iterated.data.pictures[1].references).toEqual([{ file: uploaded.id, role: "style" }]);
    specimen.expect(iterated.data.shown).toBe(iterated.data.pictures[1].file);
  });

  specimen.it("a desk the client minted empty settles into Settings: the route casts, the view primes itself with {}", async () => {
    const minted = await scenario.daemon.entities.buffer.create({ mode: scenario.mode.id, thread: scenario.fixtures.thread.id, data: {} });
    await scenario.em.flush();
    const settled = await desk().call("/picture/settle", { buffer: minted.id, data: {} });
    specimen.expect(settled.data).toEqual({ prompt: "", next: "iterate", model: "openai/gpt-image-2", aspect: "3:2", count: 1, references: [], pictures: [], shown: null });
  });
});
