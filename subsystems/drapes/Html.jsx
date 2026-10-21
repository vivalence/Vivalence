import { mergeProps } from "solid-js";

export const Html = (props) => {
  const held = mergeProps({ title: "html" }, props);
  return <iframe class="html" sandbox="" srcdoc={held.html} title={held.title} />;
};
