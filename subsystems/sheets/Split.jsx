import { mergeProps } from "solid-js";
import { lookup } from "./lookup.js";

export const ALIGNS = {
  right: { direction: "row", edge: "left", axis: "width" },
  left: { direction: "row-reverse", edge: "right", axis: "width" },
  bottom: { direction: "column", edge: "top", axis: "height" },
  top: { direction: "column-reverse", edge: "bottom", axis: "height" },
};

export const align = (name) => lookup(ALIGNS, name, "dock align");

export const SHARE = { least: 20, most: 80 };

export const share = (value) => {
  if (!(value >= SHARE.least && value <= SHARE.most)) throw new Error(`[sheets] a share is ${SHARE.least}–${SHARE.most}, not ${JSON.stringify(value)}`);
  return value;
};

export const Split = (props) => {
  const held = mergeProps({ align: "right", share: 42, dragging: false }, props);
  return (
    <box style={{ flexDirection: align(held.align).direction, flexGrow: 1 }}>
      <box style={{ flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>{held.frame}</box>
      <box
        style={{
          flexDirection: "column",
          overflow: "hidden",
          [align(held.align).axis]: `${share(held.share)}%`,
          border: [align(held.align).edge],
          borderColor: held.dragging ? held.palette.boundaryStrong : held.palette.boundary,
        }}
      >
        {held.dock}
      </box>
    </box>
  );
};
