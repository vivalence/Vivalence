import { mergeProps, Show } from "solid-js";

export const MARK = "/images/pictogram_viket/pic-vinca-viket_white.svg";

export const Logo = (props) => {
  const held = mergeProps({ size: 48, word: true, mark: MARK }, props);
  return (
    <span class="kit-logo" style={{ "--logo-size": `${held.size}px`, "--logo-mark": `url(${held.mark})` }}>
      <span class="kit-logo-mark" role="img" aria-label="vivalence" />
      <Show when={held.word}>
        <span class="kit-logo-word">vivalence</span>
      </Show>
    </span>
  );
};

export const style = `
.kit-logo {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--logo-size) * 0.3);
  color: var(--text-header);
}
.kit-logo-mark {
  flex: none;
  width: var(--logo-size);
  height: var(--logo-size);
  background: currentColor;
  filter: var(--brand-filter);
  -webkit-mask: var(--logo-mark) center / contain no-repeat;
  mask: var(--logo-mark) center / contain no-repeat;
}
.kit-logo-word {
  font-family: var(--font-family-brand);
  font-size: calc(var(--logo-size) * 0.6);
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
}
`;
