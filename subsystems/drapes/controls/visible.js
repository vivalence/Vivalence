const SETTLE = 350;

export function visible(node, options = {}) {
  let when = options.when ?? false;
  let block = options.block ?? "nearest";
  let timer = null;

  const show = () => node.scrollIntoView({ block, behavior: "smooth" });

  const later = () => {
    clearTimeout(timer);
    timer = setTimeout(show, SETTLE);
  };

  const viewport = globalThis.visualViewport;
  const focused = () => {
    later();
    viewport?.addEventListener("resize", later, { once: true });
  };

  node.addEventListener("focus", focused);
  if (when) later();

  return {
    update(next = {}) {
      block = next.block ?? block;
      const wanted = next.when ?? false;
      if (wanted && !when) later();
      when = wanted;
    },
    destroy() {
      clearTimeout(timer);
      node.removeEventListener("focus", focused);
      viewport?.removeEventListener("resize", later);
    },
  };
}
