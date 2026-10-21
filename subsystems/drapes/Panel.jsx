import { mergeProps } from "solid-js";

export const Panel = (props) => {
  const held = mergeProps({ tag: "", crumb: "", hint: "" }, props);
  return (
    <>
      <div class="ph">
        <span class="tag">{held.tag}</span>
        <span class="crumb">{held.crumb}</span>
        <span class="hint">{held.hint}</span>
      </div>
      {held.children}
    </>
  );
};
