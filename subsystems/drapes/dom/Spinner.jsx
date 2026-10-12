import { mergeProps } from "solid-js";

export const Spinner = (props) => {
  const held = mergeProps({ size: 12 }, props);
  return <span class="kit-spinner" style={{ "--spinner-size": `${held.size}px` }} />;
};

export const style = `
.kit-spinner {
  display: inline-block;
  width: var(--spinner-size);
  height: var(--spinner-size);
  box-sizing: border-box;
  border-radius: var(--shape-radius-full);
  border: 2px solid var(--signal-primary);
  border-right-color: transparent;
  animation: kit-spin 1s linear infinite;
}
@keyframes kit-spin {
  to {
    transform: rotate(360deg);
  }
}
`;
