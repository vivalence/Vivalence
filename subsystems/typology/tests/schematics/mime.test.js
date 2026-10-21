import { mime, Path, specimen } from "@vivalence/typology";

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
