import { mergeProps } from "solid-js";

export const Image = (props) => {
  const held = mergeProps({ alt: "", fit: "contain" }, props);
  return <img class="image" src={held.src} alt={held.alt} data-fit={held.fit} loading="lazy" />;
};
