import { mergeProps } from "solid-js";

export const Row = (props) => {
  const held = mergeProps({ key: "", name: "", value: "", selected: false, off: false }, props);
  return (
    <button class={["krow", held.off && "off", held.selected && "sel"].filter((word) => word).join(" ")} onClick={(event) => held.onPick && held.onPick(event)}>
      <span class="key">{held.key}</span>
      <span class="nm">{held.name}</span>
      <span class="val">
        {held.value}
        {held.children}
      </span>
    </button>
  );
};
