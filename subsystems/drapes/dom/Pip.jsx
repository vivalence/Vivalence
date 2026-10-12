import { mergeProps } from "solid-js";

const TONES = {
  primary: "var(--signal-primary)",
  warning: "var(--signal-caution)",
  danger: "var(--signal-negative)",
  success: "var(--signal-positive)",
  contrast: "var(--text-strong)",
  muted: "var(--text-muted)",
};

export const Pip = (props) => {
  const held = mergeProps({ size: 6, tone: "muted", pulse: false, glow: false }, props);
  return (
    <span
      class="kit-pip"
      classList={{ "kit-pip-pulse": held.pulse, "kit-pip-glow": held.glow }}
      data-tone={held.tone}
      style={{ "--pip-size": `${held.size}px`, "--pip-color": TONES[held.tone] }}
    />
  );
};

export const style = `
.kit-pip {
  display: inline-block;
  width: var(--pip-size);
  height: var(--pip-size);
  border-radius: var(--shape-radius-full);
  background: var(--pip-color);
  flex: none;
}
.kit-pip-pulse {
  animation: kit-pip-pulse 1.8s ease-in-out infinite;
}
.kit-pip-glow {
  box-shadow: 0 0 6px var(--pip-color);
}
@keyframes kit-pip-pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.95;
  }
}
`;
