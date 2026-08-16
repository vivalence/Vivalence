const FOCUSABLE = "input, textarea, select, a, [contenteditable], [data-loose]";
const PRESSABLE = "button, [role=button]";

export function persist(node, options = {}) {
  let active = options.active ?? true;
  let gesture = false;
  let touch = false;

  const settle = () => {
    if (!active || document.activeElement === node) return;
    node.focus({ preventScroll: true });
  };

  const drift = (event) => {
    if (!active || event.relatedTarget || gesture) return;
    settle();
  };

  const hold = (event) => {
    touch = event.pointerType !== "mouse";
    if (!active || event.target === node || event.target?.closest?.(FOCUSABLE)) return;
    if (!touch && !event.target?.closest?.(PRESSABLE)) {
      gesture = true;
      return;
    }
    event.preventDefault();
    settle();
  };

  const mouse = (event) => {
    if (!active || event.target === node || event.target?.closest?.(FOCUSABLE)) return;
    if (!touch && !event.target?.closest?.(PRESSABLE)) return;
    event.preventDefault();
  };

  const release = () => {
    if (!gesture) return;
    gesture = false;
    if (!document.getSelection()?.isCollapsed) return;
    settle();
  };

  node.addEventListener("blur", drift);
  document.addEventListener("pointerdown", hold, true);
  document.addEventListener("mousedown", mouse, true);
  document.addEventListener("pointerup", release, true);
  document.addEventListener("pointercancel", release, true);
  settle();

  return {
    update(next = {}) {
      active = next.active ?? true;
      gesture = false;
      settle();
    },
    destroy() {
      node.removeEventListener("blur", drift);
      document.removeEventListener("pointerdown", hold, true);
      document.removeEventListener("mousedown", mouse, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", release, true);
    },
  };
}
