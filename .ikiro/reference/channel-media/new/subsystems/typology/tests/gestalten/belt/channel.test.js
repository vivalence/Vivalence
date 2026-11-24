import { belt, specimen } from "@vivalence/typology";

const { match, lower, take, give } = belt.channel;

const file = { type: "audio", mime: ["audio/ogg", "audio/mpeg", "audio/mp4", "audio/aac"] };
const opus = { type: "audio", mime: ["audio/ogg;codecs=opus"] };
const live = { type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] };
const heard = (mime) => ({ type: "audio", mime, data: "AAAA" });

const ear = {
  type: "verbatim",
  id: "nova-3",
  channels: { render: { in: [file], out: [{ type: "text" }] } },
};

const mind = {
  type: "dialogue",
  id: "opus",
  channels: {
    stream: {
      in: [{ type: "text" }, { type: "image", mime: ["image/png"], bytes: 3, count: 1 }],
      out: [{ type: "text" }],
    },
  },
};

const thrown = (act) => {
  try {
    act();
  } catch (fault) {
    return fault.message;
  }
};

specimen.describe("channel.match — a part against one channel", () => {
  specimen.it("a mime in the channel's list matches", () => {
    specimen.expect(match(file, heard("audio/ogg"))).toBe(true);
    specimen.expect(match(file, heard("audio/mpeg"))).toBe(true);
  });

  specimen.it("a mime outside the list does not", () => {
    specimen.expect(match(file, heard("audio/amr"))).toBe(false);
  });

  specimen.it("a channel without parameters takes any parameter of its mime", () => {
    specimen.expect(match(file, heard("audio/ogg; codecs=opus"))).toBe(true);
    specimen.expect(match(file, heard("audio/ogg;codecs=vorbis"))).toBe(true);
  });

  specimen.it("a parameter on the channel refuses a part that declares another", () => {
    specimen.expect(match(opus, heard("audio/ogg; codecs=opus"))).toBe(true);
    specimen.expect(match(opus, heard("audio/ogg; codecs=vorbis"))).toBe(false);
    specimen.expect(match(opus, heard('audio/ogg; codecs="opus, vorbis"'))).toBe(false);
  });

  specimen.it("a part that declares no parameter passes a channel that names one", () => {
    specimen.expect(match(opus, heard("audio/ogg"))).toBe(true);
  });

  specimen.it("audio/pcm matches on rate and on channel count", () => {
    specimen.expect(match(live, heard("audio/pcm;rate=16000;channels=1"))).toBe(true);
    specimen.expect(match(live, heard("audio/pcm;rate=44100;channels=1"))).toBe(false);
    specimen.expect(match(live, heard("audio/pcm;rate=16000;channels=2"))).toBe(false);
  });

  specimen.it("the kind first; a channel without mime takes every part of its kind", () => {
    specimen.expect(match({ type: "audio" }, heard("audio/amr"))).toBe(true);
    specimen.expect(match({ type: "image" }, heard("audio/ogg"))).toBe(false);
    specimen.expect(match(file, { type: "audio" })).toBe(false);
  });
});

specimen.describe("channel.take · lower · give — a faculty's side on one via", () => {
  specimen.it("take: a source the faculty lacks faults: faculty, format, what it takes", () => {
    specimen.expect(thrown(() => take(ear, "render", [heard("audio/amr")]))).toBe(
      "[verbatim] 'nova-3' takes no 'audio/amr' audio on render: " +
        "it takes audio/ogg, audio/mpeg, audio/mp4, audio/aac",
    );
    specimen.expect(take(ear, "render", [heard("audio/ogg; codecs=opus")])).toHaveLength(1);
  });

  specimen.it("lower: a file part the faculty lacks becomes one line of text", () => {
    const voice = { ...heard("audio/ogg; codecs=opus"), file: "01a1b1c0" };
    specimen.expect(lower(mind, "stream", [{ type: "text", text: "listen" }, voice])).toEqual([
      { type: "text", text: "listen" },
      {
        type: "text",
        text:
          "[attached audio · file 01a1b1c0 · audio/ogg; codecs=opus · 3 bytes · " +
          "opus cannot read audio]",
      },
    ]);
  });

  specimen.it("lower: the size reads in bytes, kB and MB", () => {
    const sized = (length) =>
      lower(mind, "stream", [{ ...heard("audio/ogg"), data: "A".repeat(length), file: "f" }])[0]
        .text.split(" · ")[3];
    specimen.expect([4, 24000, 3000000].map(sized)).toEqual(["3 bytes", "18 kB", "2.1 MB"]);
  });

  specimen.it("lower: a part with no file and no channel faults, never stringified", () => {
    specimen.expect(thrown(() => lower(mind, "stream", [heard("audio/ogg")]))).toBe(
      "[dialogue] 'opus' takes no 'audio/ogg' audio on stream: it takes text, image/png",
    );
  });

  specimen.it("more parts than a channel's count fault; so does one part over its bytes", () => {
    const pixel = { type: "image", mime: "image/png", data: "AAAA" };
    specimen.expect(thrown(() => take(mind, "stream", [pixel, pixel]))).toBe(
      "[dialogue] 'opus' takes at most 1 image/png on stream: 2 given",
    );
    specimen.expect(thrown(() => take(mind, "stream", [{ ...pixel, data: "AAAAAAAA" }]))).toBe(
      "[dialogue] 'opus' takes at most 3 bytes of image/png on stream: 6 given",
    );
    specimen.expect(take(mind, "stream", [pixel])).toEqual([pixel]);
  });

  specimen.it("give: a part the faculty did not declare faults", () => {
    specimen.expect(give(mind, "stream", { type: "text", text: "ciao" })).toEqual({
      type: "text",
      text: "ciao",
    });
    specimen.expect(thrown(() => give(mind, "stream", { type: "tool_use", id: "t1" }))).toBe(
      "[dialogue] 'opus' gives no 'tool_use' tool_use on stream: it gives text",
    );
  });

  specimen.it("an alien part passes both ways: it is the provider's own block", () => {
    const alien = { type: "alien", dialect: "anthropic", block: {} };
    specimen.expect(lower(mind, "stream", [alien])).toEqual([alien]);
    specimen.expect(give(mind, "stream", alien)).toBe(alien);
  });

  specimen.it("the parts are not mutated", () => {
    const voice = { ...heard("audio/ogg"), file: "01a1b1c0" };
    const parts = [voice];
    lower(mind, "stream", parts);
    specimen.expect(parts).toEqual([
      { type: "audio", mime: "audio/ogg", data: "AAAA", file: "01a1b1c0" },
    ]);
    specimen.expect(parts[0]).toBe(voice);
  });
});
