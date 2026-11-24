import { specimen, v } from "@vivalence/typology";

const { Channel, Channels, Faculty } = v.primitives.hallucination;

const faults = (schema, value) => [...v.faults(schema, value)];

const refused = (schema, value) => faults(schema, value).length > 0;

const ear = {
  type: "verbatim",
  id: "nova-3",
  tune: [0.9, 0.2, 0.9],
  channels: {
    stream: {
      in: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
      out: [{ type: "text" }],
      via: () => {},
    },
    render: {
      in: [
        {
          type: "audio",
          mime: ["audio/ogg", "audio/mpeg", "audio/mp4", "audio/aac"],
          bytes: 26214400,
        },
      ],
      out: [{ type: "text" }],
      via: () => {},
    },
  },
};

const painter = {
  type: "picture",
  id: "openai/gpt-image-2",
  tune: [0.5, 0.5, 0.5],
  channels: {
    render: {
      in: [{ type: "text" }, { type: "image", mime: ["image/png", "image/jpeg"], count: 16 }],
      out: [{ type: "image", mime: ["image/png"] }],
      via: () => {},
    },
  },
};

specimen.describe("Channel — one kind a faculty takes or gives", () => {
  specimen.it("a kind alone is a channel: every media type, any size, any count", () => {
    specimen.expect(faults(Channel, { type: "text" })).toEqual([]);
  });

  specimen.it("mime lists media types, parameters included", () => {
    const channel = { type: "audio", mime: ["audio/ogg;codecs=opus"] };
    specimen.expect(faults(Channel, channel)).toEqual([]);
  });

  specimen.it("bytes bounds one part, count bounds the parts of a request", () => {
    specimen.expect(faults(Channel, { type: "image", bytes: 5242880, count: 16 })).toEqual([]);
    specimen.expect(faults(Channel, { type: "image", count: 0 })).toEqual([]);
  });

  specimen.it("refuses a kind that is no part, a mime that is no media type, zero bytes", () => {
    specimen.expect(refused(Channel, { type: "file" })).toBe(true);
    specimen.expect(refused(Channel, { type: "audio", mime: ["pcm_16000"] })).toBe(true);
    specimen.expect(refused(Channel, { type: "audio", mime: "audio/ogg" })).toBe(true);
    specimen.expect(refused(Channel, { type: "image", bytes: 0 })).toBe(true);
  });

  specimen.it("refuses a key of its own invention: rate, codec, codecs, packets", () => {
    for (const key of ["rate", "codec", "codecs", "packets"])
      specimen.expect([key, refused(Channel, { type: "audio", [key]: 1 })]).toEqual([key, true]);
  });

  specimen.it("refuses the old form, a bare kind", () => {
    specimen.expect(refused(Channel, "text")).toBe(true);
  });
});

specimen.describe("Channels — in, out and the call, by via", () => {
  specimen.it("one via, both vias, each with its own lists", () => {
    specimen.expect(faults(Channels, painter.channels)).toEqual([]);
    specimen.expect(faults(Channels, ear.channels)).toEqual([]);
  });

  specimen.it("a via with one side missing is refused", () => {
    const stream = { in: [{ type: "text" }], via: () => {} };
    specimen.expect(refused(Channels, { stream })).toBe(true);
  });

  specimen.it("a via without its call is refused, and the fault names the via", () => {
    const render = { in: [{ type: "text" }], out: [{ type: "text" }] };
    specimen.expect(faults(Channels, { render })).toEqual([
      { at: "/render", reason: "must have required properties via" },
    ]);
  });

  specimen.it("refuses the old form, in and out on the faculty", () => {
    specimen.expect(refused(Channels, { in: ["text"], out: ["text"] })).toBe(true);
  });

  specimen.it("refuses a via that does not exist", () => {
    specimen.expect(refused(Channels, { live: { in: [], out: [], via: () => {} } })).toBe(true);
  });
});

specimen.describe("Faculty — channels are part of what a faculty is, its vias inside", () => {
  specimen.it("a verbatim faculty of two vias, a painter of one", () => {
    specimen.expect(faults(Faculty, ear)).toEqual([]);
    specimen.expect(faults(Faculty, painter)).toEqual([]);
  });

  specimen.it("a faculty without channels is refused, and the fault names the key", () => {
    const { channels, ...bare } = ear;
    specimen.expect(faults(Faculty, bare)).toEqual([
      { at: "/", reason: "must have required properties channels" },
    ]);
  });

  specimen.it("a faculty that keeps via beside its channels still checks: the key is not read", () => {
    specimen.expect(faults(Faculty, { ...painter, via: { render: () => {} } })).toEqual([]);
  });

  specimen.it("a fault names its path down to the media type", () => {
    const render = {
      in: [{ type: "audio", mime: ["audio/ogg", "mp3_44100_128"] }],
      out: [],
      via: () => {},
    };
    specimen.expect(faults(Faculty, { ...ear, channels: { render } })).toEqual([
      {
        at: "/channels/render/in/0/mime/1",
        reason: "must be RFC 2045 media type with parameters (type/subtype;name=value)",
      },
    ]);
  });

  specimen.it("the source is not mutated", () => {
    specimen.expect(ear.channels.render.in[0].mime).toEqual([
      "audio/ogg",
      "audio/mpeg",
      "audio/mp4",
      "audio/aac",
    ]);
  });
});
