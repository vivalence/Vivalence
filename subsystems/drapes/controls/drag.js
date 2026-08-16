const SLOP = 8;
const HOLD = 220;

export function drag(node, options = {}) {
  let settings = options;
  let pointer = null;
  let origin = null;
  let armed = false;
  let dropped = false;
  let hold = null;
  let ghost = null;

  const targets = () => settings.targets ?? "[data-drop]";

  const under = (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    return element?.closest?.(targets()) ?? null;
  };

  const COPIED = ["color", "background-color", "border", "border-radius", "font", "padding", "display", "align-items", "gap", "box-sizing"];

  const lift = () => {
    const rect = node.getBoundingClientRect();
    const computed = getComputedStyle(node);
    ghost = node.cloneNode(true);
    for (const property of COPIED) ghost.style.setProperty(property, computed.getPropertyValue(property));
    ghost.style.position = "fixed";
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.margin = "0";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "1000";
    ghost.style.opacity = "0.92";
    ghost.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
    document.body.appendChild(ghost);
    node.classList.add("lifted");
  };

  const drop = () => {
    ghost?.remove();
    ghost = null;
    node.classList.remove("lifted");
  };

  const reset = () => {
    clearTimeout(hold);
    hold = null;
    if (armed) {
      node.removeEventListener("touchmove", block);
      node.removeEventListener("touchend", block);
      drop();
      settings.onend?.(settings.payload);
    }
    if (pointer != null && node.hasPointerCapture?.(pointer)) node.releasePointerCapture(pointer);
    pointer = null;
    origin = null;
    armed = false;
  };

  const arm = (event) => {
    clearTimeout(hold);
    hold = null;
    armed = true;
    node.setPointerCapture?.(pointer);
    node.addEventListener("touchmove", block, { passive: false });
    node.addEventListener("touchend", block, { passive: false });
    lift();
    settings.onstart?.(settings.payload, event);
  };

  const down = (event) => {
    if (pointer != null || event.button > 0) return;
    pointer = event.pointerId;
    origin = { x: event.clientX, y: event.clientY };
    if (event.pointerType !== "mouse") hold = setTimeout(() => arm(event), HOLD);
  };

  const move = (event) => {
    if (event.pointerId !== pointer) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (!armed) {
      if (Math.hypot(dx, dy) <= SLOP) return;
      if (event.pointerType === "mouse") arm(event);
      else return reset();
    }
    if (ghost) ghost.style.translate = `${dx}px ${dy}px`;
    settings.onmove?.(under(event), settings.payload, event);
  };

  const up = (event) => {
    if (event.pointerId !== pointer) return;
    if (armed) {
      dropped = true;
      settings.ondrop?.(under(event), settings.payload, event);
    }
    reset();
  };

  const cancel = (event) => {
    if (event.pointerId !== pointer) return;
    reset();
  };

  const block = (event) => {
    if (armed) event.preventDefault();
  };

  const swallow = (event) => {
    if (!dropped) return;
    dropped = false;
    event.preventDefault();
    event.stopPropagation();
  };

  node.style.userSelect = "none";
  node.style.webkitUserSelect = "none";
  node.style.webkitTouchCallout = "none";

  node.addEventListener("pointerdown", down);
  node.addEventListener("pointermove", move);
  node.addEventListener("pointerup", up);
  node.addEventListener("pointercancel", cancel);
  node.addEventListener("contextmenu", block);
  node.addEventListener("click", swallow, true);

  return {
    update(next = {}) {
      settings = next;
    },
    destroy() {
      reset();
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", cancel);
      node.removeEventListener("contextmenu", block);
      node.removeEventListener("click", swallow, true);
    },
  };
}
