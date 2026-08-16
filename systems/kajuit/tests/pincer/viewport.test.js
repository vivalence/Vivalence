import { specimen } from "@vivalence/typology";
import { Bridge, resize } from "../../src/typology/stores/bridge/bridge.js";

specimen.describe("bridge.viewport — resize writes only on change", () => {
  specimen.it("an unchanged viewport writes no store and reports false", () => {
    const bridge = new Bridge();
    const writes = [];
    bridge.layout.$viewport.listen((value) => writes.push(["viewport", value]));
    bridge.layout.$pincer.listen((value) => writes.push(["pincer", value]));
    bridge.$viewportOffsetTop.listen((value) => writes.push(["offsetTop", value]));

    specimen.expect(resize(bridge)).toBe(false);
    specimen.expect(resize(bridge)).toBe(false);
    specimen.expect(writes).toEqual([]);
  });

  specimen.it("a changed viewport writes once and reports true; an already-clamped pincer stays silent", () => {
    const bridge = new Bridge();
    bridge.layout.viewport = { width: 390, height: 700 };
    const writes = [];
    bridge.layout.$viewport.listen((value) => writes.push(["viewport", value]));
    bridge.layout.$pincer.listen((value) => writes.push(["pincer", value]));

    specimen.expect(resize(bridge)).toBe(true);
    specimen.expect(writes.map(([store]) => store)).toEqual(["viewport", "pincer"]);
    specimen.expect(writes[0][1]).toEqual({ width: 0, height: 0 });
    specimen.expect(resize(bridge)).toBe(false);
    specimen.expect(writes.length).toBe(2);
  });
});
