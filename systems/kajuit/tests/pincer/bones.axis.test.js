import { specimen } from "@vivalence/typology";
import {
  A_SIDE,
  BONE_THICKNESS,
  axisFor,
  bonesForOrientation,
  rectsForOrientation,
} from "../../src/typology/stores/bridge/geometry.js";

const ORIENTATIONS = [0, 90, 180, 270];
const VIEWPORT = { width: 1200, height: 800 };
const PLACEMENTS = [150, 400, 700, 1000].flatMap((x) =>
  [120, 300, 500, 680].map((y) => ({ x, y })),
);

const bonesAt = (orientation, pincer) =>
  bonesForOrientation(orientation, pincer, VIEWPORT.width, VIEWPORT.height);

specimen.describe("bones.axis — a bone reads its own rect", () => {
  specimen.it("the two arms always share an axis, and the spine always crosses them", () => {
    for (const orientation of ORIENTATIONS) {
      for (const pincer of PLACEMENTS) {
        const bones = bonesAt(orientation, pincer);
        const where = `o=${orientation} pincer=(${pincer.x},${pincer.y})`;
        specimen.expect(`${where} ${axisFor(bones.crown)}`).toBe(`${where} ${axisFor(bones.shoulder)}`);
        specimen.expect(axisFor(bones.spine) === axisFor(bones.crown)).toBe(false);
      }
    }
  });

  specimen.it("matches the orientation table bonesForOrientation already implements", () => {
    const expected = {
      0: { shoulder: "row", crown: "row", spine: "column" },
      90: { shoulder: "column", crown: "column", spine: "row" },
      180: { shoulder: "row", crown: "row", spine: "column" },
      270: { shoulder: "column", crown: "column", spine: "row" },
    };
    for (const orientation of ORIENTATIONS) {
      for (const pincer of PLACEMENTS) {
        const bones = bonesAt(orientation, pincer);
        for (const bone of ["shoulder", "crown", "spine"]) {
          specimen
            .expect(`o=${orientation} ${bone} ${axisFor(bones[bone])}`)
            .toBe(`o=${orientation} ${bone} ${expected[orientation][bone]}`);
        }
      }
    }
  });

  specimen.it("the pincer bone is square, so it reads as a row", () => {
    for (const orientation of ORIENTATIONS) {
      const bones = bonesAt(orientation, PLACEMENTS[0]);
      specimen.expect(bones.pincer.width).toBe(BONE_THICKNESS);
      specimen.expect(bones.pincer.height).toBe(BONE_THICKNESS);
      specimen.expect(axisFor(bones.pincer)).toBe("row");
    }
  });

  specimen.it("A_SIDE names the edge panel A actually occupies", () => {
    const pincer = { x: 400, y: 300 };
    const edge = {
      top: (a) => a.top === 0 && a.width === VIEWPORT.width,
      bottom: (a) => a.top > 0 && a.width === VIEWPORT.width,
      left: (a) => a.left === 0 && a.height === VIEWPORT.height,
      right: (a) => a.left > 0 && a.height === VIEWPORT.height,
    };
    for (const orientation of ORIENTATIONS) {
      const a = rectsForOrientation(orientation, pincer, VIEWPORT.width, VIEWPORT.height).a;
      const side = A_SIDE[orientation];
      specimen.expect(`o=${orientation} ${side} ${edge[side](a)}`).toBe(`o=${orientation} ${side} true`);
    }
  });
});
