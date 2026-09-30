import { specimen } from "@vivalence/typology";
import { FakeTime } from "jsr:@std/testing@1.0/time";
import { Bridge } from "../../src/typology/stores/bridge/bridge.js";
import { Gesture } from "../../src/typology/stores/bridge/gesture.js";

const { describe, it, expect } = specimen;

const capture = { setPointerCapture() {}, releasePointerCapture() {} };
const at = (x, y) => ({ pointerId: 1, clientX: x, clientY: y, timeStamp: Date.now(), currentTarget: capture, preventDefault() {}, stopPropagation() {} });

const walk = (layout, script) => {
  const bridge = new Bridge();
  Object.assign(bridge.layout, {
    viewport: { width: 1200, height: 800 },
    pincer: { x: 400, y: 300 },
    previous: { x: 400, y: 300, orientation: 0 },
    standard: { x: 22.5, y: 777.5, orientation: 0 },
    orientation: 0,
    ...layout,
  });
  bridge.view.snap = false;
  const saves = [];
  bridge.save = () => saves.push(bridge.layout.toJSON());
  const time = new FakeTime();
  try {
    script({ bridge, gesture: new Gesture(bridge), time, saves });
  } finally {
    time.restore();
  }
};

const taps = ({ gesture, time }, count) => {
  for (let index = 0; index < count; index++) {
    gesture.down(at(10, 10));
    time.tick(40);
    gesture.up(at(10, 10));
    time.tick(40);
  }
  time.tick(300);
};

const hold = ({ gesture, time }, x, y) => {
  gesture.down(at(x, y));
  time.tick(430);
};

describe("pincer gesture — what the chassis already does", () => {
  it("one tap sends the joint home, two swap it back, three make the spot home — each spot carries its turn", () => {
    walk({ standard: { x: 22.5, y: 777.5, orientation: 270 } }, (held) => {
      taps(held, 1);
      expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 777.5 });
      expect(held.bridge.layout.orientation).toBe(270);
      expect(held.bridge.layout.previous).toEqual({ x: 400, y: 300, orientation: 0 });
      taps(held, 2);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      expect(held.bridge.layout.orientation).toBe(0);
      expect(held.bridge.layout.previous).toEqual({ x: 22.5, y: 777.5, orientation: 270 });
      taps(held, 3);
      expect(held.bridge.layout.standard).toEqual({ x: 400, y: 300, orientation: 0 });
      expect(held.saves.length).toBe(3);
    });
  });

  it("a drag moves the joint by the pointer's travel, clamped to the edge padding, and records where it came from", () => {
    walk({}, (held) => {
      held.gesture.down(at(400, 300));
      held.gesture.move(at(500, 350));
      expect(held.bridge.layout.pincer).toEqual({ x: 500, y: 350 });
      held.gesture.move(at(5000, -100));
      expect(held.bridge.layout.pincer).toEqual({ x: 1177.5, y: 22.5 });
      held.gesture.up(at(5000, -100));
      expect(held.bridge.layout.previous).toEqual({ x: 400, y: 300, orientation: 0 });
      expect(held.gesture.dragging).toBe(false);
      expect(held.saves.length).toBe(1);
    });
  });

  it("with snap on, a drag lands on the grid within its reach", () => {
    walk({}, (held) => {
      held.bridge.view.snap = true;
      held.gesture.down(at(400, 300));
      held.gesture.move(at(590, 390));
      expect(held.bridge.layout.pincer).toEqual({ x: 600, y: 400 });
    });
  });

  it("a drag past 8 px before the hold fires never opens the radial", () => {
    walk({}, (held) => {
      held.gesture.down(at(400, 300));
      held.time.tick(100);
      held.gesture.move(at(420, 300));
      held.time.tick(500);
      expect(held.gesture.longPress).toBe(false);
      expect(held.gesture.radial.show).toBe(false);
    });
  });

  it("a hold opens the radial on the spoke of the current orientation", () => {
    walk({ orientation: 0 }, (held) => {
      hold(held, 400, 300);
      expect(held.gesture.longPress).toBe(true);
      expect(held.gesture.radial.show).toBe(true);
      expect(held.gesture.radial.sticky).toBe(false);
      expect(held.gesture.radial.snap).toBe(90);
    });
  });

  it("a hold released near its centre locks the radial open and leaves the layout", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.up(at(405, 302));
      expect(held.gesture.radial.sticky).toBe(true);
      expect(held.gesture.radial.show).toBe(true);
      expect(held.bridge.layout.orientation).toBe(0);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
    });
  });

  it("a hold pulled out and released turns the chassis toward the pull", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.move(at(600, 300));
      held.gesture.up(at(600, 300));
      expect(held.bridge.layout.orientation).toBe(90);
      expect(held.gesture.radial.show).toBe(false);
      expect(held.saves.length).toBe(1);
    });
  });

  it("a sticky radial takes a spoke; a closed one ignores it", () => {
    walk({}, (held) => {
      held.gesture.spoke(at(0, 0), 180);
      expect(held.bridge.layout.orientation).toBe(0);
      hold(held, 400, 300);
      held.gesture.up(at(400, 300));
      held.gesture.spoke(at(0, 0), 180);
      expect(held.bridge.layout.orientation).toBe(270);
      expect(held.gesture.radial.show).toBe(false);
    });
  });

  it("the backdrop closes a sticky radial, and a tap on the joint while it is open is swallowed", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.up(at(400, 300));
      taps(held, 1);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      held.gesture.backdrop();
      expect(held.gesture.radial.show).toBe(false);
      expect(held.gesture.radial.sticky).toBe(false);
    });
  });
});

const rim = (x, y, angle, length) => at(x + Math.cos((angle * Math.PI) / 180) * length, y + Math.sin((angle * Math.PI) / 180) * length);

const sticky = (held) => {
  hold(held, 400, 300);
  held.gesture.up(at(400, 300));
};

describe("pincer gesture — the comp's pull, tiles, lock and home", () => {
  it("a pull past the ring turns the chassis and carries the joint along it, live; the dead zone puts it back; the ring turns alone", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.move(at(400, 550));
      expect(held.bridge.layout.orientation).toBe(0);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 777.5 });
      held.gesture.move(at(402, 305));
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      held.gesture.move(at(500, 300));
      expect(held.bridge.layout.orientation).toBe(90);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      expect(held.gesture.radial.rotate).toBe(true);
      held.gesture.up(at(500, 300));
      expect(held.gesture.radial.show).toBe(false);
      expect(held.bridge.layout.orientation).toBe(90);
      expect(held.saves.length).toBe(1);
    });
  });

  it("a short pull inside the ring shrinks the stage, and the hot mini previews exactly the live placement", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.move(at(400, 360));
      const pincer = held.bridge.layout.pincer;
      expect(pincer.x).toBe(400);
      expect(pincer.y < 300).toBe(true);
      expect(held.gesture.preview(90)).toEqual(pincer);
    });
  });

  it("a pull onto a rim tile lights it, keeps the layout, and flips its flag on release", () => {
    for (const [name, angle] of [["snap", 315], ["hair", 225], ["full", 135]]) {
      walk({}, (held) => {
        const before = held.bridge.view[name];
        hold(held, 400, 300);
        held.gesture.move(rim(400, 300, angle, 80));
        expect(held.gesture.radial.toggle).toBe(name);
        expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
        expect(held.bridge.layout.orientation).toBe(0);
        held.gesture.up(rim(400, 300, angle, 80));
        expect(held.bridge.view[name]).toBe(!before);
        expect(held.gesture.radial.show).toBe(false);
        expect(held.saves.length).toBe(1);
      });
    }
  });

  it("a sticky radial's tiles flip their flags; the centre locks the joint, and a locked joint neither drags, jumps nor turns", () => {
    walk({}, (held) => {
      sticky(held);
      held.gesture.tile(at(0, 0), "hair");
      expect(held.bridge.view.hair).toBe(true);
      expect(held.gesture.radial.show).toBe(false);
      sticky(held);
      held.gesture.lock(at(0, 0));
      expect(held.bridge.layout.locked).toBe(true);
      held.gesture.down(at(400, 300));
      held.gesture.move(at(500, 350));
      held.gesture.up(at(500, 350));
      taps(held, 1);
      hold(held, 400, 300);
      held.gesture.move(at(650, 300));
      held.gesture.up(at(650, 300));
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      expect(held.bridge.layout.orientation).toBe(0);
      hold(held, 400, 300);
      held.gesture.move(rim(400, 300, 315, 80));
      expect(held.gesture.radial.toggle).toBe("snap");
    });
  });

  it("a spoke from a sticky radial keeps the stage's share of its axis, and its mini says so first", () => {
    walk({}, (held) => {
      sticky(held);
      expect(held.gesture.preview(0)).toEqual({ x: 438.75, y: 300 });
      held.gesture.spoke(at(0, 0), 0);
      expect(held.bridge.layout.orientation).toBe(90);
      expect(held.bridge.layout.pincer).toEqual({ x: 438.75, y: 300 });
    });
  });

  it("the home handle drags the standard only while the radial is locked open, and keeps its turn", () => {
    walk({ standard: { x: 22.5, y: 777.5, orientation: 270 } }, (held) => {
      held.gesture.homeDown(at(22.5, 777.5));
      held.gesture.homeMove(at(122.5, 677.5));
      expect(held.bridge.layout.standard).toEqual({ x: 22.5, y: 777.5, orientation: 270 });
      sticky(held);
      held.gesture.homeDown(at(22.5, 777.5));
      held.gesture.homeMove(at(322.5, 577.5));
      held.gesture.homeUp(at(322.5, 577.5));
      expect(held.bridge.layout.standard).toEqual({ x: 322.5, y: 577.5, orientation: 270 });
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      expect(held.saves.length).toBe(1);
    });
  });

  it("a tap on the home handle sends the joint home with its turn and closes the radial; a jitter under 8 px is still a tap", () => {
    walk({ standard: { x: 22.5, y: 777.5, orientation: 270 } }, (held) => {
      sticky(held);
      held.gesture.homeDown(at(22.5, 777.5));
      held.gesture.homeMove(at(26, 781));
      held.gesture.homeUp(at(26, 781));
      expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 777.5 });
      expect(held.bridge.layout.orientation).toBe(270);
      expect(held.bridge.layout.standard).toEqual({ x: 22.5, y: 777.5, orientation: 270 });
      expect(held.bridge.layout.previous).toEqual({ x: 400, y: 300, orientation: 0 });
      expect(held.gesture.radial.show).toBe(false);
      expect(held.gesture.flash).toBe("tap1");
      expect(held.saves.length).toBe(1);
    });
  });

  it("a locked joint refuses the home handle's tap with the caution flash and stays put", () => {
    walk({ locked: true, standard: { x: 22.5, y: 777.5, orientation: 270 } }, (held) => {
      sticky(held);
      held.gesture.homeDown(at(22.5, 777.5));
      held.gesture.homeUp(at(22.5, 777.5));
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      expect(held.bridge.layout.orientation).toBe(0);
      expect(held.gesture.radial.show).toBe(false);
      expect(held.gesture.flash).toBe("tap3");
      expect(held.saves.length).toBe(0);
    });
  });

  it("in full stage one tap brings the chassis back, two keep the joint awake, and far from the joint it dozes", () => {
    walk({}, (held) => {
      held.bridge.view.full = true;
      held.gesture.sense({ clientX: 1000, clientY: 700, pointerType: "mouse" });
      held.time.tick(700);
      expect(held.gesture.hidden).toBe(true);
      held.gesture.sense({ clientX: 410, clientY: 310, pointerType: "mouse" });
      expect(held.gesture.hidden).toBe(false);
      taps(held, 2);
      held.gesture.sense({ clientX: 1000, clientY: 700, pointerType: "mouse" });
      held.time.tick(700);
      expect(held.gesture.hidden).toBe(false);
      taps(held, 1);
      expect(held.bridge.view.full).toBe(false);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
    });
  });

  it("the radial measures from where the joint is drawn, the safe-area offset included", () => {
    walk({}, (held) => {
      held.bridge.$viewportOffsetTop.set(47);
      hold(held, 400, 347);
      held.gesture.move(at(400, 350));
      held.gesture.up(at(400, 350));
      expect(held.gesture.radial.sticky).toBe(true);
      expect(held.gesture.radial.anchor).toEqual({ x: 400, y: 347 });
    });
  });

  it("a cancelled pull puts the layout back and saves nothing", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.move(at(400, 550));
      held.gesture.up({ ...at(400, 550), type: "pointercancel" });
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 300 });
      expect(held.bridge.layout.orientation).toBe(0);
      expect(held.gesture.radial.show).toBe(false);
      expect(held.saves.length).toBe(0);
    });
  });
});

describe("pincer gesture — at rest the walls take the joint within a twentieth of their axis", () => {
  it("a drag kept near a wall for the onset lands flush on it with the grid on or off; past that reach the grid or the pointer decides", () => {
    for (const snap of [false, true]) {
      walk({}, (held) => {
        held.bridge.view.snap = snap;
        held.gesture.down(at(400, 300));
        held.gesture.move(at(70, 55));
        expect(held.bridge.layout.pincer).toEqual({ x: 70, y: 55 });
        held.time.tick(120);
        held.gesture.move(at(70, 55));
        expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 22.5 });
        held.gesture.move(at(1140, 770));
        expect(held.bridge.layout.pincer).toEqual({ x: 1140, y: 770 });
        held.time.tick(120);
        held.gesture.move(at(1140, 770));
        expect(held.bridge.layout.pincer).toEqual({ x: 1177.5, y: 777.5 });
        held.gesture.move(at(90, 70));
        expect(held.bridge.layout.pincer).toEqual({ x: 90, y: 70 });
        held.gesture.move(at(160, 120));
        expect(held.bridge.layout.pincer).toEqual(snap ? { x: 156, y: 104 } : { x: 160, y: 120 });
      });
    }
  });

  it("a pull that sizes the stage to within a twentieth of a wall lands the bone flush on it, and the mini says so first", () => {
    walk({}, (held) => {
      hold(held, 400, 300);
      held.gesture.move(at(400, 336));
      expect(held.bridge.layout.orientation).toBe(0);
      expect(held.bridge.layout.pincer).toEqual({ x: 400, y: 22.5 });
      expect(held.gesture.preview(90)).toEqual({ x: 400, y: 22.5 });
    });
  });

  it("a spoke whose kept share lands within a twentieth of a wall lands flush on it", () => {
    walk({ pincer: { x: 400, y: 50 } }, (held) => {
      sticky(held);
      expect(held.gesture.preview(0)).toEqual({ x: 22.5, y: 50 });
      held.gesture.spoke(at(0, 0), 0);
      expect(held.bridge.layout.orientation).toBe(90);
      expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 50 });
    });
  });

  it("a home handle dropped within a twentieth of a wall lands flush on it", () => {
    walk({ standard: { x: 400, y: 500, orientation: 0 } }, (held) => {
      sticky(held);
      held.gesture.homeDown(at(400, 500));
      held.gesture.homeMove(at(1140, 760));
      held.gesture.homeUp(at(1140, 760));
      expect(held.bridge.layout.standard).toEqual({ x: 1177.5, y: 777.5, orientation: 0 });
    });
  });
});

describe("pincer gesture — a thrown joint: the faster it flies at a wall, the farther that wall reaches; in flight after an onset, at once when let go", () => {
  const fly = (held, points, every) => {
    for (const [x, y] of points) {
      held.time.tick(every);
      held.gesture.move(at(x, y));
    }
  };
  const course = (count) => Array.from({ length: count }, (_, index) => [600 - 25 * (index + 1), 400]);

  it("let go in flight at a wall, the joint flies on to it from across the stage", () => {
    for (const snap of [false, true]) {
      walk({ pincer: { x: 600, y: 400 } }, (held) => {
        held.bridge.view.snap = snap;
        held.gesture.down(at(600, 400));
        fly(held, course(4), 10);
        expect(held.bridge.layout.pincer).toEqual({ x: 500, y: 400 });
        held.gesture.up(at(500, 400));
        expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 400 });
        expect(held.bridge.layout.previous).toEqual({ x: 600, y: 400, orientation: 0 });
        expect(held.saves.length).toBe(1);
      });
    }
  });

  it("a burst at a wall that slows within the onset never jumps to it", () => {
    walk({ pincer: { x: 600, y: 400 } }, (held) => {
      held.gesture.down(at(600, 400));
      const shown = [];
      for (const [x, every] of [[575, 10], [550, 10], [525, 10], [520, 60], [518, 60]]) {
        held.time.tick(every);
        held.gesture.move(at(x, 400));
        shown.push(held.bridge.layout.pincer.x);
      }
      expect(shown).toEqual([575, 550, 525, 520, 518]);
    });
  });

  it("held on course for the onset, the wall takes the joint in flight and keeps it while the course holds", () => {
    walk({ pincer: { x: 600, y: 400 } }, (held) => {
      held.gesture.down(at(600, 400));
      fly(held, course(12), 10);
      expect(held.bridge.layout.pincer).toEqual({ x: 300, y: 400 });
      fly(held, [[275, 400]], 10);
      expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 400 });
    });
  });

  it("slowing off course frees the joint at once, and the drop keeps it where it stopped", () => {
    walk({ pincer: { x: 600, y: 400 } }, (held) => {
      held.gesture.down(at(600, 400));
      fly(held, course(13), 10);
      expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 400 });
      fly(held, [[273, 400]], 50);
      expect(held.bridge.layout.pincer).toEqual({ x: 273, y: 400 });
      held.gesture.up(at(273, 400));
      expect(held.bridge.layout.pincer).toEqual({ x: 273, y: 400 });
    });
  });

  it("the same travel at a walk stays under the pointer, through the drop", () => {
    walk({ pincer: { x: 600, y: 400 } }, (held) => {
      held.gesture.down(at(600, 400));
      fly(held, course(4), 50);
      expect(held.bridge.layout.pincer).toEqual({ x: 500, y: 400 });
      held.gesture.up(at(500, 400));
      expect(held.bridge.layout.pincer).toEqual({ x: 500, y: 400 });
    });
  });

  it("each axis flies on its own: let go on a throw down, the joint lands on the floor and keeps its x", () => {
    walk({ pincer: { x: 600, y: 200 } }, (held) => {
      held.gesture.down(at(600, 200));
      fly(held, [[600, 225]], 10);
      expect(held.bridge.layout.pincer).toEqual({ x: 600, y: 225 });
      held.gesture.up(at(600, 225));
      expect(held.bridge.layout.pincer).toEqual({ x: 600, y: 777.5 });
    });
  });

  it("a push off a wall frees the joint; the same spot reached at a walk lands flush on the drop", () => {
    walk({ pincer: { x: 40, y: 400 } }, (held) => {
      held.gesture.down(at(40, 400));
      fly(held, [[70, 400]], 30);
      held.gesture.up(at(70, 400));
      expect(held.bridge.layout.pincer).toEqual({ x: 70, y: 400 });
    });
    walk({ pincer: { x: 40, y: 400 } }, (held) => {
      held.gesture.down(at(40, 400));
      fly(held, [[70, 400]], 300);
      expect(held.bridge.layout.pincer).toEqual({ x: 70, y: 400 });
      held.gesture.up(at(70, 400));
      expect(held.bridge.layout.pincer).toEqual({ x: 22.5, y: 400 });
    });
  });
});
