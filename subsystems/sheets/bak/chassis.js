import { BoxRenderable } from "@opentui/core";
import { tokens } from "@vivalence/dapper";

export const TERRITORY = { crown: "0", navigation: "0", dock: "2", frame: "1", cover: "1" };

export const SLOTS = { crown: "crown", navigation: "navigation", dock: "dock", frame: "frame", signin: "cover" };

export const RAIL = 24;

const AXES = { true: ["width", "height"], false: ["height", "width"] };

export const chassis = (renderer, theme) => {
  const palettes = Object.fromEntries(Object.entries(TERRITORY).map(([slot, zone]) => [slot, tokens(theme, zone)]));
  const box = (id, style) => new BoxRenderable(renderer, { id: `chassis-${id}`, flexDirection: "column", ...style });
  const whole = box("whole", { width: "100%", height: "100%", backgroundColor: palettes.frame.surface });
  const body = box("body", { flexDirection: "row", flexGrow: 1 });
  const stage = box("stage", { flexDirection: "row", flexGrow: 1 });
  const slots = {
    crown: box("crown", { height: 1, flexShrink: 0, backgroundColor: palettes.crown.inverse }),
    navigation: box("navigation", {
      width: RAIL,
      flexShrink: 0,
      backgroundColor: palettes.navigation.surface,
      border: ["right"],
      borderColor: palettes.navigation.boundary,
    }),
    frame: box("frame", { flexGrow: 1, backgroundColor: palettes.frame.surface }),
    dock: box("dock", { flexGrow: 1, backgroundColor: palettes.dock.surface }),
    cover: box("cover", { flexGrow: 1, backgroundColor: palettes.cover.surface }),
  };
  stage.add(slots.frame);
  stage.add(slots.dock);
  stage.add(slots.cover);
  body.add(slots.navigation);
  body.add(stage);
  whole.add(slots.crown);
  whole.add(body);
  renderer.root.add(whole);

  const place = (layout) => {
    const shown = (pane) => layout.panes.includes(pane);
    const covered = shown("signin");
    const framed = !covered && shown("frame") && layout.buffer;
    const docked = !covered && shown("dock") && !(framed && layout.dock.full);
    const [axis, across] = AXES[layout.dock.vertical];
    slots.crown.visible = shown("crown");
    slots.navigation.visible = shown("navigation");
    slots.cover.visible = covered;
    slots.frame.visible = framed;
    slots.dock.visible = docked;
    stage.flexDirection = layout.dock.direction;
    slots.dock[across] = "auto";
    slots.dock.flexGrow = framed ? 0 : 1;
    slots.dock[axis] = framed ? layout.dock.size : "auto";
  };

  return { renderer, whole, slots, palettes, place };
};
