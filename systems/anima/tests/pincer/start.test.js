import { specimen } from "@vivalence/typology";
import { HALF, rectsForOrientation } from "../../src/typology/stores/bridge/geometry.js";
import { SCREENS, screenOf, startFor } from "../../src/typology/stores/bridge/start.js";

const DESK = { width: 1440, height: 900 };
const TABLET = { width: 834, height: 1194 };
const PHONE = { width: 390, height: 844 };

const rects = ({ width, height }, { pincer, orientation }) => rectsForOrientation(orientation, pincer, width, height);

specimen.describe("bridge.start — the screen rule", () => {
  specimen.it("a width under the phone line is a phone, under the tablet line or taller than wide a tablet, else a desk", () => {
    specimen.expect(screenOf(PHONE)).toBe("phone");
    specimen.expect(screenOf({ width: SCREENS.phone - 1, height: 400 })).toBe("phone");
    specimen.expect(screenOf(TABLET)).toBe("tablet");
    specimen.expect(screenOf({ width: SCREENS.tablet - 1, height: 600 })).toBe("tablet");
    specimen.expect(screenOf({ width: 1200, height: 1600 })).toBe("tablet");
    specimen.expect(screenOf(DESK)).toBe("desk");
  });
});

specimen.describe("bridge.start — the comp's first paint per screen", () => {
  specimen.it("desk: C is a 400 px rail on the left, the stage on the right, B at zero; home is the full stage", () => {
    const placed = startFor(DESK);
    specimen.expect(placed.orientation).toBe(270);
    specimen.expect(placed.pincer).toEqual({ x: 400 + HALF, y: HALF });
    const { a, b, c } = rects(DESK, placed);
    specimen.expect(c.left).toBe(0);
    specimen.expect(c.width).toBe(400);
    specimen.expect(c.height).toBe(DESK.height - HALF * 2);
    specimen.expect(b.height).toBe(0);
    specimen.expect(a.left).toBe(400 + HALF * 2);
    specimen.expect(a.height).toBe(DESK.height);
    const home = rects(DESK, { pincer: placed.standard, orientation: placed.standard.orientation });
    specimen.expect(home.a.width).toBe(DESK.width - HALF * 2);
    specimen.expect([home.b.width, home.c.width]).toEqual([0, 0]);
  });

  specimen.it("tablet: the stage on top, C the bottom half, B at zero; home is the full stage", () => {
    const placed = startFor(TABLET);
    specimen.expect(placed.orientation).toBe(0);
    specimen.expect(placed.pincer).toEqual({ x: HALF, y: TABLET.height / 2 });
    const { a, b, c } = rects(TABLET, placed);
    specimen.expect(a.top).toBe(0);
    specimen.expect(a.height).toBe(TABLET.height / 2 - HALF);
    specimen.expect(b.width).toBe(0);
    specimen.expect(c.left).toBe(HALF * 2);
    specimen.expect(c.width).toBe(TABLET.width - HALF * 2);
    const home = rects(TABLET, { pincer: placed.standard, orientation: placed.standard.orientation });
    specimen.expect(home.a.height).toBe(TABLET.height - HALF * 2);
    specimen.expect([home.b.height, home.c.height]).toEqual([0, 0]);
  });

  specimen.it("phone: C the top 300 px, the stage below, B at zero; home is the full stage", () => {
    const placed = startFor(PHONE);
    specimen.expect(placed.orientation).toBe(180);
    specimen.expect(placed.pincer).toEqual({ x: HALF, y: 300 + HALF });
    const { a, b, c } = rects(PHONE, placed);
    specimen.expect(c.top).toBe(0);
    specimen.expect(c.height).toBe(300);
    specimen.expect(c.width).toBe(PHONE.width - HALF * 2);
    specimen.expect(b.width).toBe(0);
    specimen.expect(a.top).toBe(300 + HALF * 2);
    const home = rects(PHONE, { pincer: placed.standard, orientation: placed.standard.orientation });
    specimen.expect(home.a.height).toBe(PHONE.height - HALF * 2);
    specimen.expect([home.b.height, home.c.height]).toEqual([0, 0]);
  });

  specimen.it("desk starts the rail in the free fold, tablet and phone on the page fold", () => {
    specimen.expect([startFor(DESK).fold, startFor(TABLET).fold, startFor(PHONE).fold]).toEqual(["free", "page", "page"]);
  });

  specimen.it("a viewport too small for the comp's pixels clamps the pincer inside the edge padding", () => {
    specimen.expect(startFor({ width: 300, height: 200 }).pincer).toEqual({ x: HALF, y: 200 - HALF });
    specimen.expect(startFor({ width: 0, height: 0 }).pincer).toEqual({ x: HALF, y: HALF });
  });
});
