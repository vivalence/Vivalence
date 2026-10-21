import { mergeProps } from "solid-js";

export const Panel = (props) => {
  const held = mergeProps({ crumbs: "", hint: "" }, props);
  return (
    <box style={{ flexDirection: "column", backgroundColor: held.palette.surfaceLift, border: ["top"], borderColor: held.palette.boundary }}>
      <box style={{ flexDirection: "row", height: 1, justifyContent: "space-between", paddingLeft: 1, paddingRight: 1 }}>
        <box style={{ flexDirection: "row", gap: 2 }}>
          <text fg={held.palette.textStrong}>
            <b>{held.tag}</b>
          </text>
          <text fg={held.palette.signalPrimaryInk}>{held.crumbs}</text>
        </box>
        <text fg={held.palette.textMuted}>{held.hint}</text>
      </box>
      {held.children}
    </box>
  );
};
