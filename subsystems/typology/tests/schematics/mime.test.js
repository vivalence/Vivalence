import { mime, Path, specimen, v } from "@vivalence/typology";

specimen.describe("mime.code · mime.viva · mime.VENDOR", () => {
  specimen.it("code: every dom.* and tty.* entry, and text/javascript", () => {
    for (const type of [...Object.values(mime.dom), ...Object.values(mime.tty), mime.javascript]) specimen.expect(mime.code(type)).toBe(true);
  });

  specimen.it("code: a buffer kind, a document, a picture, a bare viva subtype are not code", () => {
    for (const type of [mime.json, mime.markdown, mime.svg, mime.html, "application/vnd.viva.daemon.chess.mode.board.play+json", "application/vnd.viva.dom"])
      specimen.expect(mime.code(type)).toBe(false);
  });

  specimen.it("viva: a mode's reference mints its buffer kind", () => {
    specimen.expect(mime.viva(new Path("/daemon/chess").branch("/mode/board/play"))).toBe("application/vnd.viva.daemon.chess.mode.board.play+json");
    specimen.expect(mime.type().check(mime.viva(new Path("/runtime/local/mode/srs/memo")))).toBe(true);
  });

  specimen.it("VENDOR: every dom.* and tty.* entry and every minted kind sit under the one tree", () => {
    specimen.expect(mime.VENDOR).toBe("application/vnd.viva");
    for (const type of [...Object.values(mime.dom), ...Object.values(mime.tty), mime.viva(new Path("/runtime/local/mode/srs/memo"))]) specimen.expect(type.startsWith(`${mime.VENDOR}.`)).toBe(true);
  });
});

specimen.describe("mime.media — a media type that may carry parameters", () => {
  const taken = [
    "audio/ogg",
    "audio/ogg;codecs=opus",
    "audio/ogg; codecs=opus",
    "audio/pcm;rate=16000;channels=1",
    'audio/mp4; codecs="mp4a.40.2"',
    "application/vnd.viva.dom.svelte+javascript",
  ];
  const refused = [
    "ogg",
    "audio/",
    "audio/ogg;",
    "audio/ogg;codecs",
    "audio/ogg;codecs=",
    "sound/ogg",
    "audio/ogg codecs=opus",
  ];
  const checked = (value) => [value, mime.media().check(value)];

  specimen.it("takes a bare type, and a type with one or more name=value parameters", () => {
    for (const value of taken) specimen.expect(checked(value)).toEqual([value, true]);
  });

  specimen.it("refuses a parameter without a value, a trailing semicolon, an unknown type", () => {
    for (const value of refused) specimen.expect(checked(value)).toEqual([value, false]);
  });

  specimen.it("mime.type stays strict: of these it takes only the two without a parameter", () => {
    specimen.expect(taken.filter((value) => mime.type().check(value))).toEqual([
      "audio/ogg",
      "application/vnd.viva.dom.svelte+javascript",
    ]);
  });

  specimen.it("v.media is the same scalar", () => {
    specimen.expect(v.media().pattern).toBe(mime.MEDIA);
  });
});
